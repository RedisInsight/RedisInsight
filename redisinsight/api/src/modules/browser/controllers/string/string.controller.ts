import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import {
  SetStringDto,
  GetStringValueResponse,
  SetStringWithExpireDto,
} from 'src/modules/browser/dto/string.dto';
import { GetKeyInfoDto } from 'src/modules/browser/dto';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { StringBusinessService } from '../../services/string-business/string-business.service';

@ApiTags('String')
@Controller('string')
export class StringController extends BaseController {
  constructor(private stringBusinessService: StringBusinessService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold string value' })
  @ApiRedisParams()
  @ApiBody({ type: SetStringWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async setString(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: SetStringWithExpireDto,
  ): Promise<void> {
    return this.stringBusinessService.setString(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-value')
  @HttpCode(200)
  @ApiOperation({ description: 'Get string value' })
  @ApiRedisParams()
  @ApiBody({ type: GetKeyInfoDto })
  @ApiOkResponse({
    description: 'String value',
    type: GetStringValueResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getStringValue(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetKeyInfoDto,
  ): Promise<GetStringValueResponse> {
    return this.stringBusinessService.getStringValue(clientMetadata, dto);
  }

  @Put('')
  @ApiOperation({ description: 'Update string value' })
  @ApiRedisParams()
  @ApiBody({ type: SetStringDto })
  @ApiQueryRedisStringEncoding()
  async updateStringValue(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: SetStringDto,
  ): Promise<void> {
    return this.stringBusinessService.updateStringValue(clientMetadata, dto);
  }
}
