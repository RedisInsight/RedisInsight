import {
  expect,
  describe,
  it,
  deps,
  validateApiCall,
} from '../deps';
const { server, request, constants, rte, localDb } = deps;

// endpoint to test
const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_COMMAND_EXECUTION_ID_1,
) =>
  request(server).delete(`/instance/${instanceId}/workbench/command-executions/${id}`);

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('DELETE /instance/:instanceId/workbench/command-executions/:commandExecutionId', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(
          constants.TEST_NOT_EXISTED_INSTANCE_ID,
          constants.TEST_COMMAND_EXECUTION_ID_1,
        ),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found'
        },
      },
      {
        name: 'Should return 0 array when no history items yet',
        before: async () => {
          await localDb.generateNCommandExecutions({
            databaseId: constants.TEST_INSTANCE_ID,
            id: constants.TEST_COMMAND_EXECUTION_ID_1,
          }, 1);
        },
        after: async () => {
          expect(await (await (localDb.getRepository(localDb.repositories.COMMAND_EXECUTION)))
            .findOne({ id: constants.TEST_COMMAND_EXECUTION_ID_1 })).to.eql(undefined);
        },
      },
    ].map(mainCheckFn);
  });
});
