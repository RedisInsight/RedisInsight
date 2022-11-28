import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
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
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: CreateZSetWithExpireDto,
  ): Promise<void> {
    return await this.zSetBusinessService.createZSet(clientMetadata, dto);
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
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetZSetMembersDto,
  ): Promise<GetZSetResponse> {
    return await this.zSetBusinessService.getMembers(clientMetadata, dto);
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Add the specified members to the ZSet stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async addMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: AddMembersToZSetDto,
  ): Promise<void> {
    return await this.zSetBusinessService.addMembers(clientMetadata, dto);
  }

  @Patch('')
  @ApiRedisInstanceOperation({
    description: 'Update the specified member in the ZSet stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async updateMember(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: UpdateMemberInZSetDto,
  ): Promise<void> {
    return await this.zSetBusinessService.updateMember(clientMetadata, dto);
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
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: DeleteMembersFromZSetDto,
  ): Promise<DeleteMembersFromZSetResponse> {
    return await this.zSetBusinessService.deleteMembers(clientMetadata, dto);
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
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: SearchZSetMembersDto,
  ): Promise<SearchZSetMembersResponse> {
    return await this.zSetBusinessService.searchMembers(clientMetadata, dto);
  }
}
