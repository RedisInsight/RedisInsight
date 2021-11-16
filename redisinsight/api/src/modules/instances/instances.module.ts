import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { InstancesController } from './controllers/instances/instances.controller';
import { CertificatesController } from './controllers/certificates/certificates.controller';

@Module({
  imports: [SharedModule],
  providers: [],
  controllers: [InstancesController, CertificatesController],
})
export class InstancesModule implements NestModule {
  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes({ path: 'instance/:dbInstance/connect', method: RequestMethod.GET });
  }
}
