import { MockedRequest, RestHandler } from 'msw'
import instances from './instances'
import content from './content'

export const handlers: RestHandler<MockedRequest>[] = [].concat(instances, content)
