import { Logger } from '@nestjs/common';
import { ICachePlugin } from '@azure/msal-node';
import { MicrosoftAuthRepository } from './repositories/microsoft-auth.repository';
import { MicrosoftAuthSessionData } from './models/microsoft-auth-session.model';

/**
 * SQLite-based cache plugin for MSAL token persistence
 * Uses the MicrosoftAuthRepository to store token cache data in the database
 */
export class SQLitePersistencePlugin implements ICachePlugin {
    private readonly logger = new Logger('SQLitePersistencePlugin');
    public static readonly DEFAULT_ID = 'default';

    constructor(
        private readonly msAuthRepository: MicrosoftAuthRepository,
    ) {}

    async beforeCacheAccess(cacheContext: any): Promise<void> {
        try {
            this.logger.log(`Loading token cache from database...`);
            const authData = await this.msAuthRepository.get();

            if (authData?.tokenCache) {
                const serializedCache = authData.tokenCache;
                this.logger.log(`Token cache found in database, size: ${serializedCache.length} bytes`);

                cacheContext.tokenCache.deserialize(serializedCache);
            } else {
                this.logger.log(`No token cache found in database`);
            }
        } catch (error) {
            this.logger.error(`Error reading token cache from database:`, error);
        }
    }

    async afterCacheAccess(cacheContext: any): Promise<void> {
        if (cacheContext.cacheHasChanged) {
            try {
                this.logger.log(`Token cache has changed, persisting to database...`);

                const serializedCache = cacheContext.tokenCache.serialize();
                let existingData = null;

                try {
                    existingData = await this.msAuthRepository.get();
                } catch (getError) {
                    this.logger.warn(`Failed to get existing token data: ${getError.message}. Will create new entry.`);
                }

                await this.msAuthRepository.save({
                    id: SQLitePersistencePlugin.DEFAULT_ID,
                    // TODO: update with the dbId at some point - the request is to keep details per DB.
                    tokenCache: serializedCache,
                    lastUpdated: Date.now(),
                    ...existingData ? {
                        username: existingData.username,
                        accountId: existingData.accountId,
                        tenantId: existingData.tenantId,
                        displayName: existingData.displayName
                    } : {}
                });

                this.logger.log(`Token cache successfully saved to database, size: ${serializedCache.length} bytes`);

            } catch (error) {
                this.logger.error(`Error saving token cache to database:`, error);
            }
        }
    }
}