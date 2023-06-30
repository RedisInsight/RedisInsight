import { ReactComponent as HandIcon } from 'uiSrc/assets/img/oauth/hand.svg'
import { ReactComponent as RedisearchIcon } from 'uiSrc/assets/img/oauth/redisearch.svg'
import { ReactComponent as RejsonIcon } from 'uiSrc/assets/img/oauth/rejson.svg'
import { ReactComponent as RocketIcon } from 'uiSrc/assets/img/oauth/rocket.svg'

export const OAuthAdvantages = [
  {
    title: 'Native support for JSON standard',
    text: 'With atomic operations and fast access to sub-elements',
    icon: RejsonIcon,
  },
  {
    title: 'Full-text search',
    text: 'And complex structured queries that deliver read-your-writes consistency through synchronous indexing',
    icon: RedisearchIcon,
  },
  {
    title: 'Scalable and fully managed',
    text: 'With instant failover and backup recovery',
    icon: RocketIcon,
  },
  {
    title: 'Free developer database',
    text: 'To get started with the best Redis experience',
    icon: HandIcon,
  },
]
