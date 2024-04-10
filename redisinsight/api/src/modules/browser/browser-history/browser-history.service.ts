import { HttpException, Injectable, Logger } from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { sum } from 'lodash';
import { plainToClass } from 'class-transformer';
import { ClientMetadata, SessionMetadata } from 'src/common/models';
import { BrowserHistoryMode } from 'src/common/constants';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';
import {
  BrowserHistory,
  CreateBrowserHistoryDto,
  DeleteBrowserHistoryItemsResponse,
} from 'src/modules/browser/browser-history/dto';

@Injectable()
export class BrowserHistoryService {
  private logger = new Logger('BrowserHistoryService');

  constructor(
    private readonly browserHistoryProvider: BrowserHistoryProvider,
  ) {}

  /**
   * Create a new browser history item
   * @param clientMetadata
   * @param dto
   */
  public async create(
    clientMetadata: ClientMetadata,
    dto: CreateBrowserHistoryDto,
  ): Promise<BrowserHistory> {
    try {
      const history = plainToClass(BrowserHistory, { ...dto, databaseId: clientMetadata.databaseId });
      return this.browserHistoryProvider.create(clientMetadata.sessionMetadata, history);
    } catch (e) {
      this.logger.error('Unable to create browser history item', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get browser history with all fields by id
   * @param id
   */
  async get(sessionMetada, id: string): Promise<BrowserHistory> {
    return this.browserHistoryProvider.get(sessionMetada, id);
  }

  /**
   * Get browser history list for particular database with id and createdAt fields only
   * @param databaseId
   * @param mode
   */
  async list(sessionMetadata: SessionMetadata, databaseId: string, mode: BrowserHistoryMode): Promise<BrowserHistory[]> {
    return this.browserHistoryProvider.list(sessionMetadata, databaseId, mode);
  }

  /**
   * Delete browser history item by id
   * @param databaseId
   * @param id
   */
  async delete(sessionMetada, databaseId: string, id: string): Promise<void> {
    return this.browserHistoryProvider.delete(sessionMetada, databaseId, id);
  }

  /**
   * Bulk delete browser history items. Uses "delete" method and skipping error
   * Returns successfully deleted browser history items number
   * @param databaseId
   * @param ids
   */
  async bulkDelete(sessionMetadata: SessionMetadata, databaseId: string, ids: string[]): Promise<DeleteBrowserHistoryItemsResponse> {
    this.logger.log(`Deleting many browser history items: ${ids}`);

    return {
      affected: sum(await Promise.all(ids.map(async (id) => {
        try {
          await this.delete(sessionMetadata, databaseId, id);
          return 1;
        } catch (e) {
          return 0;
        }
      }))),
    };
  }
}
