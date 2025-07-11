import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { DEFAULT_TOKEN_MANAGER_CONFIG, EntraIdCredentialsProviderFactory, PKCEParams } from '@redis/entraid/dist/lib/entra-id-credentials-provider-factory';
import config from 'src/utils/config';
import { EntraidCredentialsProvider } from '@redis/entraid/dist/lib/entraid-credentials-provider';
import { CloudAuthStatus } from 'src/modules/cloud/auth/models/cloud-auth-response';
import { AuthenticationResult } from '@azure/msal-common/node';
import { Token } from '@redis/client/dist/lib/authx/token';
import { AccountInfo, PublicClientApplication } from '@azure/msal-node';
import { MSALIdentityProvider } from '@redis/entraid/dist/lib/msal-identity-provider';
import { TokenManager } from '@redis/client/dist/lib/authx/token-manager';
import { MicrosoftAuthRepository } from './repositories/microsoft-auth.repository';
import { MicrosoftAuthSessionData } from './models/microsoft-auth-session.model';
import { SQLitePersistencePlugin } from './sqlite-persistence-plugin';

const { idp: { microsoft: idpConfig } } = config.get('cloud');

interface MicrosoftAuthOptions {
    action: string;
    callback: (result: MicrosoftCredentials) => Promise<void> | void;
    state: string;
    client_info?: string;
    databaseId?: string;
}

interface MicrosoftAuthQuery {
    state: string;
    code: string;
}

interface MicrosoftCredentials {
    status: CloudAuthStatus;
    username: string;
    password: string;
    databaseId: string;
}

interface EntraIdAuthProvider {
    getPKCECodes: () => Promise<{
        verifier: string;
        challenge: string;
        challengeMethod: string;
    }>;
    getAuthCodeUrl: (pkceCodes: {
        challenge: string;
        challengeMethod: string;
    }) => Promise<string>;
    createCredentialsProvider: (params: PKCEParams) => EntraidCredentialsProvider;
}

@Injectable()
export class MicrosoftAuthService implements OnModuleInit {
    private readonly logger = new Logger('MicrosoftAuthService');

    private authRequests: Map<string, any> = new Map();
    private inProgressRequests: Map<string, any> = new Map();
    private activeCredentialsProviders: Map<string, EntraidCredentialsProvider> = new Map();
    private entraIdProvider: EntraIdAuthProvider;
    private msalClient: PublicClientApplication;
    private scopes: string[];

    private persistencePlugin: SQLitePersistencePlugin;
    private currentActiveAccount: AccountInfo | null = null;

    constructor(
        private readonly msAuthRepository: MicrosoftAuthRepository,
    ) {
        this.scopes = [
            'offline_access',
            'openid',
            'email',
            'profile',
            'https://management.azure.com/user_impersonation',
            // 'https://redis.azure.com'
        ];

        this.persistencePlugin = new SQLitePersistencePlugin(this.msAuthRepository);
        this.msalClient = new PublicClientApplication({
            auth: {
                clientId: idpConfig.clientId,
                authority: idpConfig.authority
            },
            cache: {
                cachePlugin: this.persistencePlugin
            }
        });

        const provider = EntraIdCredentialsProviderFactory.createForAuthorizationCodeWithPKCE({
            clientId: idpConfig.clientId,
            redirectUri: idpConfig.redirectUri,
            tokenManagerConfig: {
                ...DEFAULT_TOKEN_MANAGER_CONFIG,
                expirationRefreshRatio: 0.8
            },
            authorityConfig: { type: 'custom', authorityUrl: idpConfig.authority },
            // authorityConfig: { type: 'multi-tenant', tenantId: '562f7bf2-f594-47bf-8ac3-a06514b5d434' },
            scopes: this.scopes,
        });

        this.entraIdProvider = {
            ...provider,
            createCredentialsProvider: (pkceParams) => {
                const idp = new MSALIdentityProvider(
                    async () => {
                        const authResult = await this.msalClient.acquireTokenByCode({
                            code: pkceParams.code,
                            codeVerifier: pkceParams.verifier,
                            scopes: this.scopes,
                            redirectUri: idpConfig.redirectUri,

                        });

                        const state = Object.keys(this.inProgressRequests)[0];
                        const databaseId = this.inProgressRequests.get(state)?.options?.databaseId || SQLitePersistencePlugin.DEFAULT_ID;
                        this.updateAccountInfo(authResult.account, databaseId);
                        this.currentActiveAccount = authResult.account;

                        return authResult;
                    }
                );

                const tm = new TokenManager(idp, DEFAULT_TOKEN_MANAGER_CONFIG);
                return new EntraidCredentialsProvider(tm, idp, {});
            }
        };
    }

