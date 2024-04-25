import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID } from 'src/common/constants';

export const WSSessionMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionMetadata => {
    const socket = ctx.switchToWs().getClient();
    // TODO: [USER_CONTEXT] - decode the JWT and return a session metadata for the user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { jwt } = socket.data;
    return {
      userId: DEFAULT_SESSION_ID,
      sessionId: DEFAULT_USER_ID,
    };
  },
);
