import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockAiAiIntermediateStep,
  mockAiAiIntermediateStep2,
  mockAiAiResponse,
  mockAiContextRepository,
  mockAiDatabaseId,
  mockAiHistory,
  mockAiIndex, mockAiIndexContext,
  mockAiMessageRepository,
  mockAiProvider,
  mockCloudUserApiService,
  mockDatabaseClientFactory,
  mockSendAiChatMessageDto,
  mockSessionMetadata,
  mockStandaloneRedisClient,
  mockAiAgreementRepository,
  MockType,
} from 'src/__mocks__';
import { LocalAiAuthProvider } from 'src/modules/ai/providers/auth/local.ai-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { AiService } from 'src/modules/ai/ai.service';
import { AiProvider } from 'src/modules/ai/providers/ai.provider';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { AiAuthProvider } from 'src/modules/ai/providers/auth/ai-auth.provider';
import { AiMessageRepository } from 'src/modules/ai/repositories/ai.message.repository';
import { AiContextRepository } from 'src/modules/ai/repositories/ai.context.repository';
import { AiServerErrors, AiWsEvents } from 'src/modules/ai/models';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { AiRateLimitRequestException } from 'src/modules/ai/exceptions';
import * as ContextUtil from './utils/context.util';
import { AiAgreementRepository } from './repositories/ai.agreement.repository';