    async onModuleInit() {
        this.logger.log('Microsoft Auth Service initializing...');
        try {
            try {
                const authData = await this.msAuthRepository.get(SQLitePersistencePlugin.DEFAULT_ID);
                if (!authData) {
                    await this.msAuthRepository.save({
                        id: SQLitePersistencePlugin.DEFAULT_ID,
                        tokenCache: null,
                        username: null,
                        accountId: null,
                        tenantId: null,
                        displayName: null,
                        lastUpdated: Date.now()
                    });

                    this.logger.log('[Init] Empty database entry created for future use');
                }
            } catch (repoError) {
                this.logger.error('Error checking/initializing auth repository:', repoError);
            }


        } catch (error) {
            this.logger.error('[Init] Error during Microsoft Auth Service initialization:', error);
        }

        this.logger.log('Microsoft Auth Service initialized');
    }

    /**
     * Update account information in our storage
     * @param account The account information from MSAL
     * @param databaseId The database ID to associate with this account
     * @private
     */
    private async updateAccountInfo(account: AccountInfo, databaseId: string = SQLitePersistencePlugin.DEFAULT_ID): Promise<void> {
        try {
            let existingData: MicrosoftAuthSessionData | null = null;
            try {
                existingData = await this.msAuthRepository.get(databaseId);
            } catch (getError) {
                this.logger.warn(`[Account] Failed to get existing account data for database ${databaseId}: ${getError.message}. Will create new entry.`);
            }

            let tokenCache = existingData?.tokenCache;
            if (!tokenCache && databaseId !== SQLitePersistencePlugin.DEFAULT_ID) {
                try {
                    const defaultData = await this.msAuthRepository.get(SQLitePersistencePlugin.DEFAULT_ID);
                    tokenCache = defaultData?.tokenCache;
                } catch (defaultError) {
                    this.logger.warn(`[Account] Failed to get default account data for token cache: ${defaultError.message}`);
                }
            }

            // Update or create auth data
            const updatedData: Partial<MicrosoftAuthSessionData> = {
                id: databaseId,
                username: account.username,
                accountId: account.homeAccountId,
                tenantId: account.tenantId,
                displayName: account.name,
                lastUpdated: Date.now(),
                // Use the token cache we found (either from the specific database entry,
                // the default entry, or null if neither exists)
                tokenCache: tokenCache || null
            };

            try {
                await this.msAuthRepository.save(updatedData);
            } catch (saveError) {
                this.logger.error(`[Account] Failed to save account info for database ${databaseId}: ${saveError.message}`);

                // Try once more after ensuring table exists again
                try {
                    await this.msAuthRepository.save(updatedData);
                    this.logger.log(`[Account] Retry successful - Updated account info in database for ${databaseId}: ${account.username}`);
                } catch (retryError) {
                    this.logger.error(`[Account] Retry failed - Could not save account info for database ${databaseId}: ${retryError.message}`);
                    throw retryError;
                }
            }
        } catch (error) {
            this.logger.error(`[Account] Error updating account info for database ${databaseId}:`, error);
        }
    }

