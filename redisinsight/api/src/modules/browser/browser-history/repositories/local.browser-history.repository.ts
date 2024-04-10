import { BrowserHistoryMode } from "src/common/constants";
import config from 'src/utils/config';
import { BrowserHistory } from "../models/browser-history";
import { BrowserHistoryRepository } from "./browser-history.repository";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BrowserHistoryEntity } from "../entities/browser-history.entity";
import { Repository } from "typeorm";
import { plainToClass } from "class-transformer";
import { classToClass } from "src/utils";
import { SessionMetadata } from "src/common/models";

const BROWSER_HISTORY_CONFIG = config.get('browser_history');

@Injectable()
export class LocalBrowserHistoryRepository extends BrowserHistoryRepository {
  constructor(
    @InjectRepository(BrowserHistoryEntity)
    private readonly repository: Repository<BrowserHistoryEntity>,
  ) {
    super();
  }

  async save(_sessionMetadata: SessionMetadata, history: BrowserHistory): Promise<BrowserHistory> {
    const entity = plainToClass(BrowserHistoryEntity, history);
    const savedEntity = await this.repository.save(entity);
    return classToClass(BrowserHistory, savedEntity);
  }

  async findById(_sessionMetadata: SessionMetadata, id: string): Promise<BrowserHistory> {
    const entity = await this.repository.findOneBy({ id });
    return classToClass(BrowserHistory, entity);
  }

  async getBrowserHistory(_sessionMetadata: SessionMetadata, databaseId: string, mode: BrowserHistoryMode): Promise<BrowserHistory[]> {
    const entities = await this.repository
      .createQueryBuilder('a')
      .where({ databaseId, mode })
      .select([
        'a.id',
        'a.filter',
        'a.mode',
        'a.encryption',
      ])
      .orderBy('a.createdAt', 'DESC')
      .limit(BROWSER_HISTORY_CONFIG.maxItemsPerModeInDb)
      .getMany();

      return entities.map(entity => classToClass(BrowserHistory, entity));
  }

  async delete(_sessionMetadata: SessionMetadata, id: string, databaseId: string): Promise<void> {
    await this.repository.delete({ id, databaseId });
  }

  async cleanupDatabaseHistory(_sessionMetadata: SessionMetadata, databaseId: string, mode: string): Promise<void> {
    const idsDuplicates = (await this.repository
      .createQueryBuilder()
      .where({ databaseId, mode })
      .select('id')
      .groupBy('filter')
      .having('COUNT(filter) > 1')
      .getRawMany()).map((item) => item.id);

    const idsOverLimit = (await this.repository
      .createQueryBuilder()
      .where({ databaseId, mode })
      .select('id')
      .orderBy('createdAt', 'DESC')
      .offset(BROWSER_HISTORY_CONFIG.maxItemsPerModeInDb + idsDuplicates.length)
      .getRawMany()).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds([...idsOverLimit, ...idsDuplicates])
      .execute();
  };
}
