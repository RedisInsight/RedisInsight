export const mockAiChatId = '0539879dc020add5abb33f6f60a07fe8d5a0b9d61c81c9d79d77f9b1b2f2e239';

export const mockAiChatBadRequestError = {
  message: 'Bad request',
  response: {
    status: 400,
  },
};

export const mockAiChatUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
};

export const mockAiChatAccessDeniedError = {
  message: 'Access denied',
  response: {
    status: 403,
  },
};

export const mockAiChatNotFoundError = {
  message: 'Requested resource was not found',
  response: {
    status: 404,
  },
};

export const mockAiChatInternalServerError = {
  message: 'Server error',
  response: {
    status: 500,
  },
};
