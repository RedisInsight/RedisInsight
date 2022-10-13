import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import { Settings } from 'src/modules/settings/models/settings';
import { classToClass } from 'src/utils';

export class LocalSettingsRepository extends SettingsRepository {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly repository: Repository<SettingsEntity>,
  ) {
    super();
  }

  async getOrCreate(): Promise<Settings> {
    let entity = await this.repository.findOneBy({});

    if (!entity) {
      entity = this.repository.create();
      await this.repository.save(entity);
    }

    return classToClass(Settings, entity);
  }

  async update(id: string, settings: Settings): Promise<Settings> {
    await this.repository.update({}, classToClass(SettingsEntity, settings));

    return this.getOrCreate();
  }
}