describe('AiService', () => {
  let wsServer;
  let serverSocket;
  let clientSocket;
  let mockResponse;
  let httpServer;
  let service: AiService;
  let aiProvider: MockType<AiProvider>;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let aiContextRepository: MockType<AiContextRepository>;
  let aiAgreementRepository: MockType<AiAgreementRepository>;

  beforeAll((done) => {
    httpServer = createServer();
    wsServer = new Server(httpServer);
    httpServer.listen(() => {
      done();
    });
  });

  afterAll(() => {
    clientSocket.disconnect();
    serverSocket.disconnect();
    wsServer.close();
    httpServer.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AiProvider,
          useFactory: mockAiProvider,
        },
        {
          provide: AiAuthProvider,
          useClass: LocalAiAuthProvider,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: AiMessageRepository,
          useFactory: mockAiMessageRepository,
        },
        {
          provide: AiContextRepository,
          useFactory: mockAiContextRepository,
        },
        {
          provide: AiAgreementRepository,
          useFactory: mockAiAgreementRepository,
        },
        {
          provide: AiMessageRepository,
          useFactory: mockAiMessageRepository,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
      ],
    }).compile();

    service = module.get(AiService);
    aiProvider = module.get(AiProvider);
    cloudUserApiService = module.get(CloudUserApiService);
    aiContextRepository = module.get(AiContextRepository);
    aiAgreementRepository = module.get(AiAgreementRepository);
  });

  describe('streamMessage', () => {
    let getIndexContextSpy;

    beforeEach((done) => {
      mockResponse = {
        content: '',
        write(chunk) {
          this.content += chunk;
        },
        end: jest.fn(),
        reset() {
          this.content = '';
        },
      };

      getIndexContextSpy = jest.spyOn(ContextUtil, 'getIndexContext');
      getIndexContextSpy.mockResolvedValue(mockAiIndexContext);

      clientSocket = io(`http://localhost:${(httpServer.address() as AddressInfo).port}`);
      wsServer.on('connection', (socket) => {
        serverSocket = socket;
      });

      aiProvider.getSocket.mockResolvedValue(clientSocket);

      clientSocket.on('connect', done);
    });

    afterEach(() => {
      expect(clientSocket.connected).toEqual(false);
    });

    it('should stream an answer', async () => {
      serverSocket.once(AiWsEvents.STREAM, (_content, _context, _history, _opts, cb) => {
        serverSocket.emit(AiWsEvents.REPLY_CHUNK, mockAiAiResponse.content);
        cb({ status: 'ok' });
      });

      await expect(service.streamMessage(
        mockSessionMetadata,
        mockAiDatabaseId,
        mockSendAiChatMessageDto,
        mockResponse as any,
      ))
        .resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiAiResponse.content);
    });
    it('should not fail in case of empty ack', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(['aggregate', 'results']);
      serverSocket.once(AiWsEvents.STREAM, (_content, _context, _history, _opts, cb) => {
        serverSocket.emit(AiWsEvents.TOOL_CALL, JSON.stringify(mockAiAiIntermediateStep));
        serverSocket.emit(AiWsEvents.TOOL_REPLY, JSON.stringify(mockAiAiIntermediateStep2));
        serverSocket.emitWithAck(AiWsEvents.GET_INDEX, mockAiIndex)
          .then((indexContext) => {
            expect(indexContext).toEqual(mockAiIndexContext);

            return serverSocket.emitWithAck(AiWsEvents.RUN_QUERY, ['ft.aggregate']);
          })
          .then((queryResult) => {
            expect(queryResult).toEqual(['aggregate', 'results']);
            serverSocket.emit(AiWsEvents.REPLY_CHUNK, mockAiAiResponse.content);
            cb();
          });
      });

      await expect(service.streamMessage(
        mockSessionMetadata,
        mockAiDatabaseId,
        mockSendAiChatMessageDto,
        mockResponse as any,
      ))
        .resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiAiResponse.content);
    });

    it('should calculate index and get from cache on 2nd attempt and send error on 3d attempt', async () => {
      serverSocket.once(AiWsEvents.STREAM, (_content, _context, _history, _opts, cb) => {
        aiContextRepository.getIndexContext.mockResolvedValueOnce(null);
        aiContextRepository.getIndexContext.mockResolvedValueOnce({ cached: 'cached' });
        aiContextRepository.getIndexContext.mockRejectedValueOnce(new Error('Something is wrong'));
        serverSocket.emitWithAck(AiWsEvents.GET_INDEX, mockAiIndex)
          .then((indexContext) => {
            // calculated
            expect(indexContext).toEqual(mockAiIndexContext);

            return serverSocket.emitWithAck(AiWsEvents.GET_INDEX, mockAiIndex);
          })
          .then((indexContext) => {
            // cached
            expect(indexContext).toEqual({ cached: 'cached' });

            return serverSocket.emitWithAck(AiWsEvents.GET_INDEX, mockAiIndex);
          })
          .then((error) => {
            // error
            expect(error).toEqual('Something is wrong');
            serverSocket.emit(AiWsEvents.REPLY_CHUNK, mockAiAiResponse.content);
            cb();
          });
      });

      await expect(service.streamMessage(
        mockSessionMetadata,
        mockAiDatabaseId,
        mockSendAiChatMessageDto,
        mockResponse as any,
      ))
        .resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiAiResponse.content);
    });

    it('should return errors for run queries', async () => {
      serverSocket.once(AiWsEvents.STREAM, (_content, _context, _history, _opts, cb) => {
        when(mockStandaloneRedisClient.sendCommand)
          .calledWith(expect.arrayContaining(['FT.AGGREGATE', 'BAD ARGS']), expect.anything())
          .mockRejectedValue(new Error('ERR: invalid command syntax'));

        serverSocket.emitWithAck(AiWsEvents.RUN_QUERY, ['FLUSHALL'])
          .then((result) => {
            // error due to white list
            expect(result).toEqual('-ERR: This command is not allowed');

            return serverSocket.emitWithAck(AiWsEvents.RUN_QUERY, null);
          })
          .then((result) => {
            // error due to white list when no query was sent
            expect(result).toEqual('-ERR: This command is not allowed');

            return serverSocket.emitWithAck(AiWsEvents.RUN_QUERY, ['FT.AGGREGATE', 'BAD ARGS']);
          })
          .then((result) => {
            // execution error
            expect(result).toEqual('ERR: invalid command syntax');
            serverSocket.emit(AiWsEvents.REPLY_CHUNK, mockAiAiResponse.content);
            cb();
          });
      });

      await expect(service.streamMessage(
        mockSessionMetadata,
        mockAiDatabaseId,
        mockSendAiChatMessageDto,
        mockResponse as any,
      ))
        .resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiAiResponse.content);
    });

    it('should fail when ack has error property', async () => {
      serverSocket.once(AiWsEvents.STREAM, (_content, _context, _history, _opts, cb) => {
        cb({ error: { error: AiServerErrors.RateLimitRequest } });
      });

      await expect(service.streamMessage(
        mockSessionMetadata,
        mockAiDatabaseId,
        mockSendAiChatMessageDto,
        mockResponse as any,
      ))
        .rejects.toThrow(AiRateLimitRequestException);
    });
  });

  describe('getHistory', () => {
    it('should get history', async () => {
      expect(await service.getHistory(mockSessionMetadata, mockAiDatabaseId)).toEqual(mockAiHistory);
    });

    it('should get history from 2nd attempt', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      expect(await service.getHistory(mockSessionMetadata, mockAiDatabaseId)).toEqual(mockAiHistory);
    });

    it('throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.getHistory(mockSessionMetadata, mockAiDatabaseId)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('clearHistory', () => {
    it('should clear history', async () => {
      expect(await service.clearHistory(mockSessionMetadata, mockAiDatabaseId)).toEqual(undefined);
    });

    it('should clear history from 2nd attempt', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      expect(await service.clearHistory(mockSessionMetadata, mockAiDatabaseId)).toEqual(undefined);
    });

    it('throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.clearHistory(mockSessionMetadata, mockAiDatabaseId)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('updateAiAgreements', () => {
    const reqDto = { general: false, db: false };
    it('should get ai agreemet of a given db and account', async () => {
      aiAgreementRepository.get.mockResolvedValue(null);
      aiAgreementRepository.list.mockResolvedValueOnce([]);
      expect(await service.updateAiAgreements(mockSessionMetadata, mockAiDatabaseId, reqDto))
        .toEqual([]);
    });

    it('throw CloudApiUnauthorizedException', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.updateAiAgreements(mockSessionMetadata, mockAiDatabaseId, reqDto)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
