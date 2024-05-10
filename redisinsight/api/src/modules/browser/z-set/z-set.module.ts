import {
  DynamicModule,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { ZSetService } from 'src/modules/browser/z-set/z-set.service';
import { ZSetController } from 'src/modules/browser/z-set/z-set.controller';

@Module({})
export class ZSetModule {
  static register({ route }): DynamicModule {
    return {
      module: ZSetModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: ZSetModule,
        }]),
      ],
      controllers: [ZSetController],
      providers: [ZSetService],
    };
  }
}
