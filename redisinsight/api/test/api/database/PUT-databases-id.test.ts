import {
  expect,
  describe,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  requirements,
  getMainCheckFn,
  _,
} from '../deps';
import { Joi } from '../../helpers/test';
import { databaseSchema } from './constants';

const { request, server, localDb, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) => request(server).put(`/${constants.API.DATABASES}/${id}`);

// input data schema
const dataSchema = Joi.object({
  name: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().allow(true).required(),
}).messages({
  'any.required': '{#label} should not be empty',
}).strict();

const validInputData = {
  name: constants.getRandomString(),
  host: constants.getRandomString(),
  port: 111,
};

const responseSchema = databaseSchema.required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

let oldDatabase;
let newDatabase;
describe(`PUT /databases/:id`, () => {
  beforeEach(async () => await localDb.createDatabaseInstances());

  xdescribe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should return 503 error if incorrect connection data provided',
        data: {
          name: 'new name',
          port: 1111,
        },
        statusCode: 503,
        responseBody: {
          statusCode: 503,
          message: `Could not connect to ${constants.TEST_REDIS_HOST}:1111, please check the connection details.`,
          error: 'Service Unavailable'
        },
        after: async () => {
          // check that instance wasn't changed
          const newDb = await localDb.getInstanceById(constants.TEST_INSTANCE_ID);
          expect(newDb.name).to.not.eql('new name');
          expect(newDb.port).to.eql(constants.TEST_REDIS_PORT);
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          name: 'new name',
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found'
        },
      },
    ].map(mainCheckFn);
  });
  describe('Standalone simple', () => {
    requirements('rte.type=STANDALONE', '!rte.pass', '!rte.tls');
    [
      {
        name: 'Should change host and port and recalculate data such as (provider, modules, etc...)',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
        },
        responseSchema,
        before: async () => {
          oldDatabase = await localDb.getInstanceById(constants.TEST_INSTANCE_ID_2);
          expect(oldDatabase.name).to.eq(constants.TEST_INSTANCE_NAME_2);
          expect(oldDatabase.modules).to.eq('[]');
          expect(oldDatabase.host).to.not.eq(constants.TEST_REDIS_HOST)
          expect(oldDatabase.port).to.not.eq(constants.TEST_REDIS_PORT)
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(constants.TEST_INSTANCE_ID_2);
          expect(_.omit(newDatabase, ['modules', 'provider'])).to.deep.eq({
            ..._.omit(oldDatabase, ['modules', 'provider']),
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          });
        },
      },
      {
        name: 'Should change name (only) for existing database',
        data: {
          name: 'new name',
        },
        responseSchema,
        before: async () => {
          oldDatabase = await localDb.getInstanceById(constants.TEST_INSTANCE_ID);
          expect(oldDatabase.name).to.not.eq('new name');
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(constants.TEST_INSTANCE_ID);
          expect(_.omit(newDatabase, ['modules', 'provider'])).to.deep.eq({
            ..._.omit(oldDatabase, ['modules', 'provider']),
            name: 'new name',
          });
        },
      },
    ].map(mainCheckFn);
  });
});
