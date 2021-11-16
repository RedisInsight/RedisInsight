import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
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
export class SetController {
  constructor(private setBusinessService: SetBusinessService) {}

  @Post('')
  @ApiOperation({ description: 'Set key to hold Set data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateSetWithExpireDto })
  @UsePipes(new ValidationPipe({ transform: true }))
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
  @UsePipes(new ValidationPipe({ transform: true }))
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
  @UsePipes(new ValidationPipe({ transform: true }))
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
  @UsePipes(new ValidationPipe({ transform: true }))
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
