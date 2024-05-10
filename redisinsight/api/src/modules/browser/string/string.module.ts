import {
  DynamicModule,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { StringService } from 'src/modules/browser/string/string.service';
import { StringController } from 'src/modules/browser/string/string.controller';

@Module({})
export class StringModule {
  static register({ route }): DynamicModule {
    return {
      module: StringModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: StringModule,
        }]),
      ],
      controllers: [StringController],
      providers: [StringService],
    };
  }
}
