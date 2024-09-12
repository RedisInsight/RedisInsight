import { Test, TestingModule } from '@nestjs/testing';
import { io } from 'socket.io-client';
import * as MockedSocket from 'socket.io-mock';
import { mockAiAuth } from 'src/__mocks__';
import { AiProvider } from 'src/modules/ai/providers/ai.provider';
import { AiWsEvents } from 'src/modules/ai/models';
import { BadRequestException } from '@nestjs/common';
import { AiBadRequestException } from 'src/modules/ai/exceptions';

const mockSocketClient = (new MockedSocket());
jest.mock('socket.io-client');

describe('AiProvider', () => {
  let service: AiProvider;

  beforeEach(async () => {
    (io as jest.Mock).mockReturnValue(mockSocketClient);

    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProvider,
      ],
    }).compile();

    service = module.get(AiProvider);
  });

  describe('getSocket', () => {
    it('should successfully connect', (done) => {
      service.getSocket(mockAiAuth)
        .then((socket) => {
          expect(socket).toEqual(mockSocketClient);
          done();
        })
        .catch(done);

      mockSocketClient.socketClient.emit(AiWsEvents.CONNECT);
    });
    it('should fail with AiBadRequestException', (done) => {
      service.getSocket(mockAiAuth)
        .then(() => {
          done('Should fail');
        })
        .catch((e) => {
          expect(e).toEqual(new AiBadRequestException('Unable to establish connection'));
          done();
        });

      mockSocketClient.socketClient.emit(AiWsEvents.CONNECT_ERROR, new BadRequestException());
    });
  });
});
