import {
  Body,
  ClassSerializerInterceptor,
  Controller, Post,
  UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import {
  ApiConsumes, ApiTags,
} from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { FormDataRequest } from 'nestjs-form-data';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { UploadImportFileDto } from 'src/modules/bulk-actions/dto/upload-import-file.dto';
import { ClientMetadataParam } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';

@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Bulk Actions')
@Controller('/bulk-actions/:id')
export class BulkImportController {
  constructor(private readonly service: BulkImportService) {}

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @FormDataRequest()
  @ApiEndpoint({
    description: 'Import data from file',
    responses: [
      {
        type: Object,
      },
    ],
  })
  async import(
    @Body() dto: UploadImportFileDto,
      @ClientMetadataParam({
        databaseIdParam: 'id',
      }) clientMetadata: ClientMetadata,
  ): Promise<IBulkActionOverview> {
    return this.service.import(clientMetadata, dto);
  }
}
