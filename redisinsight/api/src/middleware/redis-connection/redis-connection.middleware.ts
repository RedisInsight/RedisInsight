import {
  BadRequestException,
  Injectable,
  Logger,
  NestMiddleware,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { NextFunction, Request, Response } from 'express';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import { DatabaseService } from 'src/modules/database/database.service';
import { plainToClass } from 'class-transformer';
import { sessionMetadataFromRequest } from 'src/common/decorators';
import { Database } from 'src/modules/database/models/database';
import { MicrosoftAuthService } from 'src/modules/auth/microsoft-auth/microsoft-azure-auth.service';

@Injectable()
export class RedisConnectionMiddleware implements NestMiddleware, OnModuleInit {
  private logger = new Logger('RedisConnectionMiddleware');
  private microsoftAuthService: MicrosoftAuthService;

  constructor(
    private databaseService: DatabaseService,
    private moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    try {
      // Get MicrosoftAuthService dynamically to avoid circular dependencies
      // TODO: Review after PR!
      this.microsoftAuthService = this.moduleRef.get(MicrosoftAuthService, { strict: false });
    } catch (error) {
      this.logger.error('RedisConnectionMiddleware - Failed to get MicrosoftAuthService');
    }
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { instanceIdFromReq } = RedisConnectionMiddleware.getConnectionConfigFromReq(req);
    if (!instanceIdFromReq) {
      this.throwError(req, ERROR_MESSAGES.UNDEFINED_INSTANCE_ID);
    }

    const sessionMetadata = sessionMetadataFromRequest(req);

    const existDatabaseInstance = await this.databaseService.exists(sessionMetadata, instanceIdFromReq);
    if (!existDatabaseInstance) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
    }

    // Get the database to check if it's an Azure database
    try {
      const database = await this.databaseService.get(sessionMetadata, instanceIdFromReq);

      const isAzureDatabase = ['AZURE_CACHE', 'AZURE'].includes(database?.provider) ||
                              (database?.cloudDetails &&
                               database?.cloudDetails.hasOwnProperty('provider') &&
                               ['AZURE_CACHE', 'AZURE'].includes(database?.cloudDetails['provider']));

      // Only associate Microsoft auth account with Azure databases
      if (isAzureDatabase && this.microsoftAuthService) {
        try {
          this.logger.log(`RedisConnectionMiddleware - Associating Microsoft account with Azure database ${instanceIdFromReq}`);
          await this.microsoftAuthService.associateAccountWithDatabase(instanceIdFromReq);
        } catch (error) {
          this.logger.warn(`RedisConnectionMiddleware - Failed to associate Microsoft account with database ${instanceIdFromReq}: ${error.message}`);
          // Don't fail the connection process if Microsoft auth association fails
        }
      }
    } catch (dbError) {
      this.logger.error(`RedisConnectionMiddleware - Failed to retrieve database info: ${dbError.message}`);
      // Continue anyway - don't fail the connection
    }

    next();
  }

  private static getConnectionConfigFromReq(req: Request) {
    return { instanceIdFromReq: req.params.dbInstance };
  }

  private throwError(req: Request, message: string) {
    const { method, url } = req;
    this.logger.error(`${message} ${method} ${url}`);
    throw new BadRequestException(message);
  }
}
