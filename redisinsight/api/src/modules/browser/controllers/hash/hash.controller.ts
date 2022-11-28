import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import {
  AddFieldsToHashDto,
  CreateHashWithExpireDto,
  DeleteFieldsFromHashDto,
  DeleteFieldsFromHashResponse,
  GetHashFieldsDto,
  GetHashFieldsResponse,
} from '../../dto/hash.dto';
import { HashBusinessService } from '../../services/hash-business/hash-business.service';

@ApiTags('Hash')
@Controller('hash')
export class HashController extends BaseController {
  constructor(private hashBusinessService: HashBusinessService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold Hash data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateHashWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createHash(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: CreateHashWithExpireDto,
  ): Promise<void> {
    return await this.hashBusinessService.createHash(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-fields')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get specified fields of the hash stored at key by cursor position',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Specified fields of the hash stored at key.',
    type: GetHashFieldsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetHashFieldsDto,
  ): Promise<GetHashFieldsResponse> {
    return await this.hashBusinessService.getFields(clientMetadata, dto);
  }

  @Put('')
  @ApiOperation({
    description: 'Add the specified fields to the Hash stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: AddFieldsToHashDto })
  @ApiQueryRedisStringEncoding()
  async addMember(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: AddFieldsToHashDto,
  ): Promise<void> {
    return await this.hashBusinessService.addFields(clientMetadata, dto);
  }

  @Delete('/fields')
  @ApiOperation({
    description: 'Remove the specified fields from the Hash stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: DeleteFieldsFromHashDto })
  @ApiQueryRedisStringEncoding()
  async deleteFields(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: DeleteFieldsFromHashDto,
  ): Promise<DeleteFieldsFromHashResponse> {
    return await this.hashBusinessService.deleteFields(clientMetadata, dto);
  }
}
