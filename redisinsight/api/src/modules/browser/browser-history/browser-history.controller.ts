import {
  Body,
  Controller, Delete, Get, Param, Query, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserHistoryMode } from 'src/common/constants';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import {
  BrowserHistory,
  DeleteBrowserHistoryItemsDto,
  DeleteBrowserHistoryItemsResponse,
  ListBrowserHistoryDto,
} from 'src/modules/browser/browser-history/dto';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { SessionMetadata } from 'src/common/models';
import { RequestSessionMetadata } from 'src/common/decorators';
import { DeleteBrowserHistoryQueryDto } from 'src/modules/browser/browser-history/dto/delete.browser-history.query.dto';

@UseInterceptors(BrowserSerializeInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Browser: Browser History')
@Controller('history')
export class BrowserHistoryController {
  constructor(private readonly service: BrowserHistoryService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get browser history',
    responses: [
      {
        status: 200,
        type: BrowserHistory,
      },
    ],
  })
  @Get('')
  @ApiQuery({
    name: 'mode',
    enum: BrowserHistoryMode,
  })
  async list(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Param('dbInstance') databaseId: string,
      @Query() dto: ListBrowserHistoryDto,
  ): Promise<BrowserHistory[]> {
    return this.service.list(sessionMetadata, databaseId, dto.mode);
  }

  @Delete('/:id')
  @ApiRedisParams()
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete browser history item by id',
  })
  async delete(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Param('dbInstance') databaseId: string,
      @Query() query: DeleteBrowserHistoryQueryDto,
      @Param('id') id: string,
  ): Promise<void> {
    await this.service.delete(sessionMetadata, databaseId, query.mode, id);
  }

  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete bulk browser history items',
    responses: [
      {
        status: 200,
        type: DeleteBrowserHistoryItemsResponse,
      },
    ],
  })
  @ApiRedisParams()
  @Delete('')
  async bulkDelete(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Param('dbInstance') databaseId: string,
      @Query() query: DeleteBrowserHistoryQueryDto,
      @Body() dto: DeleteBrowserHistoryItemsDto,
  ): Promise<DeleteBrowserHistoryItemsResponse> {
    return this.service.bulkDelete(sessionMetadata, databaseId, query.mode, dto.ids);
  }
}
