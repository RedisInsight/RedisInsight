import { SessionMetadata } from "src/common/models";

export enum AuthProviderType {
    Microsoft = 'microsoft',
    Cloud = 'cloud'
}

export interface AuthRequest {
    provider: AuthProviderType;
    sessionMetadata: SessionMetadata;
    createdAt: Date;
}
