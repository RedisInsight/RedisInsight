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
import { ClientMetadata } from 'src/common/models';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import {
  AddMembersToSetDto,
  CreateSetWithExpireDto,
  DeleteMembersFromSetDto,
  DeleteMembersFromSetResponse,
  GetSetMembersDto,
  GetSetMembersResponse,
} from '../../dto';
import { SetBusinessService } from '../../services/set-business/set-business.service';

@ApiTags('Set')
@Controller('set')
export class SetController extends BaseController {
  constructor(private setBusinessService: SetBusinessService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold Set data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateSetWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createSet(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: CreateSetWithExpireDto,
  ): Promise<void> {
    return await this.setBusinessService.createSet(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-members')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get specified members of the set stored at key by cursor position',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Specified members of the set stored at key.',
    type: GetSetMembersResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetSetMembersDto,
  ): Promise<GetSetMembersResponse> {
    return await this.setBusinessService.getMembers(clientMetadata, dto);
  }

  @Put('')
  @ApiOperation({
    description: 'Add the specified members to the Set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: AddMembersToSetDto })
  @ApiQueryRedisStringEncoding()
  async addMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: AddMembersToSetDto,
  ): Promise<void> {
    return await this.setBusinessService.addMembers(clientMetadata, dto);
  }

  @Delete('/members')
  @ApiOperation({
    description: 'Remove the specified members from the Set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: DeleteMembersFromSetDto })
  @ApiQueryRedisStringEncoding()
  async deleteMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: DeleteMembersFromSetDto,
  ): Promise<DeleteMembersFromSetResponse> {
    return await this.setBusinessService.deleteMembers(clientMetadata, dto);
  }
}
