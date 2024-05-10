import {
  DynamicModule,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { HashService } from 'src/modules/browser/hash/hash.service';
import { HashController } from 'src/modules/browser/hash/hash.controller';

@Module({})
export class HashModule {
  static register({ route }): DynamicModule {
    return {
      module: HashModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: HashModule,
        }]),
      ],
      controllers: [HashController],
      providers: [HashService],
    };
  }
}
