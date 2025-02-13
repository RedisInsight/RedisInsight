import { Expose, Type } from 'class-transformer';

export class MicrosoftAuthSession {
    @Expose()
    username: string;

    @Expose()
    password: string;

    @Expose()
    currentTokenData: string;
}

export class MicrosoftAuthSessionData {
    @Expose()
    id: string;

    @Expose()
    @Type(() => MicrosoftAuthSession)
    data: MicrosoftAuthSession;
} 