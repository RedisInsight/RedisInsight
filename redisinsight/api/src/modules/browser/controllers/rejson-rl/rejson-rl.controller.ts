import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GetRejsonRlDto,
  GetRejsonRlResponseDto,
  CreateRejsonRlWithExpireDto,
  ModifyRejsonRlSetDto,
  ModifyRejsonRlArrAppendDto,
  RemoveRejsonRlDto,
  RemoveRejsonRlResponse,
} from 'src/modules/browser/dto';
import { RejsonRlBusinessService } from 'src/modules/browser/services/rejson-rl-business/rejson-rl-business.service';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';

@ApiTags('REJSON-RL')
@Controller('rejson-rl')
@UsePipes(new ValidationPipe({ transform: true }))
export class RejsonRlController {
  constructor(private service: RejsonRlBusinessService) {}

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get json properties by path',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description:
          'Download full data by path or returns description of data inside',
        type: GetRejsonRlResponseDto,
      },
    ],
  })
  async getJson(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: GetRejsonRlDto,
  ): Promise<GetRejsonRlResponseDto> {
    return this.service.getJson(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create new REJSON-RL data type',
    statusCode: 201,
  })
  async createJson(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: CreateRejsonRlWithExpireDto,
  ): Promise<void> {
    return this.service.create(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Patch('/set')
  @ApiRedisInstanceOperation({
    description: 'Modify REJSON-RL data type by path',
    statusCode: 200,
  })
  async jsonSet(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: ModifyRejsonRlSetDto,
  ): Promise<void> {
    return this.service.jsonSet(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Patch('/arrappend')
  @ApiRedisInstanceOperation({
    description: 'Append item inside REJSON-RL array',
    statusCode: 200,
  })
  async arrAppend(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: ModifyRejsonRlArrAppendDto,
  ): Promise<void> {
    return this.service.arrAppend(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }

  @Delete('')
  @ApiRedisInstanceOperation({
    description: 'Removes path in the REJSON-RL',
    statusCode: 200,
  })
  async remove(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: RemoveRejsonRlDto,
  ): Promise<RemoveRejsonRlResponse> {
    return this.service.remove(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }
}
