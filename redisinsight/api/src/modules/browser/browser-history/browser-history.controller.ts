import {
  Body,
  Controller, Delete, Get, Param, Query, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserHistoryMode } from 'src/common/constants';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { BrowserHistoryService } from './browser-history.service';
import { BrowserHistory } from './dto/get.browser-history.dto';
import { DeleteBrowserHistoryItemsDto } from './dto/delete.browser-history.dto';
import { DeleteBrowserHistoryItemsResponse } from './dto/delete.browser-history.response.dto';

@UseInterceptors(BrowserSerializeInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Browser History')
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
    @Param('dbInstance') databaseId: string,
      @Query() { mode = BrowserHistoryMode.Pattern }: { mode: BrowserHistoryMode },
  ): Promise<BrowserHistory[]> {
    return this.service.list(databaseId, mode);
  }

  @Delete('/:id')
  @ApiRedisParams()
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete browser history item by id',
  })
  async delete(
    @Param('dbInstance') databaseId: string,
      @Param('id') id: string,
  ): Promise<void> {
    await this.service.delete(databaseId, id);
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
    @Param('dbInstance') databaseId: string,
      @Body() dto: DeleteBrowserHistoryItemsDto,
  ): Promise<DeleteBrowserHistoryItemsResponse> {
    return this.service.bulkDelete(databaseId, dto.ids);
  }
}
