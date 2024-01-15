import { join } from 'path';
import * as fs from 'fs-extra';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import * as readline from 'readline';
import { wrapHttpError } from 'src/common/utils';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ClientMetadata } from 'src/common/models';
import { splitCliCommandLine } from 'src/utils/cli-helper';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { BulkActionStatus, BulkActionType } from 'src/modules/bulk-actions/constants';
import { BulkActionsAnalyticsService } from 'src/modules/bulk-actions/bulk-actions-analytics.service';
import { UploadImportFileByPathDto } from 'src/modules/bulk-actions/dto/upload-import-file-by-path.dto';
import config, { Config } from 'src/utils/config';

const BATCH_LIMIT = 10_000;
const PATH_CONFIG = config.get('dir_path') as Config['dir_path'];
const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class BulkImportService {
  private logger = new Logger('BulkImportService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private readonly analyticsService: BulkActionsAnalyticsService,
  ) {}

  private async executeBatch(client, batch: any[]): Promise<BulkActionSummary> {
    const result = new BulkActionSummary();
    result.addProcessed(batch.length);

    try {
      if (client?.isCluster) {
        await Promise.all(batch.map(async ([command, args]) => {
          try {
            await client.call(command, args);
            result.addSuccess(1);
          } catch (e) {
            result.addFailed(1);
          }
        }));
      } else {
        const commands = batch.map(([cmd, args]) => ['call', cmd, ...args]);
        (await client.pipeline(commands).exec()).forEach(([err]) => {
          if (err) {
            result.addFailed(1);
          } else {
            result.addSuccess(1);
          }
        });
      }
    } catch (e) {
      this.logger.error('Unable to execute batch of commands', e);
      result.addFailed(batch.length);
    }

    return result;
  }

  /**
   * @param clientMetadata
   * @param fileStream
   */
  public async import(clientMetadata: ClientMetadata, fileStream: Readable): Promise<IBulkActionOverview> {
    const startTime = Date.now();
    const result: IBulkActionOverview = {
      id: 'empty',
      databaseId: clientMetadata.databaseId,
      type: BulkActionType.Upload,
      summary: {
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
      },
      progress: null,
      filter: null,
      status: BulkActionStatus.Completed,
      duration: 0,
    };

    this.analyticsService.sendActionStarted(result);

    let parseErrors = 0;

    let client;

    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);

      let batch = [];

      const batchResults: BulkActionSummary[] = [];

      try {
        const rl = readline.createInterface({
          input: fileStream,
        });

        for await (const line of rl) {
          try {
            const [command, ...args] = splitCliCommandLine((line.trim()));
            if (batch.length >= BATCH_LIMIT) {
              batchResults.push(await this.executeBatch(client, batch));
              batch = [];
            }
            if (command) {
              batch.push([command.toLowerCase(), args]);
            }
          } catch (e) {
            parseErrors += 1;
          }
        }
      } catch (e) {
        result.summary.errors.push(e);
        result.status = BulkActionStatus.Failed;
        this.analyticsService.sendActionFailed(result, e);
      }

      batchResults.push(await this.executeBatch(client, batch));

      batchResults.forEach((batchResult) => {
        result.summary.processed += batchResult.getOverview().processed;
        result.summary.succeed += batchResult.getOverview().succeed;
        result.summary.failed += batchResult.getOverview().failed;
      });

      result.duration = Date.now() - startTime;
      result.summary.processed += parseErrors;
      result.summary.failed += parseErrors;

      if (result.status === BulkActionStatus.Completed) {
        this.analyticsService.sendActionSucceed(result);
      }

      client.disconnect();

      return result;
    } catch (e) {
      this.logger.error('Unable to process an import file', e);
      const exception = wrapHttpError(e);
      this.analyticsService.sendActionFailed(result, exception);
      client?.disconnect();
      throw exception;
    }
  }

  /**
   * Upload file from tutorial by path
   * @param clientMetadata
   * @param dto
   */
  public async uploadFromTutorial(
    clientMetadata: ClientMetadata,
    dto: UploadImportFileByPathDto,
  ): Promise<IBulkActionOverview> {
    try {
      const filePath = join(dto.path);

      const staticPath = join(SERVER_CONFIG.base, SERVER_CONFIG.staticUri);

      let trimmedPath = filePath;
      if (filePath.indexOf(staticPath) === 0) {
        trimmedPath = filePath.slice(staticPath.length);
      }

      const path = join(PATH_CONFIG.homedir, trimmedPath);

      if (!path.startsWith(PATH_CONFIG.homedir) || !await fs.pathExists(path)) {
        throw new BadRequestException('Data file was not found');
      }

      return this.import(clientMetadata, fs.createReadStream(path));
    } catch (e) {
      this.logger.error('Unable to process an import file path from tutorial', e);
      throw wrapHttpError(e);
    }
  }
}
