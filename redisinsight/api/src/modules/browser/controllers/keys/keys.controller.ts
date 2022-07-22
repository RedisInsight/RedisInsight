import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { KeysBusinessService } from 'src/modules/browser/services/keys-business/keys-business.service';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
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
  KeyTtlResponse,
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

  @Get('')
  @ApiOperation({ description: 'Get keys by cursor position' })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Keys list',
    type: GetKeysWithDetailsResponse,
  })
  async getKeys(
    @Param('dbInstance') dbInstance: string,
      @Query() getKeysDto: GetKeysDto,
  ): Promise<GetKeysWithDetailsResponse[]> {
    return this.keysBusinessService.getKeys(
      {
        instanceId: dbInstance,
      },
      getKeysDto,
    );
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
  async getKeyInfo(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: GetKeyInfoDto,
  ): Promise<GetKeyInfoResponse> {
    return await this.keysBusinessService.getKeyInfo(
      {
        instanceId: dbInstance,
      },
      dto.keyName,
    );
  }

  @Delete('')
  @ApiOperation({ description: 'Delete key' })
  @ApiRedisParams()
  @ApiBody({ type: DeleteKeysDto })
  @ApiOkResponse({
    description: 'Number of affected keys.',
    type: DeleteKeysResponse,
  })
  async deleteKey(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: DeleteKeysDto,
  ): Promise<DeleteKeysResponse> {
    return await this.keysBusinessService.deleteKeys(
      {
        instanceId: dbInstance,
      },
      dto.keyNames,
    );
  }

  @Patch('/name')
  @ApiOperation({ description: 'Rename key' })
  @ApiRedisParams()
  @ApiBody({ type: RenameKeyDto })
  @ApiOkResponse({
    description: 'New key name.',
    type: RenameKeyResponse,
  })
  async renameKey(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: RenameKeyDto,
  ): Promise<RenameKeyResponse> {
    return await this.keysBusinessService.renameKey(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Patch('/ttl')
  @ApiOperation({ description: 'Update the remaining time to live of a key' })
  @ApiRedisParams()
  @ApiBody({ type: UpdateKeyTtlDto })
  @ApiOkResponse({
    description: 'The remaining time to live of a key.',
    type: KeyTtlResponse,
  })
  async updateTtl(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    return await this.keysBusinessService.updateTtl(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }
}
