import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete, Get, HttpCode, Param, Post, UploadedFile,
  UseInterceptors, UsePipes, ValidationPipe
} from '@nestjs/common';
import {
  ApiBody, ApiConsumes, ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomTutorialService } from 'src/modules/custom-tutorial/custom-tutorial.service';
import { UploadCustomTutorialDto } from 'src/modules/custom-tutorial/dto/upload.custom-tutorial.dto';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { Database } from 'src/modules/database/models/database';
import { FormDataRequest } from 'nestjs-form-data';

@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Tutorials')
@Controller('/custom-tutorials')
export class CustomTutorialController {
  constructor(private readonly service: CustomTutorialService) {}

  @Post('upload')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @FormDataRequest()
  async upload(
    @Body() dto: UploadCustomTutorialDto,
  ): Promise<void> {
    console.log('___ dto', dto);
    return this.service.upload(dto);
  }

  @Get('manifest')
  @ApiEndpoint({
    description: 'Update database instance by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Updated database instance\' response',
        type: Database,
      },
    ],
  })
  async getManifest(): Promise<void> {
    return this.service.getManifest();
  }

  @Delete('/:id')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete custom tutorial and its files',
  })
  async delete(
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(id);
  }
}
