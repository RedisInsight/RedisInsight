import {
  DynamicModule,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RejsonRlController } from 'src/modules/browser/rejson-rl/rejson-rl.controller';
import { RejsonRlService } from 'src/modules/browser/rejson-rl/rejson-rl.service';

@Module({})
export class RejsonRlModule {
  static register({ route }): DynamicModule {
    return {
      module: RejsonRlModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: RejsonRlModule,
        }]),
      ],
      controllers: [RejsonRlController],
      providers: [RejsonRlService],
    };
  }
}
