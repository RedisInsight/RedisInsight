import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { DEFAULT_TOKEN_MANAGER_CONFIG, EntraIdCredentialsProviderFactory, PKCEParams } from '@redis/entraid/dist/lib/entra-id-credentials-provider-factory';
import config from 'src/utils/config';
import { EntraidCredentialsProvider } from '@redis/entraid/dist/lib/entraid-credentials-provider';
import { CloudAuthStatus } from 'src/modules/cloud/auth/models/cloud-auth-response';

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
export class MicrosoftAuthService {
    private readonly logger = new Logger('MicrosoftAuthService');

    private authRequests: Map<string, any> = new Map();
    private inProgressRequests: Map<string, any> = new Map();
    private activeCredentialsProvider: EntraidCredentialsProvider | null = null;
    private entraIdProvider: EntraIdAuthProvider;

    constructor() {
        this.entraIdProvider = EntraIdCredentialsProviderFactory.createForAuthorizationCodeWithPKCE({
            clientId: idpConfig.clientId,
            redirectUri: idpConfig.redirectUri,
            tokenManagerConfig: DEFAULT_TOKEN_MANAGER_CONFIG,
            authorityConfig: { type: 'custom', authorityUrl: idpConfig.authority },
            scopes: [
                'offline_access',
                'openid',
                'email',
                'profile',
                'https://management.azure.com/user_impersonation'
            ],
        });
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
                onNext: (token) => {
                    console.log('Token acquired:', token);
                },
                onError: (error) => {
                    console.error('Token acquisition failed:', error);
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
                authRequest.callback(result)?.catch?.((e: Error) =>
                    this.logger.error('Async callback failed', e)
                );
            }
        } catch (e) {
            this.logger.error('Callback failed', e);
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

    async getSession(): Promise<any> {
        try {
            if (!this.activeCredentialsProvider) {
                this.logger.warn('No active credentials provider available');
                return null;
            }

            // Get the latest credentials from the provider
            const credentials = await this.activeCredentialsProvider.tokenManager.getCurrentToken();

            if (!credentials) {
                this.logger.warn('No credentials available from provider');
                return null;
            }
            return credentials?.value;
        } catch (e) {
            this.logger.error('Failed to get Microsoft session', e);
            return null;
        }
    }

    async getAccessToken(): Promise<string | null> {
        try {
            const session = await this.getSession();
            return session?.accessToken || null;
        } catch (e) {
            this.logger.error('Failed to get access token', e);
            return null;
        }
    }
}