    private async restoreActiveAccount(databaseId: string = SQLitePersistencePlugin.DEFAULT_ID): Promise<boolean> {
        try {
            this.logger.log(`[Token Restoration] Starting account restoration for database ${databaseId}`);

            const accounts = await this.msalClient.getTokenCache().getAllAccounts();

            if (accounts.length === 0) {
                this.logger.warn(`[Token Restoration] No accounts found in token cache for database ${databaseId}`);
                return false;
            }

            this.logger.log(`[Token Restoration] Found ${accounts.length} accounts in token cache`);

            accounts.forEach((acc, index) => {
                this.logger.log(`[Token Restoration] Account #${index + 1}: Username: ${acc.username}, ID: ${acc.homeAccountId}, Tenant: ${acc.tenantId}`);
            });

            const savedAuthData = await this.msAuthRepository.get(databaseId);

            let selectedAccount: AccountInfo | undefined;

            if (savedAuthData?.accountId) {
                selectedAccount = accounts.find(acc => acc.homeAccountId === savedAuthData.accountId);

                if (!selectedAccount) {
                    selectedAccount = accounts[0];
                }
            } else {
                selectedAccount = accounts[0];
            }

            if (selectedAccount) {
                this.recreateCredentialsProvider(selectedAccount, databaseId);

                try {
                    const authResult = await this.msalClient.acquireTokenSilent({
                        account: selectedAccount,
                        scopes: this.scopes,
                        forceRefresh: false
                    });

                    return true;
                } catch (tokenError) {
                    this.logger.warn(`[Token Restoration] Token acquisition test failed for database ${databaseId}, but continuing with account restoration`, tokenError);
                    return true;
                }
            }

            return false;
        } catch (error) {
            this.logger.error(`[Token Restoration] Error restoring active account for database ${databaseId}:`, error);
            return false;
        }
    }

    async getAuthorizationUrl(
        sessionMetadata: SessionMetadata,
        options?: MicrosoftAuthOptions
    ): Promise<string> {
        const pkceCodes = await this.entraIdProvider.getPKCECodes();
        const authUrl = await this.entraIdProvider.getAuthCodeUrl({
            challenge: pkceCodes.challenge,
            challengeMethod: pkceCodes.challengeMethod,
        });

        const authRequest = {
            sessionMetadata,
            options,
            pkceCodes,
            callback: options?.callback,
            action: options?.action,
            databaseId: options?.databaseId
        };

        this.authRequests.clear();
        this.authRequests.set(options?.state, authRequest);
        return authUrl;
    }

