import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { KeysBusinessService } from 'src/modules/browser/services/keys-business/keys-business.service';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { RedisService } from 'src/modules/redis/redis.service';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import {
  DeleteKeysDto,
  DeleteKeysResponse,
  GetKeyInfoDto,
  GetKeysDto,
  GetKeysWithDetailsResponse,
  GetKeyInfoResponse,
  RenameKeyDto,
  RenameKeyResponse,
  UpdateKeyTtlDto,
  KeyTtlResponse, GetKeysInfoDto,
} from '../../dto';

@ApiTags('Keys')
@Controller('keys')
export class KeysController extends BaseController {
  constructor(
    private redisService: RedisService,
    private keysBusinessService: KeysBusinessService,
  ) {
    super();
  }

  @Post('')
  @HttpCode(200)
  @ApiOperation({ description: 'Get keys by cursor position' })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Keys list',
    type: GetKeysWithDetailsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getKeys(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetKeysDto,
  ): Promise<GetKeysWithDetailsResponse[]> {
    return this.keysBusinessService.getKeys(clientMetadata, dto);
  }

  @Post('get-metadata')
  @HttpCode(200)
  @ApiOperation({ description: 'Get info for multiple keys' })
  @ApiBody({ type: GetKeysInfoDto })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Info for multiple keys',
    type: GetKeysWithDetailsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getKeysInfo(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetKeysInfoDto,
  ): Promise<GetKeyInfoResponse[]> {
    return this.keysBusinessService.getKeysInfo(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-info')
  @HttpCode(200)
  @ApiOperation({ description: 'Get key info' })
  @ApiRedisParams()
  @ApiBody({ type: GetKeyInfoDto })
  @ApiOkResponse({
    description: 'Keys info',
    type: GetKeyInfoResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getKeyInfo(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetKeyInfoDto,
  ): Promise<GetKeyInfoResponse> {
    return await this.keysBusinessService.getKeyInfo(clientMetadata, dto.keyName);
  }

  @Delete('')
  @ApiOperation({ description: 'Delete key' })
  @ApiRedisParams()
  @ApiBody({ type: DeleteKeysDto })
  @ApiOkResponse({
    description: 'Number of affected keys.',
    type: DeleteKeysResponse,
  })
  @ApiQueryRedisStringEncoding()
  async deleteKey(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: DeleteKeysDto,
  ): Promise<DeleteKeysResponse> {
    return await this.keysBusinessService.deleteKeys(clientMetadata, dto.keyNames);
  }

  @Patch('/name')
  @ApiOperation({ description: 'Rename key' })
  @ApiRedisParams()
  @ApiBody({ type: RenameKeyDto })
  @ApiOkResponse({
    description: 'New key name.',
    type: RenameKeyResponse,
  })
  @ApiQueryRedisStringEncoding()
  async renameKey(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: RenameKeyDto,
  ): Promise<RenameKeyResponse> {
    return await this.keysBusinessService.renameKey(clientMetadata, dto);
  }

  @Patch('/ttl')
  @ApiOperation({ description: 'Update the remaining time to live of a key' })
  @ApiRedisParams()
  @ApiBody({ type: UpdateKeyTtlDto })
  @ApiOkResponse({
    description: 'The remaining time to live of a key.',
    type: KeyTtlResponse,
  })
  @ApiQueryRedisStringEncoding()
  async updateTtl(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    return await this.keysBusinessService.updateTtl(clientMetadata, dto);
  }
}
