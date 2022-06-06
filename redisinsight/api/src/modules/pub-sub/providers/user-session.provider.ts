import { Injectable } from '@nestjs/common';
import { UserSession } from 'src/modules/pub-sub/model/user-session';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { RedisClientProvider } from 'src/modules/pub-sub/providers/redis-client.provider';

@Injectable()
export class UserSessionProvider {
  private sessions: Map<string, UserSession> = new Map();

  constructor(private readonly redisClientProvider: RedisClientProvider) {}

  getOrCreateUserSession(userClient: UserClient) {
    let session = this.getUserSession(userClient);

    if (!session) {
      session = new UserSession(
        userClient,
        this.redisClientProvider.createClient(userClient.getDatabaseId()),
      );
      this.sessions.set(session.getId(), session);
    }

    return session;
  }

  getUserSession(userClient: UserClient): UserSession {
    return this.sessions.get(userClient.getId());
  }

  removeUserSession(userClient: UserClient) {
    this.sessions.delete(userClient.getId());
  }
}
