import { Injectable } from '@nestjs/common';
import { Rdi } from 'src/modules/rdi/models';
import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { classToClass } from "src/utils";

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

    return await this.repository.create(model);
  }

  async delete(id: string): Promise<void> {

  }
}
