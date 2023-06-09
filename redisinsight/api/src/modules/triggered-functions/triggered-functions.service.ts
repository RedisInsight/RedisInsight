import { Command } from 'ioredis';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { concat } from 'lodash';
import { catchAclError, classToClass } from 'src/utils';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ShortLibraryInformation, LibraryInformation, Function } from 'src/modules/triggered-functions/models';
import { getLibraryInformation, getShortLibraryInformation, getFunctions } from 'src/modules/triggered-functions/utils';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class TriggeredFunctionsService {
  private logger = new Logger('TriggeredFunctionsService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
  ) {}

  /**
   * Get library list for particular database with name, user, totalFunctions, pendingJobs fields only
   * @param clientMetadata
   */
  async libraryList(
    clientMetadata: ClientMetadata,
  ): Promise<ShortLibraryInformation[]> {
    let client;
    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST'], { replyEncoding: 'utf8' }),
      );
      client.disconnect();
      const libraries = reply.map((lib: string[]) => getShortLibraryInformation(lib));
      return libraries.map((lib) => classToClass(
        ShortLibraryInformation,
        lib,
      ));
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to get database libraries', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get library details
   * @param clientMetadata
   * @param name
   */
  async details(
    clientMetadata: ClientMetadata,
    name: string,
  ): Promise<LibraryInformation> {
    let client;
    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST', 'WITHCODE', 'LIBRARY', name], { replyEncoding: 'utf8' }),
      );
      client.disconnect();
      const libraries = reply.map((lib: string[]) => getLibraryInformation(lib));
      return classToClass(
        LibraryInformation,
        libraries[0],
      );
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to get database triggered functions libraries', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get library list for particular database with name, user, totalFunctions, pendingJobs fields only
   * @param clientMetadata
   * @param name
   */
  async functionsList(
    clientMetadata: ClientMetadata,
  ): Promise<Function[]> {
    let client;
    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST', 'vvv'], { replyEncoding: 'utf8' }),
      );
      const functions = reply.reduce((prev, cur) => concat(prev, getFunctions(cur)), []);
      client.disconnect();
      console.log(functions)
      return functions.map((func) => classToClass(
        Function,
        func,
      ));
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to get database triggered functions libraries', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }
}