    async handleCallback(query: MicrosoftAuthQuery): Promise<MicrosoftCredentials> {
        let result: MicrosoftCredentials;
        let authRequest: any;
        let databaseId: string;

        try {
            if (!this.authRequests.has(query.state)) {
                this.logger.log(
                    `${query.state ? 'Auth Request matching query state not found' : 'Query state field is empty'}`,
                );
                throw new Error('Unknown authorization request');
            }

            authRequest = this.authRequests.get(query.state);
            databaseId = authRequest.databaseId || SQLitePersistencePlugin.DEFAULT_ID;

            this.authRequests.delete(query.state);
            this.inProgressRequests.set(query.state, authRequest);

            const idp = new MSALIdentityProvider(
                async () => {
                    const accounts = await this.msalClient.getTokenCache().getAllAccounts();

                    if (accounts.length > 0) {
                        this.logger.log(`[Token] Found accounts in cache for database ${databaseId}, checking for correct account to use`);

                        const savedAuthData = await this.msAuthRepository.get(databaseId);
                        let accountToUse = accounts[0];

                        if (savedAuthData?.accountId) {
                            const foundAccount = accounts.find(acc =>
                                acc.homeAccountId === savedAuthData.accountId);
                            if (foundAccount) {
                                accountToUse = foundAccount;
                            } else {
                                this.logger.warn(`[Token] Saved account ID ${savedAuthData.accountId} for database ${databaseId} not found in cache`);
                            }
                        } else {
                            this.logger.warn(`[Token] No saved account ID found for database ${databaseId}, using first account as fallback`);
                        }

                        const authResult = await this.msalClient.acquireTokenSilent({
                            account: accountToUse,
                            scopes: this.scopes,
                            forceRefresh: true
                        });

                        this.updateAccountInfo(authResult.account, databaseId);

                        return authResult;
                    } else {
                        this.logger.log(`[Token] Using initial token acquisition with code for database ${databaseId}`);
                        const authResult = await this.msalClient.acquireTokenByCode({
                            code: query.code as string,
                            codeVerifier: authRequest.pkceCodes.verifier,
                            scopes: this.scopes,
                            redirectUri: idpConfig.redirectUri,
                        });

                        this.updateAccountInfo(authResult.account, databaseId);

                        return authResult;
                    }
                }
            );

            const tm = new TokenManager(idp, DEFAULT_TOKEN_MANAGER_CONFIG);
            const credentialsProvider = new EntraidCredentialsProvider(tm, idp, {});

            this.activeCredentialsProviders.set(databaseId, credentialsProvider);

            const [credentials] = await credentialsProvider.subscribe({
                onNext: async (token) => {
                    this.logger.log(`Token acquired for database ${databaseId}`, token);
                },
                onError: (error) => {
                    this.logger.error(`Token acquisition failed for database ${databaseId}:`, error);
                }
            });

            if (!credentials?.username || !credentials?.password) {
                throw new Error('Invalid credentials received');
            }

            delete authRequest.pkceCodes;
            result = {
                status: CloudAuthStatus.Succeed,
                username: credentials.username,
                password: credentials.password,
                databaseId: databaseId
            };
        } catch (e) {
            this.logger.error(`Microsoft auth callback failed for database ${databaseId}`, e);
            result = {
                status: CloudAuthStatus.Failed,
                username: '',
                password: '',
                databaseId: databaseId
            };
        }

        try {
            if (authRequest?.callback) {
                const callbackResult = authRequest.callback(result);
                if (callbackResult instanceof Promise) {
                    await callbackResult;
                }
            }
        } catch (e) {
            this.logger.error('Unexpected error in callback handling', e);
        }

        this.finishInProgressRequest(query);
        return result;
    }

    isRequestInProgress(query): boolean {
        return this.inProgressRequests.has(query?.state);
    }

    finishInProgressRequest(query): void {
        this.inProgressRequests.delete(query?.state);
    }

    async getSession(databaseId: string = SQLitePersistencePlugin.DEFAULT_ID): Promise<AuthenticationResult | null> {
        try {

            if (!this.activeCredentialsProviders.has(databaseId)) {
                const restored = await this.restoreActiveAccount(databaseId);
                if (!restored) {
                    this.logger.warn(`[Session] Could not restore active account for database ${databaseId}`);
                    return null;
                }
            }

            const credentialsProvider = this.activeCredentialsProviders.get(databaseId);
            const credentials: Token<AuthenticationResult> | null = await credentialsProvider.tokenManager.getCurrentToken();

            if (credentials) {
                return credentials.value;
            }


            const accounts = await this.msalClient.getTokenCache().getAllAccounts();
            if (accounts.length === 0) {
                this.logger.warn(`[Session] No accounts found in token cache during fallback for database ${databaseId}`);
                return null;
            }

            const savedAuthData = await this.msAuthRepository.get(databaseId);
            const foundAccount = accounts.find(acc => acc.homeAccountId === savedAuthData.accountId);

            try {
                const authResult = await this.msalClient.acquireTokenSilent({
                    account: foundAccount,
                    scopes: this.scopes,
                    forceRefresh: false
                });

                if (authResult) {

                    this.recreateCredentialsProvider(foundAccount, databaseId);

                    return authResult;
                }
            } catch (tokenError) {
                this.logger.error(`[Session] Fallback token acquisition failed for database ${databaseId}:`, tokenError);
            }

            this.logger.warn(`[Session] No credentials available after fallback attempts for database ${databaseId}`);
            return null;
        } catch (e) {
            this.logger.error(`[Session] Failed to get Microsoft session for database ${databaseId}`, e);
            return null;
        }
    }

