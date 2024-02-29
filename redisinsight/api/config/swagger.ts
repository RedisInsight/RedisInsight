import { OpenAPIObject } from '@nestjs/swagger';

const SWAGGER_CONFIG: Omit<OpenAPIObject, 'paths'> = {
  openapi: '3.0.0',
  info: {
    title: 'RedisInsight Backend API',
    description: 'RedisInsight Backend API',
    version: '2.44.0',
  },
  tags: [],
};

export default SWAGGER_CONFIG;
