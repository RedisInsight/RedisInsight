import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { DEFAULT_TOKEN_MANAGER_CONFIG, EntraIdCredentialsProviderFactory } from '@redis/entraid/dist/lib/entra-id-credentials-provider-factory';
import config from 'src/utils/config';
import { MicrosoftAuthSessionRepository } from './repositories/microsoft-auth.session.repository';
import { MicrosoftAuthSession } from './models/microsoft-auth-session.model';

const { idp: { microsoft: idpConfig } } = config.get('cloud');

@Injectable()
export class MicrosoftAuthService {
    private readonly logger = new Logger('MicrosoftAuthService');

    private authRequests: Map<string, any> = new Map();
    private inProgressRequests: Map<string, any> = new Map();

    private getPKCECodes: any;
    private createCredentialsProvider: any;
    private getAuthCodeUrl: any;

    constructor(
        private readonly microsoftAuthSessionRepository: MicrosoftAuthSessionRepository,
    ) {

        const {
            getPKCECodes,
            createCredentialsProvider,
            getAuthCodeUrl
        } = EntraIdCredentialsProviderFactory.createForAuthorizationCodeWithPKCE({
            clientId: idpConfig.clientId,
            redirectUri: idpConfig.redirectUri,
            tokenManagerConfig: DEFAULT_TOKEN_MANAGER_CONFIG,
            authorityConfig: { type: 'custom', authorityUrl: idpConfig.authority },
            scopes: ['offline_access', 'openid', 'email', 'profile'],
        });

        this.getPKCECodes = getPKCECodes;
        this.createCredentialsProvider = createCredentialsProvider;
        this.getAuthCodeUrl = getAuthCodeUrl;
    }

    async getAuthorizationUrl(
        sessionMetadata: SessionMetadata,
        options?: any
    ): Promise<string> {
        const pkceCodes = await this.getPKCECodes();
        const authUrl = await this.getAuthCodeUrl({
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

    async handleCallback(query: any): Promise<any> {
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

            const entraidCredentialsProvider = this.createCredentialsProvider(
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

            console.log('Credentials acquired:', credentials)


            await this.microsoftAuthSessionRepository.save({
                id: authRequest.sessionMetadata.sessionId,
                data: {
                    username: credentials.username,
                    password: credentials.password,
                    currentTokenData: entraidCredentialsProvider.getTokenManager().getCurrentToken(),
                }
            });

            delete authRequest.pkceCodes;

            this.finishInProgressRequest(query);

            return credentials;
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
            const sessionData = await this.microsoftAuthSessionRepository.get(id);
            return sessionData?.data || null;
        } catch (e) {
            this.logger.error('Failed to get Microsoft session', e);
            return null;
        }
    }
}