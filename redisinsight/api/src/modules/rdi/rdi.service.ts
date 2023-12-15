import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';
import { Rdi, RdiType } from 'src/modules/rdi/models';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { classToClass } from 'src/utils';

@Injectable()
export class RdiService {
  constructor(
    private readonly repository: RdiRepository,
  ) {}

  async list(): Promise<Rdi[]> {
    return await this.repository.list();
  }

  async get(id: string): Promise<Rdi> {
    const rdi = await this.repository.get(id);

    if (!rdi) {
      throw new Error('TBD not found');
    }

    return rdi;
  }

  async update(id: string, dto: UpdateRdiDto): Promise<Rdi> {
    return null;
  }

  async create(dto: CreateRdiDto): Promise<Rdi> {
    const model = classToClass(Rdi, dto);
    model.lastConnection = new Date();
    model.type = RdiType.API;

    return await this.repository.create(model);
  }

  async delete(ids: string[]): Promise<void> {
    return await this.repository.delete(ids);
  }
}
