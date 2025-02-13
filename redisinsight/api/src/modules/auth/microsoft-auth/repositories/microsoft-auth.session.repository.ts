import { Injectable } from "@nestjs/common";
import { MicrosoftAuthSession, MicrosoftAuthSessionData } from '../models/microsoft-auth-session.model';

@Injectable()
export abstract class MicrosoftAuthSessionRepository {
    abstract get(id: string): Promise<MicrosoftAuthSessionData>;
    abstract save(data: Partial<MicrosoftAuthSessionData>): Promise<void>;
} 