import { Injectable } from '@nestjs/common';
import { SessionService } from 'src/modules/session/session.service';
import { CloudSession } from 'src/modules/cloud/session/models/cloud-session';
import { classToPlain, plainToClass } from 'class-transformer';
import { TransformGroup } from 'src/common/constants';

@Injectable()
export class CloudSessionService {
  constructor(
    private readonly sessionService: SessionService,
  ) {}

  async getSession(id: string): Promise<CloudSession> {
    const session = await this.sessionService.getSession(id);
    return session?.data?.cloud || null;
  }

  async updateSessionData(id: string, cloud: any): Promise<CloudSession> {
    const session = await this.getSession(id);

    return (await this.sessionService.updateSessionData(id, {
      cloud: plainToClass(CloudSession, {
        ...classToPlain(session, { groups: [TransformGroup.Secure] }),
        ...classToPlain(cloud, { groups: [TransformGroup.Secure] }),
      }, { groups: [TransformGroup.Secure] }),
    }))?.data?.cloud || null;
  }

  async deleteSessionData(id: string): Promise<void> {
    await this.sessionService.updateSessionData(id, { cloud: null });
  }

  async invalidateApiSession(id: string): Promise<void> {
    await this.updateSessionData(id, {
      csrf: null,
      apiSessionId: null,
      user: null,
    });
  }
}
