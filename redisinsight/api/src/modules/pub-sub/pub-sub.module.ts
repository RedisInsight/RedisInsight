import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { PubSubGateway } from 'src/modules/pub-sub/pub-sub.gateway';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { UserSessionProvider } from 'src/modules/pub-sub/providers/user-session.provider';
import { SubscriptionProvider } from 'src/modules/pub-sub/providers/subscription.provider';
import { RedisClientProvider } from 'src/modules/pub-sub/providers/redis-client.provider';

@Module({
  imports: [SharedModule],
  providers: [
    PubSubGateway,
    PubSubService,
    UserSessionProvider,
    SubscriptionProvider,
    RedisClientProvider,
  ],
})
export class PubSubModule {}
