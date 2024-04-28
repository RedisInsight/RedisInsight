export const mockCapiUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
};

export const mockApiInternalServerError = {
  message: 'Something wrong',
  response: {
    status: 500,
  },
};

export const mockUtm = {
  source: 'redisinsight',
  medium: 'sso',
  campaign: 'workbench',
};
