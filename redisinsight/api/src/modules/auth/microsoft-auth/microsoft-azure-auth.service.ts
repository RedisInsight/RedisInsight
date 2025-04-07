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
}

interface MicrosoftAuthQuery {
    state: string;
    code: string;
}

interface MicrosoftCredentials {
    status: CloudAuthStatus;
    username: string;
    password: string;
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
    private activeCredentialsProvider: EntraidCredentialsProvider | null = null;
    private entraIdProvider: EntraIdAuthProvider;
    private msalClient: PublicClientApplication;
    private scopes: string[];

    private persistencePlugin: SQLitePersistencePlugin;

    constructor(
        private readonly msAuthRepository: MicrosoftAuthRepository,
    ) {
        this.scopes = [
            'offline_access',
            'openid',
            'email',
            'profile',
            'https://management.azure.com/user_impersonation'
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
                expirationRefreshRatio: 0.00000001
            },
            authorityConfig: { type: 'custom', authorityUrl: idpConfig.authority },
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

                        this.updateAccountInfo(authResult.account);

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
        // This will most likely need to be updated to an actual rest api call, similar to how the cloud service checks auth.
        try {
            try {
                const authData = await this.msAuthRepository.get();
                if (!authData) {
                    this.logger.log('[Init] No valid database entry found, creating an empty one');

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

            const restored = await this.restoreActiveAccount();

            if (restored) {
                const token = await this.getAccessToken();
                if (token) {
                    try {
                        // TODO: Remove this test method call. this is used for quick validation of the token during dev. It should NOT be used in prod
                        const subscriptions = await this.getSubscriptions();
                        this.logger.log(`[Init] Successfully retrieved ${subscriptions.length} subscriptions`);

                        subscriptions?.forEach((sub, index) => {
                            this.logger.log(`[Init] Subscription #${index + 1}: ${sub.displayName || 'Unnamed'} (${sub.subscriptionId})`);
                        });
                    } catch (subscriptionError) {
                        this.logger.error('[Init] Error retrieving subscriptions:', subscriptionError);
                    }
                } else {
                    this.logger.warn('[Init] Access token could not be retrieved during initialization');
                }
            } else {
                this.logger.log('[Init] No Microsoft account to restore during initialization');
            }
        } catch (error) {
            this.logger.error('[Init] Error during Microsoft Auth Service initialization:', error);
        }

        this.logger.log('Microsoft Auth Service initialized');
    }

    /**
     * Update account information in our storage
     * @param account The account information from MSAL
     * @private
     */
    private async updateAccountInfo(account: AccountInfo): Promise<void> {
        try {
            let existingData: MicrosoftAuthSessionData | null = null;
            try {
                existingData = await this.msAuthRepository.get();
            } catch (getError) {
                this.logger.warn(`[Account] Failed to get existing account data: ${getError.message}. Will create new entry.`);
            }

            // Update or create auth data
            const updatedData: Partial<MicrosoftAuthSessionData> = {
                id: SQLitePersistencePlugin.DEFAULT_ID,
                // TODO: update with the dbId at some point - the request is to keep details per DB.
                username: account.username,
                accountId: account.homeAccountId,
                tenantId: account.tenantId,
                displayName: account.name,
                lastUpdated: Date.now(),
                // Preserve token cache if it exists
                tokenCache: existingData?.tokenCache || null
            };

            try {
                await this.msAuthRepository.save(updatedData);
                this.logger.log(`[Account] Updated account info in database: ${account.username}`);
            } catch (saveError) {
                this.logger.error(`[Account] Failed to save account info: ${saveError.message}`);

                // Try once more after ensuring table exists again
                try {
                    await this.msAuthRepository.save(updatedData);
                    this.logger.log(`[Account] Retry successful - Updated account info in database: ${account.username}`);
                } catch (retryError) {
                    this.logger.error(`[Account] Retry failed - Could not save account info: ${retryError.message}`);
                    throw retryError;
                }
            }
        } catch (error) {
            this.logger.error(`[Account] Error updating account info:`, error);
        }
    }

    /**
     * Restore active account and credentials provider from the database
     * @private
     */
    private async restoreActiveAccount(): Promise<boolean> {
        try {
            this.logger.log(`[Token Restoration] Starting account restoration`);

            // Get accounts from the token cache
            // The token cache should already be loaded from the database by the persistence plugin
            const accounts = await this.msalClient.getTokenCache().getAllAccounts();

            if (accounts.length === 0) {
                this.logger.warn('[Token Restoration] No accounts found in token cache');
                return false;
            }

            this.logger.log(`[Token Restoration] Found ${accounts.length} accounts in token cache`);

            // Log details of all found accounts (for debugging)
            accounts.forEach((acc, index) => {
                this.logger.log(`[Token Restoration] Account #${index + 1}: Username: ${acc.username}, ID: ${acc.homeAccountId}, Tenant: ${acc.tenantId}`);
            });

            // Use the first account for now
            // (in future we could store a preferred account ID in the database)
            const selectedAccount = accounts[0];

            if (selectedAccount) {
                // Recreate credentials provider with the selected account
                this.logger.log(`[Token Restoration] Recreating credentials provider with account: ${selectedAccount.username}`);
                this.recreateCredentialsProvider(selectedAccount);

                // Test if the token is valid
                try {
                    this.logger.log(`[Token Restoration] Testing token acquisition`);
                    const authResult = await this.msalClient.acquireTokenSilent({
                        account: selectedAccount,
                        scopes: this.scopes,
                        forceRefresh: false
                    });

                    this.logger.log(`[Token Restoration] Token acquired successfully, expires: ${new Date(authResult.expiresOn).toISOString()}`);
                    return true;
                } catch (tokenError) {
                    this.logger.warn(`[Token Restoration] Token acquisition test failed, but continuing with account restoration`, tokenError);
                    return true; // Still return true as we have an account, even if token acquisition failed
                }
            }

            return false;
        } catch (error) {
            this.logger.error('[Token Restoration] Error restoring active account:', error);
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
            challengeMethod: pkceCodes.challengeMethod
        });

        const authRequest = {
            sessionMetadata,
            options,
            pkceCodes,
            callback: options?.callback,
            action: options?.action
        };

        this.authRequests.clear();
        this.authRequests.set(options?.state, authRequest);
        return authUrl;
    }

    async handleCallback(query: MicrosoftAuthQuery): Promise<MicrosoftCredentials> {
        let result: MicrosoftCredentials;
        let authRequest: any;
        try {
            if (!this.authRequests.has(query?.state)) {
                this.logger.log(
                    `${query?.state ? 'Auth Request matching query state not found' : 'Query state field is empty'}`,
                );
                throw new Error('Unknown authorization request');
            }

            authRequest = this.authRequests.get(query.state);
            this.authRequests.delete(query.state);
            this.inProgressRequests.set(query.state, authRequest);

            this.activeCredentialsProvider = this.entraIdProvider.createCredentialsProvider(
                {
                    code: query.code as string,
                    verifier: authRequest.pkceCodes.verifier,
                    clientInfo: authRequest.options.client_info as string | undefined
                },
            );

            const [credentials] = await this.activeCredentialsProvider.subscribe({
                onNext: async (token) => {
                    this.logger.log('Token acquired', token);
                },
                onError: (error) => {
                    this.logger.error('Token acquisition failed:', error);
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
            };
        } catch (e) {
            this.logger.error('Microsoft auth callback failed', e);
            result = {
                status: CloudAuthStatus.Failed,
                username: '',
                password: '',
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

    async getSession(): Promise<AuthenticationResult | null> {
        try {
            this.logger.log(`[Session] Attempting to get session`);

            // If no active provider, try to restore it
            if (!this.activeCredentialsProvider) {
                this.logger.log(`[Session] No active credentials provider, attempting to restore account`);
                const restored = await this.restoreActiveAccount();
                if (!restored) {
                    this.logger.warn(`[Session] Could not restore active account`);
                    return null;
                }
                this.logger.log(`[Session] Successfully restored active account`);
            } else {
                this.logger.log(`[Session] Using existing credentials provider`);
            }

            // Get the latest credentials from the provider
            this.logger.log(`[Session] Requesting current token from credentials provider`);
            const credentials: Token<AuthenticationResult> | null = await this.activeCredentialsProvider.tokenManager.getCurrentToken();

            if (credentials) {
                this.logger.log(`[Session] Credentials successfully obtained from token manager, expires: ${new Date(credentials.value.expiresOn).toISOString()}`);
                return credentials.value;
            }

            // If token manager returned null, try direct MSAL client approach as fallback
            this.logger.log(`[Session] No credentials from token manager, falling back to direct MSAL client approach`);

            // Get accounts from MSAL
            const accounts = await this.msalClient.getTokenCache().getAllAccounts();
            if (accounts.length === 0) {
                this.logger.warn(`[Session] No accounts found in token cache during fallback`);
                return null;
            }

            // TODO: update to use the correct account. This is for POC level testing only
            const selectedAccount = accounts[0];
            this.logger.log(`[Session] Using account for fallback token acquisition: ${selectedAccount.username}`);

            try {
                const authResult = await this.msalClient.acquireTokenSilent({
                    account: selectedAccount,
                    scopes: this.scopes,
                    forceRefresh: false
                });

                if (authResult) {
                    this.logger.log(`[Session] Fallback token acquisition successful, expires: ${new Date(authResult.expiresOn).toISOString()}`);

                    // Update our credentials provider with the fresh account
                    this.recreateCredentialsProvider(selectedAccount);

                    return authResult;
                }
            } catch (tokenError) {
                this.logger.error(`[Session] Fallback token acquisition failed:`, tokenError);
            }

            this.logger.warn(`[Session] No credentials available after fallback attempts`);
            return null;
        } catch (e) {
            this.logger.error(`[Session] Failed to get Microsoft session`, e);
            return null;
        }
    }

    async getAccessToken(): Promise<string | null> {
        try {
            this.logger.log(`[Token] Attempting to get access token`);
            const session = await this.getSession();

            if (session?.accessToken) {
                // Log token details (not the actual token for security)
                const tokenLength = session.accessToken.length;
                const tokenPrefix = session.accessToken.substring(0, 5);
                const tokenSuffix = session.accessToken.substring(tokenLength - 5);
                this.logger.log(`[Token] Access token retrieved, length: ${tokenLength}, prefix: ${tokenPrefix}..., suffix: ...${tokenSuffix}`);
                this.logger.log(`[Token] Token expires on: ${new Date(session.expiresOn).toISOString()}`);
                return session.accessToken;
            } else {
                this.logger.warn(`[Token] No access token available in session`);
                return null;
            }
        } catch (e) {
            this.logger.error(`[Token] Failed to get access token`, e);
            return null;
        }
    }

    /**
     * Recreate the credentials provider for the given account
     * @param account MSAL account
     * @private
     */
    private recreateCredentialsProvider(account: AccountInfo): void {
        // Create a new credentials provider using the saved account
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
        this.activeCredentialsProvider = new EntraidCredentialsProvider(tm, idp, {});
    }


    /**
     * Tests the access token by attempting to retrieve Azure subscriptions
     * @returns An array of subscription objects or null if unsuccessful
     */
    async getSubscriptions(): Promise<any[] | null> {
        try {
            this.logger.log('[Subscriptions] Attempting to retrieve Azure subscriptions');

            // Get the access token
            const token = await this.getAccessToken();
            if (!token) {
                this.logger.warn('[Subscriptions] No access token available to retrieve subscriptions');
                return null;
            }

            // Make a request to the Azure Management API
            const response = await fetch('https://management.azure.com/subscriptions?api-version=2020-01-01', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`[Subscriptions] Failed to retrieve subscriptions: ${response.status} ${response.statusText}`);
                this.logger.error(`[Subscriptions] Error details: ${errorText}`);
                return null;
            }

            const data = await response.json();
            if (data && Array.isArray(data.value)) {
                this.logger.log(`[Subscriptions] Successfully retrieved ${data.value.length} subscriptions`);
                console.log(data.value);
                return data.value;
            } else {
                this.logger.warn('[Subscriptions] Received unexpected response format from Azure API');
                this.logger.log(`[Subscriptions] Response: ${JSON.stringify(data)}`);
                return null;
            }
        } catch (error) {
            this.logger.error('[Subscriptions] Error retrieving subscriptions:', error);
            return null;
        }
    }
}