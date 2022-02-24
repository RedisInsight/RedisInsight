import { RequestMethod } from '@nestjs/common';

export default {
  server: {
    excludeRoutes: [
      'redis-enterprise/*',
      { path: 'instance', method: RequestMethod.POST },
      { path: 'instance', method: RequestMethod.DELETE },
      { path: 'instance/:id', method: RequestMethod.DELETE },
      { path: 'instance/:id', method: RequestMethod.DELETE },
    ],
  },
};
