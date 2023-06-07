import { Module } from '@nestjs/common';
import { TriggeredFunctionsController } from 'src/modules/triggered-functions/triggered-functions.controller';
import { TriggeredFunctionsService } from 'src/modules/triggered-functions/triggered-functions.service';

@Module({
  controllers: [TriggeredFunctionsController],
  providers: [
    TriggeredFunctionsService,
  ],
})
export class TriggeredFunctionsModule {}
