import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import {
  AddMembersToZSetDto,
  CreateZSetWithExpireDto,
  DeleteMembersFromZSetDto,
  DeleteMembersFromZSetResponse,
  GetZSetMembersDto,
  GetZSetResponse,
  SearchZSetMembersDto,
  SearchZSetMembersResponse,
  UpdateMemberInZSetDto,
} from '../../dto';
import { ZSetBusinessService } from '../../services/z-set-business/z-set-business.service';

@ApiTags('ZSet')
@Controller('/zSet')
export class ZSetController extends BaseController {
  constructor(private zSetBusinessService: ZSetBusinessService) {
    super();
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Set key to hold ZSet data type',
    statusCode: 201,
  })
  @ApiQueryRedisStringEncoding()
  async createSet(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: CreateZSetWithExpireDto,
  ): Promise<void> {
    return await this.zSetBusinessService.createZSet(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-members')
  @ApiRedisInstanceOperation({
    description: 'Get specified members of the ZSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: GetZSetResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getZSet(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: GetZSetMembersDto,
  ): Promise<GetZSetResponse> {
    return await this.zSetBusinessService.getMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Add the specified members to the ZSet stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async addMembers(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: AddMembersToZSetDto,
  ): Promise<void> {
    return await this.zSetBusinessService.addMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Patch('')
  @ApiRedisInstanceOperation({
    description: 'Update the specified member in the ZSet stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async updateMember(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: UpdateMemberInZSetDto,
  ): Promise<void> {
    return await this.zSetBusinessService.updateMember(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Delete('/members')
  @ApiRedisInstanceOperation({
    description: 'Remove the specified members from the Set stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: DeleteMembersFromZSetResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async deleteMembers(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: DeleteMembersFromZSetDto,
  ): Promise<DeleteMembersFromZSetResponse> {
    return await this.zSetBusinessService.deleteMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/search')
  @ApiRedisInstanceOperation({
    description: 'Search members in ZSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: SearchZSetMembersResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async searchZSet(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: SearchZSetMembersDto,
  ): Promise<SearchZSetMembersResponse> {
    return await this.zSetBusinessService.searchMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }
}
