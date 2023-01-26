import { rest } from 'msw'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'

export const errorHandlers = [
  rest.all('*', (_req, res, ctx) => res(
    ctx.status(500),
    ctx.json({ message: DEFAULT_ERROR_MESSAGE })
  )),
]