    async getAccessToken(databaseId: string = SQLitePersistencePlugin.DEFAULT_ID): Promise<string | null> {
        try {
            const session = await this.getSession(databaseId);

            if (session?.accessToken) {
                const tokenLength = session.accessToken.length;
                const tokenPrefix = session.accessToken.substring(0, 5);
                const tokenSuffix = session.accessToken.substring(tokenLength - 5);
                return session.accessToken;
            } else {
                this.logger.warn(`[Token] No access token available in session for database ${databaseId}`);
                return null;
            }
        } catch (e) {
            this.logger.error(`[Token] Failed to get access token for database ${databaseId}`, e);
            return null;
        }
    }

    private recreateCredentialsProvider(account: AccountInfo, databaseId: string = SQLitePersistencePlugin.DEFAULT_ID): void {
        const idp = new MSALIdentityProvider(
            async () => {
                return this.msalClient.acquireTokenSilent({
                    account,
                    scopes: this.scopes,
                    forceRefresh: false
                });
            }
        );

        const tm = new TokenManager(idp, DEFAULT_TOKEN_MANAGER_CONFIG);
        const credentialsProvider = new EntraidCredentialsProvider(tm, idp, {});

        this.activeCredentialsProviders.set(databaseId, credentialsProvider);
    }

    async getSubscriptions(databaseId: string = SQLitePersistencePlugin.DEFAULT_ID): Promise<any[] | null> {
        try {
            const token = await this.getAccessToken(databaseId);
            if (!token) {
                this.logger.warn(`[Subscriptions] No access token available to retrieve subscriptions for database ${databaseId}`);
                return null;
            }

            const response = await fetch('https://management.azure.com/subscriptions?api-version=2020-01-01', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`[Subscriptions] Failed to retrieve subscriptions for database ${databaseId}: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            if (data && Array.isArray(data.value)) {
                return data.value;
            } else {
                this.logger.warn(`[Subscriptions] Received unexpected response format from Azure API for database ${databaseId}`);
                return null;
            }
        } catch (error) {
            this.logger.error(`[Subscriptions] Error retrieving subscriptions for database ${databaseId}:`, error);
            return null;
        }
    }

    async associateAccountWithDatabase(databaseId: string): Promise<boolean> {
        try {
            if (this.currentActiveAccount) {
                await this.updateAccountInfo(this.currentActiveAccount, databaseId);
                return true;
            }

            const accounts = await this.msalClient.getTokenCache().getAllAccounts();
            if (accounts.length === 0) {
                this.logger.warn(`[Database Association] No accounts found in token cache for database ${databaseId}`);
                return false;
            }

            let existingData: MicrosoftAuthSessionData | null = null;
            try {
                existingData = await this.msAuthRepository.get(databaseId);
            } catch (getError) {
                this.logger.warn(`[Database Association] No existing account data for database ${databaseId}`);
            }

            let selectedAccount: AccountInfo | null = null;
            if (existingData?.accountId) {
                selectedAccount = accounts.find(acc => acc.homeAccountId === existingData.accountId) || null;
            }

            if (!selectedAccount && accounts.length > 0) {
                selectedAccount = accounts[0];
            }

            if (selectedAccount) {
                await this.updateAccountInfo(selectedAccount, databaseId);
                this.recreateCredentialsProvider(selectedAccount, databaseId);
                this.currentActiveAccount = selectedAccount;
                return true;
            }

            this.logger.warn(`[Database Association] No suitable account found to associate with database ${databaseId}`);
            return false;
        } catch (error) {
            this.logger.error(`[Database Association] Error associating account with database ${databaseId}:`, error);
            return false;
        }
    }

    async deleteSession(databaseId: string): Promise<void> {
        try {
            await this.msAuthRepository.delete(databaseId);
        } catch (error) {
            this.logger.error(`Failed to delete Microsoft auth session for database ${databaseId}:`, error);
            throw error;
        }
    }
}