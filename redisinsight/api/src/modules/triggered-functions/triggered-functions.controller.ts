import {
  Get,
  Post,
  Delete,
  Controller, UsePipes, ValidationPipe, Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { TriggeredFunctionsService } from 'src/modules/triggered-functions/triggered-functions.service';
import { ShortLibrary, Library, Function } from 'src/modules/triggered-functions/models';
import { LibraryDto, UploadLibraryDto, DeleteLibraryDto } from 'src/modules/triggered-functions/dto';
import { ClientMetadata } from 'src/common/models';
import { ClientMetadataParam } from 'src/common/decorators';

@ApiTags('Triggered Functions')
@Controller('triggered-functions')
@UsePipes(new ValidationPipe())
export class TriggeredFunctionsController {
  constructor(private service: TriggeredFunctionsService) {}

  @Get('/libraries')
  @ApiRedisInstanceOperation({
    description: 'Returns short libraries information',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns libraries',
        type: ShortLibrary,
      },
    ],
  })
  async libraryList(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
  ): Promise<ShortLibrary[]> {
    return this.service.libraryList(clientMetadata);
  }

  @Post('/get-library')
  @ApiRedisInstanceOperation({
    description: 'Returns library details',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns library information',
        type: Library,
      },
    ],
  })
  async details(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
      @Body() dto: LibraryDto,
  ): Promise<Library> {
    return this.service.details(clientMetadata, dto.libraryName);
  }

  @Get('/functions')
  @ApiRedisInstanceOperation({
    description: 'Returns function information',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns all functions',
        type: Function,
      },
    ],
  })
  async functionsList(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
  ): Promise<Function[]> {
    return this.service.functionsList(clientMetadata);
  }

  @Post('library')
  @ApiRedisInstanceOperation({
    description: 'Upload new library',
    statusCode: 201,
  })
  async upload(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
      @Body() dto: UploadLibraryDto,
  ): Promise<void> {
    return this.service.upload(clientMetadata, dto);
  }

  @Post('library/replace')
  @ApiRedisInstanceOperation({
    description: 'Upgrade existing library',
    statusCode: 201,
  })
  async upgrade(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
      @Body() dto: UploadLibraryDto,
  ): Promise<void> {
    return this.service.upload(clientMetadata, dto, true);
  }

  @Delete('/library')
  @ApiRedisInstanceOperation({
    statusCode: 200,
    description: 'Delete library by name',
  })
  async deleteLibraries(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
      // library name probably can be really huge
      @Body() dto: DeleteLibraryDto,
  ): Promise<void> {
    return await this.service.delete(clientMetadata, dto.libraryName);
  }
}
