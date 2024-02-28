import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';
import { Rdi, RdiType } from 'src/modules/rdi/models';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { classToClass } from 'src/utils';
import { RdiAnalytics } from './rdi.analytics';

@Injectable()
export class RdiService {
  private logger = new Logger('RdiService');

  constructor(
    private readonly repository: RdiRepository,
    private readonly analytics: RdiAnalytics,
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
    return await this.repository.update(id, dto);
  }

  async create(dto: CreateRdiDto): Promise<Rdi> {
    const model = classToClass(Rdi, dto);
    model.lastConnection = new Date();
    model.type = RdiType.API;
    model.version = '1.2';

    return await this.repository.create(model);
  }

  async delete(ids: string[]): Promise<void> {
    try {
      await this.repository.delete(ids);
      this.analytics.sendRdiInstanceDeleted(ids.length);
    } catch (error) {
      this.logger.error(`Failed to delete instance(s): ${ids}`, error.message);
      this.analytics.sendRdiInstanceDeleted(ids.length, error.message);
      throw new InternalServerErrorException();
    }
  }
}
