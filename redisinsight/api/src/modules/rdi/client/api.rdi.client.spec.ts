import axios, { AxiosError } from 'axios';
import {
  mockRdi,
  mockRdiClientMetadata,
  mockRdiConfigSchema,
  mockRdiDryRunJob, mockRdiJobsSchema,
  mockRdiPipeline,
  mockRdiSchema,
  mockRdiStatisticsData,
} from 'src/__mocks__';
import errorMessages from 'src/constants/error-messages';
import { sign } from 'jsonwebtoken';
import { ApiRdiClient } from './api.rdi.client';
import { RdiDyRunJobStatus, RdiPipeline, RdiStatisticsStatus } from '../models';
import { RdiUrl, TOKEN_THRESHOLD } from '../constants';
import { wrapRdiPipelineError } from '../exceptions';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('ApiRdiClient', () => {
  let client: ApiRdiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiRdiClient(mockRdiClientMetadata, mockRdi);
  });

  describe('getSchema', () => {
    it('should return schema', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRdiConfigSchema });
      mockedAxios.get.mockResolvedValueOnce({ data: mockRdiJobsSchema });

      const result = await client.getSchema();

      expect(result).toEqual(mockRdiSchema);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetConfigSchema);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetJobsSchema);
    });

    it('should throw error if request fails', async () => {
      const error = {
        message: errorMessages.UNAUTHORIZED,
        response: {
          status: 401,
        },
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockRdiConfigSchema });
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(client.getSchema()).rejects.toThrow(errorMessages.UNAUTHORIZED);
    });
  });

  describe('getPipeline', () => {
    it('should return pipeline', async () => {
      const data = { config: {} };
      const mockedPipeline = Object.assign(new RdiPipeline(), {
        jobs: {},
        config: {},
      });
      mockedAxios.get.mockResolvedValueOnce({ data });

      const result = await client.getPipeline();

      expect(result).toEqual(mockedPipeline);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetPipeline);
    });

    it('should throw error if request fails', async () => {
      const error = new Error('test error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(client.getPipeline()).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getStrategies', () => {
    it('should return strategies data when API call is successful', async () => {
      const mockData = { strategies: [{ id: 1, name: 'Strategy 1' }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getStrategies();

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetStrategies);
    });

    it('should throw an error when API call fails', async () => {
      const mockError = new Error('API call failed');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(client.getStrategies()).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
      expect(axios.get).toHaveBeenCalledWith(RdiUrl.GetStrategies);
    });
  });

  describe('getConfigTemplate', () => {
    const pipelineType = 'test-pipeline';
    const dbType = 'test-db';

    it('should return the config template when the API call is successful', async () => {
      const expectedResponse = { template: 'some template' };
      mockedAxios.get.mockResolvedValueOnce({ data: expectedResponse });

      const result = await client.getConfigTemplate(pipelineType, dbType);

      expect(result).toEqual(expectedResponse);
      expect(axios.get).toHaveBeenCalledWith(`${RdiUrl.GetConfigTemplate}/${pipelineType}/${dbType}`);
    });

    it('should throw an error when the API call fails', async () => {
      const expectedError = new Error('API call failed');
      mockedAxios.get.mockRejectedValueOnce(expectedError);

      await expect(client.getConfigTemplate(pipelineType, dbType))
        .rejects.toThrowError(errorMessages.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getJobTemplate', () => {
    const pipelineType = 'test-pipeline';

    it('should return the job template when the API call is successful', async () => {
      const expectedResponse = {
        transformations: {
          status: RdiDyRunJobStatus.Success,
        },
        commands: {
          status: RdiDyRunJobStatus.Success,
        },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: expectedResponse });

      const result = await client.getJobTemplate(pipelineType);

      expect(result).toEqual(expectedResponse);
      expect(axios.get).toHaveBeenCalledWith(`${RdiUrl.GetJobTemplate}/${pipelineType}`);
    });

    it('should throw an error when the API call fails', async () => {
      const expectedError = new Error('API call failed');
      mockedAxios.get.mockRejectedValueOnce(expectedError);

      await expect(client.getJobTemplate(pipelineType)).rejects.toThrowError(errorMessages.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deploy', () => {
    it('should deploy the pipeline and poll for status', async () => {
      const actionId = '123';
      const postResponse = { data: { action_id: actionId } };
      const getResponse = {
        data: {
          status: 'completed',
          data: 'some data',
          error: '',
        },
      };
      // const postMock = jest.spyOn(client, 'post').mockResolvedValue(response);
      mockedAxios.post.mockResolvedValueOnce(postResponse);
      mockedAxios.get.mockResolvedValueOnce(getResponse);

      const result = await client.deploy(mockRdiPipeline);

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Deploy, expect.any(Object));
      expect(result).toEqual(getResponse.data.data);
    });

    it('should throw an error if the deployment fails', async () => {
      const errorMessage = 'Deployment failed';
      const errorResponse = { response: { data: { message: errorMessage } } };
      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(client.deploy(mockRdiPipeline)).rejects.toThrow(errorMessage);
    });
  });

  describe('dryRunJob', () => {
    it('should call the RDI client with the correct URL and data', async () => {
      const mockResponse = {
        transformations: {
          status: RdiDyRunJobStatus.Success,
        },
        commands: {
          status: RdiDyRunJobStatus.Success,
        },
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await client.dryRunJob(mockRdiDryRunJob);

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.DryRunJob, mockRdiDryRunJob);
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the client call fails', async () => {
      const mockError = new Error('mock error');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(client.dryRunJob(mockRdiDryRunJob)).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
    });
  });

  describe('testConnections', () => {
    it('should return a successful response', async () => {
      const config = {};
      const expectedResponse = { connected: true };

      mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

      const response = await client.testConnections(config);

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.TestConnections, config);
      expect(response).toEqual(expectedResponse);
    });

    it('should throw an error if the request fails', async () => {
      const config = {};
      const error = new Error('Test error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(client.testConnections(config)).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.TestConnections, config);
    });
  });

  describe('getPipelineStatus', () => {
    it('should return pipeline status when API call is successful', async () => {
      const mockResponse = { data: { status: 'running' } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getPipelineStatus();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetPipelineStatus);
    });

    it('should throw an error when API call fails', async () => {
      const mockError = new Error('API call failed');
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(client.getPipelineStatus()).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetPipelineStatus);
    });
  });

  describe('getStatistics', () => {
    it('should return success status and data when API call succeeds', async () => {
      const response = {
        data: mockRdiStatisticsData,
      };
      mockedAxios.get.mockResolvedValue(response);

      const result = await client.getStatistics('section1,section2');

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetStatistics, { params: { sections: 'section1,section2' } });
      expect(result.status).toBe(RdiStatisticsStatus.Success);
      expect(result.data).toEqual(mockRdiStatisticsData);
    });

    it('should return fail status and error message when API call fails', async () => {
      const errorMessage = 'API call failed';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      const result = await client.getStatistics();

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetStatistics, { params: { } });
      expect(result.status).toBe(RdiStatisticsStatus.Fail);
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('getJobFunctions', () => {
    it('should return job functions', async () => {
      const expectedResponse = { jobFunctions: ['jobFunc1', 'jobFunc2'] };
      mockedAxios.get.mockResolvedValueOnce({ data: expectedResponse });

      const response = await client.getJobFunctions();

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.JobFunctions);
      expect(response).toEqual(expectedResponse);
    });

    it('should throw an error if the API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      await expect(client.getJobFunctions()).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
    });
  });

  describe('connect', () => {
    it('should set auth and authorization headers on successful login', async () => {
      const mockedAccessToken = sign({ exp: Math.trunc(Date.now() / 1000) + 3600 }, 'test');
      const expectedAuthorizationHeader = `Bearer ${mockedAccessToken}`;

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          access_token: mockedAccessToken,
        },
      });

      await client.connect();

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Login,
        { username: mockRdi.username, password: mockRdi.password });

      expect(client['auth']['jwt']).toEqual(mockedAccessToken);
      expect(mockedAxios.defaults.headers.common['Authorization']).toEqual(expectedAuthorizationHeader);
    });

    it('should throw an error if login fails', async () => {
      const error = new AxiosError('Login failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(client.connect()).rejects.toThrow(wrapRdiPipelineError(error));
    });
  });

  describe('ensureAuth', () => {
    let connectSpy: jest.SpyInstance;

    beforeEach(() => {
      connectSpy = jest.spyOn(client, 'connect').mockResolvedValue(undefined);
    });

    it('should not call connect if token is not expired', async () => {
      const exp = Math.trunc((Date.now() / 1000) + TOKEN_THRESHOLD + 3600);
      const mockedAccessToken = sign({ exp }, 'test');
      client['auth'] = { exp, jwt: mockedAccessToken };
      await client.ensureAuth();
      expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should call connect if token is expired', async () => {
      const exp = Math.trunc((Date.now() / 1000) - 3600);
      const mockedAccessToken = sign({ exp }, 'test');
      client['auth'] = { exp, jwt: mockedAccessToken };
      await client.ensureAuth();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('pollActionStatus', () => {
    const responseData = 'some data';
    const error = new Error('Test error');
    const actionId = 'test-action-id';

    it('should return response data on success', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { status: 'completed', data: responseData } });

      const result = await client['pollActionStatus'](actionId);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${RdiUrl.Action}/${actionId}`, { signal: undefined });
      expect(result).toEqual(responseData);
    });

    it('should throw an error if action status is failed', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { status: 'failed', error: { message: 'Test error' } } });

      await expect(client['pollActionStatus'](actionId)).rejects.toThrow('Test error');
    });

    it('should throw an error if an error occurs during polling', async () => {
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(client['pollActionStatus'](actionId)).rejects.toThrow(errorMessages.INTERNAL_SERVER_ERROR);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${RdiUrl.Action}/${actionId}`, { signal: undefined });
    });
  });
});
