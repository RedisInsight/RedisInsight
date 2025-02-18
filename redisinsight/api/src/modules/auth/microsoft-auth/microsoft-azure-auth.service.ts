import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { DEFAULT_TOKEN_MANAGER_CONFIG, EntraIdCredentialsProviderFactory, PKCEParams } from '@redis/entraid/dist/lib/entra-id-credentials-provider-factory';
import config from 'src/utils/config';
import { MicrosoftAuthSession } from './models/microsoft-auth-session.model';
import { EntraidCredentialsProvider } from '@redis/entraid/dist/lib/entraid-credentials-provider';

const { idp: { microsoft: idpConfig } } = config.get('cloud');

interface MicrosoftAuthOptions {
    state: string;
    client_info?: string;
}

interface MicrosoftAuthQuery {
    state: string;
    code: string;
}

interface MicrosoftCredentials {
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

    private entraIdProvider: EntraIdAuthProvider;

    constructor() {
        this.entraIdProvider = EntraIdCredentialsProviderFactory.createForAuthorizationCodeWithPKCE({
            clientId: idpConfig.clientId,
            redirectUri: idpConfig.redirectUri,
            tokenManagerConfig: DEFAULT_TOKEN_MANAGER_CONFIG,
            authorityConfig: { type: 'custom', authorityUrl: idpConfig.authority },
            scopes: ['offline_access', 'openid', 'email', 'profile'],
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
        };

        this.authRequests.clear();
        this.authRequests.set(options?.state, authRequest);

        return authUrl;
    }

    async handleCallback(query: MicrosoftAuthQuery): Promise<MicrosoftCredentials> {
        try {
            if (!this.authRequests.has(query?.state)) {
                this.logger.log(
                    `${query?.state ? 'Auth Request matching query state not found' : 'Query state field is empty'}`,
                );
                throw new Error('Unknown authorization request');
            }

            const authRequest = this.authRequests.get(query.state);

            this.authRequests.delete(query.state);
            this.inProgressRequests.set(query.state, authRequest);

            const entraidCredentialsProvider = this.entraIdProvider.createCredentialsProvider(
                {
                    code: query.code as string,
                    verifier: authRequest.pkceCodes.verifier,
                    clientInfo: authRequest.options.client_info as string | undefined
                },
            );

            const initialCredentials = entraidCredentialsProvider.subscribe({
                onNext: (token) => {
                    console.log('Token acquired:', token);
                },
                onError: (error) => {
                    console.error('Token acquisition failed:', error);
                }
            });

            const [credentials] = await initialCredentials;

            if (!credentials?.username || !credentials?.password) {
                throw new Error('Invalid credentials received');
            }

            delete authRequest.pkceCodes;

            this.finishInProgressRequest(query);

            return {
                username: credentials.username,
                password: credentials.password,
            };
        } catch (e) {
            this.logger.error('Microsoft auth callback failed', e);
            throw e;
        }
    }

    isRequestInProgress(query): boolean {
        return this.inProgressRequests.has(query?.state);
    }

    finishInProgressRequest(query): void {
        this.inProgressRequests.delete(query?.state);
    }

    async getSession(id: string): Promise<MicrosoftAuthSession> {
        try {
            // TODO: Implement this
            return null;
        } catch (e) {
            this.logger.error('Failed to get Microsoft session', e);
            return null;
        }
    }
}