import { OpenAPIObject } from '@nestjs/swagger';
import { version } from '../../../redisinsight/package.json';

const SWAGGER_CONFIG: Omit<OpenAPIObject, 'paths'> = {
  openapi: '3.0.0',
  info: {
    title: 'RedisInsight Backend API',
    description: 'RedisInsight Backend API',
    version: version,
  },
  tags: [],
};

export default SWAGGER_CONFIG;
