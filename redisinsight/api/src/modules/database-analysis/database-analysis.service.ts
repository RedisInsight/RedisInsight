import { HttpException, Injectable, Logger } from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { DatabaseAnalyzer } from 'src/modules/database-analysis/providers/database-analyzer';
import { plainToClass } from 'class-transformer';
import { DatabaseAnalysis, ShortDatabaseAnalysis } from 'src/modules/database-analysis/models';
import { DatabaseAnalysisProvider } from 'src/modules/database-analysis/providers/database-analysis.provider';
import { CreateDatabaseAnalysisDto } from 'src/modules/database-analysis/dto';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseAnalysisService {
  private logger = new Logger('DatabaseAnalysisService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private readonly analyzer: DatabaseAnalyzer,
    private readonly databaseAnalysisProvider: DatabaseAnalysisProvider,
    private readonly scanner: KeysScanner,
  ) {}

  /**
   * Get cluster details and details for all nodes
   * @param clientMetadata
   * @param dto
   */
  public async create(
    clientMetadata: ClientMetadata,
    dto: CreateDatabaseAnalysisDto,
  ): Promise<DatabaseAnalysis> {
    let client;

    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);

      const scanResults = await this.scanner.scan(client, {
        filter: dto.filter,
      });

      const progress = {
        total: 0,
        scanned: 0,
        processed: 0,
      };

      scanResults.forEach((nodeResult) => {
        progress.scanned += nodeResult.progress.scanned;
        progress.processed += nodeResult.progress.processed;
        progress.total += nodeResult.progress.total;
      });

      const analysis = plainToClass(DatabaseAnalysis, await this.analyzer.analyze({
        databaseId: clientMetadata.databaseId,
        db: client?.options?.db || 0,
        ...dto,
        progress,
      }, [].concat(...scanResults.map((nodeResult) => nodeResult.keys))));

      client.disconnect();
      return this.databaseAnalysisProvider.create(analysis);
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to analyze database', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get analysis with all fields by id
   * @param id
   */
  async get(id: string): Promise<DatabaseAnalysis> {
    return this.databaseAnalysisProvider.get(id);
  }

  /**
   * Get analysis list for particular database with id and createdAt fields only
   * @param databaseId
   */
  async list(databaseId: string): Promise<ShortDatabaseAnalysis[]> {
    return this.databaseAnalysisProvider.list(databaseId);
  }
}
