import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
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
    @Param('dbInstance') dbInstance: string,
      @Body() dto: CreateSetWithExpireDto,
  ): Promise<void> {
    return await this.setBusinessService.createSet(
      {
        instanceId: dbInstance,
      },
      dto,
    );
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
    @Param('dbInstance') dbInstance: string,
      @Body() dto: GetSetMembersDto,
  ): Promise<GetSetMembersResponse> {
    return await this.setBusinessService.getMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Put('')
  @ApiOperation({
    description: 'Add the specified members to the Set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: AddMembersToSetDto })
  @ApiQueryRedisStringEncoding()
  async addMembers(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: AddMembersToSetDto,
  ): Promise<void> {
    return await this.setBusinessService.addMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Delete('/members')
  @ApiOperation({
    description: 'Remove the specified members from the Set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: DeleteMembersFromSetDto })
  @ApiQueryRedisStringEncoding()
  async deleteMembers(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: DeleteMembersFromSetDto,
  ): Promise<DeleteMembersFromSetResponse> {
    return await this.setBusinessService.deleteMembers(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }
}
