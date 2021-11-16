import { EntityRepository, Repository } from 'typeorm';
import { SettingsEntity } from 'src/modules/core/models/settings.entity';

@EntityRepository(SettingsEntity)
export class SettingsRepository extends Repository<SettingsEntity> {}
