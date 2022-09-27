import { DefaultBodyType, MockedRequest, rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [
  rest.post(getMswURL(ApiEndpoints.CA_CERTIFICATES), (req, res, ctx) => {
    const { username } = req.body

    return res(
      ctx.json({
        id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda',
        username,
        firstName: 'John',
        lastName: 'Maverick',
      }),
    )
  }),
]

export default handlers
