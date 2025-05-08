import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { describe, expect, deps, getMainCheckFn } from '../../deps';
import { nock, Joi } from '../../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_pipeline_config_template_pipelineType';
const testPipelineType = 'someType';
const testDBType = 'someDBType';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';
const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const endpoint = (id: string, type: string = '', dbType: string = '') =>
  request(server).get(
    `/${constants.API.RDI}/${id || testRdiId}/pipeline/config/template/${type || testPipelineType}/${dbType || testDBType}`,
  );

const mockResponseSuccess = {
  template: 'Some template',
};

const responseSchema = Joi.object()
  .keys({
    template: Joi.string().required(),
  })
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id/pipeline/config/template/:pipelineType/:dbType', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db and client getConfigTemplate succeeds',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body).to.eql(mockResponseSuccess);
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetConfigTemplate}/${testPipelineType}/${testDBType}`)
          .query(true)
          .reply(200, mockResponseSuccess);
      },
    },
    {
      name: 'Should throw notFoundError if rdi with id in params does not exist',
      endpoint: () => endpoint(notExistedRdiId),
      statusCode: 404,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'Not Found',
          message: 'Invalid rdi instance id.',
          statusCode: 404,
        });
      },
      before: async () => {
        expect(await localDb.getRdiById(notExistedRdiId)).to.eql(null);
      },
    },
    {
      name: 'Should throw error if client getConfigTemplate will not succeed',
      statusCode: 401,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'RdiUnauthorized',
          errorCode: 11402,
          message: 'Unauthorized',
          statusCode: 401,
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetConfigTemplate}/${testPipelineType}/${testDBType}`)
          .query(true)
          .reply(401, {
            message: 'Request failed with status code 401',
            detail: 'Unauthorized',
          });
      },
    },
  ].forEach(mainCheckFn);
});
