import { MockedRequest, RestHandler } from 'msw'
import instances from './instances'
import content from './content'
import app from './app'
import analytics from './analytics'
import browser from './browser'
import recommendations from './recommendations'
import triggeredFunctions from './triggeredFunctions'
import cloud from './oauth'
import tutorials from './tutorials'

// @ts-ignore
export const handlers: RestHandler<MockedRequest>[] = [].concat(
  instances,
  content,
  app,
  analytics,
  browser,
  recommendations,
  triggeredFunctions,
  cloud,
  tutorials,
)
