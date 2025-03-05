import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TagRepository } from './repository/tag.repository';
import { CreateTagDto, UpdateTagDto } from './dto';
import { Tag } from './models/tag';
import { classToClass } from 'src/utils';

@Injectable()
export class TagService {
  private logger = new Logger('RdiService');

  constructor(private readonly tagRepository: TagRepository) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const model = classToClass(Tag, createTagDto);

    const tag = await this.tagRepository.create(model);

    this.logger.debug('Successfully created tag', tag);

    return tag;
  }

  async list(): Promise<Tag[]> {
    return this.tagRepository.list();
  }

  async get(id: string): Promise<Tag> {
    const tag = await this.tagRepository.get(id);
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    await this.tagRepository.update(id, updateTagDto);

    this.logger.debug('Successfully updated tag', { id, updateTagDto });

    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.tagRepository.delete(id);

    this.logger.debug('Successfully deleted tag', { id });
  }
}
