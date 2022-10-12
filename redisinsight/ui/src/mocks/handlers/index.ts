import { MockedRequest, RestHandler } from 'msw'
import instances from './instances'
import content from './content'
import app from './app'
import analytics from './analytics'

// @ts-ignore
export const handlers: RestHandler<MockedRequest>[] = [].concat(instances, content, app, analytics)
