import { Command } from 'ioredis';
import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { concat } from 'lodash';
import { plainToClass } from 'class-transformer';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ShortLibrary, Library, Function } from 'src/modules/triggered-functions/models';
import {
  getLibraryInformation, getShortLibraryInformation, getLibraryFunctions,
} from 'src/modules/triggered-functions/utils';
import { UploadLibraryDto } from 'src/modules/triggered-functions/dto';
import { ClientMetadata } from 'src/common/models';
import ERROR_MESSAGES from 'src/constants/error-messages';

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
  public async libraryList(
    clientMetadata: ClientMetadata,
  ): Promise<ShortLibrary[]> {
    let client;
    try {
      client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST'], { replyEncoding: 'utf8' }),
      );
      const libraries = reply.map((lib: string[]) => getShortLibraryInformation(lib));
      return libraries.map((lib) => plainToClass(
        ShortLibrary,
        lib,
      ));
    } catch (e) {
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
  ): Promise<Library> {
    let client;
    try {
      client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST', 'WITHCODE', 'LIBRARY', name], { replyEncoding: 'utf8' }),
      );

      if (!reply.length) {
        this.logger.error(
          `Failed to get library details. Not Found library: ${name}.`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.LIBRARY_NOT_EXIST),
        );
      }
      const library = getLibraryInformation(reply[0]);
      return plainToClass(
        Library,
        library,
      );
    } catch (e) {
      this.logger.error('Unable to get library details', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get all triggered functions
   * @param clientMetadata
   */
  async functionsList(
    clientMetadata: ClientMetadata,
  ): Promise<Function[]> {
    let client;
    try {
      client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);
      const reply = await client.sendCommand(
        new Command('TFUNCTION', ['LIST', 'vvv'], { replyEncoding: 'utf8' }),
      );
      const functions = reply.reduce((prev, cur) => concat(prev, getLibraryFunctions(cur)), []);
      return functions.map((func) => plainToClass(
        Function,
        func,
      ));
    } catch (e) {
      this.logger.error('Unable to get all triggered functions', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Upload triggered functions library
   * @param clientMetadata
   * @param dto
   * @param isExist
   */
   async upload(
    clientMetadata: ClientMetadata,
    dto: UploadLibraryDto,
    isExist = false,
  ): Promise<void> {
    let client;
     try {
      const {
        code, configuration,
      } = dto;
       
       const commandArgs: any[] = isExist ? ['LOAD', 'REPLACE'] : ['LOAD'];
       
       if (configuration) {
        commandArgs.push('CONFIG', configuration);
       }

       commandArgs.push(code);

      client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);
      await client.sendCommand(
        new Command('TFUNCTION', [...commandArgs], { replyEncoding: 'utf8' }),
      );
       
      this.logger.log('Succeed to upload library.');

      return undefined;
    } catch (e) {
      this.logger.error('Unable to upload library', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }
}
