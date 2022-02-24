import { RequestMethod } from '@nestjs/common';

export default {
  server: {
    excludeRoutes: [
      'redis-enterprise/*',
      'instance/redis-enterprise-dbs',
      'instance/redis-cloud-dbs',
      'instance/sentinel-masters',
      { path: 'instance', method: RequestMethod.POST },
      { path: 'instance', method: RequestMethod.DELETE },
      { path: 'instance/:id', method: RequestMethod.DELETE },
    ],
  },
};
