import { Module, Type } from '@nestjs/common';
import { CustomTutorialController } from 'src/modules/custom-tutorial/custom-tutorial.controller';
import { CustomTutorialService } from 'src/modules/custom-tutorial/custom-tutorial.service';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';
import {
  LocalCustomTutorialRepository,
} from 'src/modules/custom-tutorial/repositories/local.custom-tutorial.repository';

@Module({})
export class CustomTutorialModule {
  static register(
    repository: Type<CustomTutorialRepository> = LocalCustomTutorialRepository,
  ) {
    return {
      module: CustomTutorialModule,
      controllers: [CustomTutorialController],
      providers: [
        CustomTutorialService,
        {
          provide: CustomTutorialRepository,
          useClass: repository,
        },
      ],
    };
  }
}
