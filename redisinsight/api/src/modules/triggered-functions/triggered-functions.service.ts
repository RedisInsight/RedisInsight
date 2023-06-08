import { Command } from 'ioredis';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { catchAclError, classToClass } from 'src/utils';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { GetTriggeredFunctionsDto } from 'src/modules/triggered-functions/dto';
import { getLibraryInformation } from 'src/modules/triggered-functions/utils';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class TriggeredFunctionsService {
  private logger = new Logger('TriggeredFunctionsService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
  ) {}

  /**
   * Get analysis list for particular database with id and createdAt fields only
   * @param clientMetadata
   */
  async list(
    clientMetadata: ClientMetadata,
  ): Promise<GetTriggeredFunctionsDto> {
    let client;
    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST', 'WITHCODE', 'vvv'], { replyEncoding: 'utf8' }),
      );

      client.disconnect();
      return classToClass(
        GetTriggeredFunctionsDto,
        reply.map((lib: string[]) => getLibraryInformation(lib)),
      );
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to get database triggered functions', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }
}
