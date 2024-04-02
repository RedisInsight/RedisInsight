import { AiChat, AiChatMessage, AiChatMessageType } from 'src/modules/ai/chat/models';
import { Readable } from 'stream';
import { AxiosError } from 'axios';
import { SendAiChatMessageDto } from 'src/modules/ai/chat/dto/send.ai-chat.message.dto';

export const mockAiChatId = '0539879dc020add5abb33f6f60a07fe8d5a0b9d61c81c9d79d77f9b1b2f2e239';

export const mockAiChatBadRequestError = {
  message: 'Bad request',
  response: {
    status: 400,
  },
} as AxiosError;

export const mockAiChatUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
} as AxiosError;

export const mockAiChatAccessDeniedError = {
  message: 'Access denied',
  response: {
    status: 403,
  },
} as AxiosError;

export const mockAiChatNotFoundError = {
  message: 'Requested resource was not found',
  response: {
    status: 404,
  },
} as AxiosError;

export const mockAiChatInternalServerError = {
  message: 'Server error',
  response: {
    status: 500,
  },
} as AxiosError;

export const mockHumanMessage1Response = {
  type: AiChatMessageType.HumanMessage,
  content: 'Question 1',
};

export const mockHumanMessage2Response = {
  type: AiChatMessageType.HumanMessage,
  content: 'Question 2',
};

export const mockAiMessage1Response = {
  type: AiChatMessageType.AiMessage,
  content: 'Answer 1',
};
export const mockAiMessage2Response = {
  type: AiChatMessageType.AiMessage,
  content: 'Answer 2',
};

export const mockAiHistoryApiResponse = [
  mockHumanMessage1Response,
  mockAiMessage1Response,
  mockHumanMessage2Response,
  mockAiMessage2Response,
];

export const mockAiChat = Object.assign(new AiChat(), {
  id: mockAiChatId,
  messages: [
    Object.assign(new AiChatMessage(), mockHumanMessage1Response),
    Object.assign(new AiChatMessage(), mockAiMessage1Response),
    Object.assign(new AiChatMessage(), mockHumanMessage2Response),
    Object.assign(new AiChatMessage(), mockAiMessage2Response),
  ],
});
export const getMockedReadableStream = () => new Readable();
export const mockAiResponseStream = getMockedReadableStream();

export const mockSendAiChatMessageDto = Object.assign(new SendAiChatMessageDto(), {
  content: mockHumanMessage1Response.content,
});

export const mockConvAiProvider = jest.fn(() => ({
  auth: jest.fn().mockResolvedValue(mockAiChatId),
  postMessage: jest.fn().mockResolvedValue(mockAiResponseStream),
  getHistory: jest.fn().mockResolvedValue(mockAiHistoryApiResponse),
  reset: jest.fn(),
}));
