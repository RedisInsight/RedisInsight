import {
  Body,
  ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { Rdi } from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { RdiService } from 'src/modules/rdi/rdi.service';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('rdi')
export class RdiController {
  constructor(
    private readonly rdiService: RdiService,
  ) {}

  @Get()
  @ApiEndpoint({
    description: 'Get RDI list',
    responses: [{ status: 200, isArray: true, type: Rdi }],
  })
  async list(): Promise<Rdi[]> {
    return this.rdiService.list();
  }

  @Get('/:id')
  @ApiEndpoint({
    description: 'Get RDI by id',
    responses: [{ status: 200, type: Rdi }],
  })
  async get(@Param('id') id: string): Promise<Rdi> {
    return this.rdiService.get(id);
  }

  @Post()
  @ApiEndpoint({
    description: 'Create RDI',
    statusCode: 201,
    responses: [{ status: 201, type: Rdi }],
  })
  async create(@Body() dto: CreateRdiDto): Promise<Rdi> {
    return this.rdiService.create(dto);
  }

  @Patch('/:id')
  @ApiEndpoint({
    description: 'Update RDI',
    responses: [{ status: 200, type: Rdi }],
  })
  async update(
    @Param('id') id: string,
      @Body() dto: UpdateRdiDto,
  ): Promise<Rdi> {
    return this.rdiService.update(id, dto);
  }

  @Delete('/:id')
  @ApiEndpoint({
    description: 'Delete RDI',
    responses: [{ status: 200 }],
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.rdiService.delete(id);
  }
}
