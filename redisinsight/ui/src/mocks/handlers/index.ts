import { MockedRequest, RestHandler } from 'msw'
import instances from './instances'
import content from './content'
import app from './app'
import analytics from './analytics'
import browser from './browser'

// @ts-ignore
export const handlers: RestHandler<MockedRequest>[] = [].concat(
  instances,
  content,
  app,
  analytics,
  browser,
)
