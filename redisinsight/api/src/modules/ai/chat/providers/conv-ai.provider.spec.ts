import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockAiChatId,
  mockAiChatUnauthorizedError,
  mockSessionMetadata,
} from 'src/__mocks__';
import { ConvAiProvider } from 'src/modules/ai/chat/providers/conv-ai.provider';
import { ConvAiUnauthorizedException } from 'src/modules/ai/chat/exceptions';
import config, { Config } from 'src/utils/config';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

const aiConfig = config.get('ai') as Config['ai'];

describe('ConvAiProvider', () => {
  let service: ConvAiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConvAiProvider,
      ],
    }).compile();

    service = module.get(ConvAiProvider);
  });

  describe('auth', () => {
    it('get session id', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          convai_session_id: mockAiChatId,
        },
      });

      expect(await service.auth(mockSessionMetadata)).toEqual(mockAiChatId);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/auth',
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'kb-tokens': aiConfig.convAiToken,
          },
        },
      );
    });

    it('throw ConvAiUnauthorized exception', async () => {
      mockedAxios.post.mockRejectedValue(mockAiChatUnauthorizedError);

      await expect(service.auth(mockSessionMetadata)).rejects.toThrow(
        ConvAiUnauthorizedException,
      );
    });
  });

  describe('reset', () => {
    it('reset chat history', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: '',
      });

      expect(await service.reset(mockSessionMetadata, mockAiChatId)).toEqual(undefined);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/reset',
        {},
        {
          headers: {
            'session-id': mockAiChatId,
          },
        },
      );
    });
    it('throw ConvAiUnauthorized exception', async () => {
      mockedAxios.post.mockRejectedValue(mockAiChatUnauthorizedError);

      await expect(service.reset(mockSessionMetadata, mockAiChatId)).rejects.toThrow(
        ConvAiUnauthorizedException,
      );
    });
  });
});
