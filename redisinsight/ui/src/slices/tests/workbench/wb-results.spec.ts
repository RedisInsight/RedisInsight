import { cloneDeep, first } from 'lodash';
import { AxiosError } from 'axios';

import {
  cleanup,
  mockedStore,
  initialStateDefault,
  clearStoreActions,
  mockStore,
} from 'uiSrc/utils/test-utils';
import { apiService } from 'uiSrc/services';
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { ClusterNodeRole, CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli';
import { SendClusterCommandDto, SendClusterCommandResponse } from 'apiSrc/modules/cli/dto/cli.dto';
import reducer, {
  initialState,
  sendWBCommand,
  sendWBCommandSuccess,
  sendWBCommandFailure,
  updateWBCommandHistory,
  workbenchResultsSelector,
  sendWBCommandAction,
  sendWBCommandClusterAction,
} from '../../workbench/wb-results';

jest.mock('uiSrc/services');

let store: typeof mockedStore;
beforeEach(() => {
  cleanup();
  store = cloneDeep(mockedStore);
  store.clearActions();
});

describe('workbench results slice', () => {
  describe('updateWBCommandHistory', () => {
    it('should properly updated cli history output', () => {
      const data = ['lalal', 'tatata'];
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        commandHistory: data,
      };

      // Act
      const nextState = reducer(initialState, updateWBCommandHistory(data));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          results: nextState,
        },
      });
      expect(workbenchResultsSelector(rootState)).toEqual(state);
    });
  });

  describe('sendWBCommand', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      };

      // Act
      const nextState = reducer(initialState, sendWBCommand());

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          results: nextState,
        },
      });
      expect(workbenchResultsSelector(rootState)).toEqual(state);
    });
  });

  describe('sendWBCommandSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
      };

      // Act
      const nextState = reducer(initialState, sendWBCommandSuccess());

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          results: nextState,
        },
      });
      expect(workbenchResultsSelector(rootState)).toEqual(state);
    });
  });

  describe('sendWBCommandFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error';
      const state = {
        ...initialState,
        loading: false,
        error: data,
      };

      // Act
      const nextState = reducer(initialState, sendWBCommandFailure(data));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          results: nextState,
        },
      });
      expect(workbenchResultsSelector(rootState)).toEqual(state);
    });
  });

  describe('thunks', () => {
    describe('Standalone Cli command', () => {
      it('call both sendCliStandaloneCommandAction and sendWBCommandSuccess when response status is successed', async () => {
        // Arrange
        const command = 'keys *';
        const data = {
          response: 'tatata',
          status: CommandExecutionStatus.Success,
        };
        const responsePayload = { data, status: 200 };

        apiService.post = jest.fn().mockResolvedValue(responsePayload);

        // Act
        await store.dispatch<any>(sendWBCommandAction(command, Date.now()));

        // Assert
        const expectedActions = [sendWBCommand(), sendWBCommandSuccess()];
        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions));
      });

      it('call both sendCliStandaloneCommandAction and sendWBCommandSuccess when response status is fail', async () => {
        // Arrange
        const command = 'keys *';
        const data = {
          response: '(err) tatata',
          status: CommandExecutionStatus.Fail,
        };
        const responsePayload = { data, status: 200 };

        apiService.post = jest.fn().mockResolvedValue(responsePayload);

        // Act
        await store.dispatch<any>(sendWBCommandAction(command, Date.now()));

        // Assert
        const expectedActions = [sendWBCommand(), sendWBCommandSuccess()];

        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions));
      });

      it('call both sendCliStandaloneCommandAction and sendWBCommandFailure when fetch is fail', async () => {
        // Arrange
        const command = 'keys *';
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.';
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        };

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload);

        // Act
        await store.dispatch<any>(sendWBCommandAction(command, Date.now()));

        // Assert
        const expectedActions = [
          sendWBCommand(),
          addErrorNotification(responsePayload as AxiosError),
          sendWBCommandFailure(responsePayload.response.data.message),
        ];
        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions));
      });
    });

    describe('Single Node Cluster Cli command', () => {
      const options: SendClusterCommandDto = {
        command: 'keys *',
        nodeOptions: {
          host: 'localhost',
          port: 7000,
          enableRedirection: true,
        },
        role: ClusterNodeRole.All,
      };

      it('call both sendWBCommandClusterAction and sendWBCommandSuccess when response status is successed', async () => {
        // Arrange
        const command = 'keys *';
        const data: SendClusterCommandResponse[] = [
          {
            response: '-> Redirected to slot [6918] located at 127.0.0.1:7002\n(nil)',
            status: 'success',
            node: { host: '127.0.0.1', port: 7002 },
          },
        ];
        const responsePayload = { data, status: 200 };

        apiService.post = jest.fn().mockResolvedValue(responsePayload);

        // Act
        await store.dispatch<any>(sendWBCommandClusterAction(command, Date.now(), options));

        // Assert
        const expectedActions = [sendWBCommand(), sendWBCommandSuccess()];
        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions));
      });

      it('call both sendWBCommandClusterAction and sendWBCommandSuccess when response status is fail', async () => {
        // Arrange
        const command = 'keys *';
        const data: SendClusterCommandResponse[] = [
          {
            response: '-> Redirected to slot [6918] located at 127.0.0.1:7002\n(nil)',
            status: 'success',
            node: { host: '127.0.0.1', port: 7002 },
          },
        ];
        const responsePayload = { data, status: 200 };

        apiService.post = jest.fn().mockResolvedValue(responsePayload);

        // Act
        await store.dispatch<any>(sendWBCommandClusterAction(command, Date.now(), options));

        // Assert
        const expectedActions = [sendWBCommand(), sendWBCommandSuccess()];
        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions));
      });

      it('call both sendWBCommandClusterAction and sendWBCommandFailure when fetch is fail', async () => {
        // Arrange
        const command = 'keys *';
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.';
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        };

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload);

        // Act
        await store.dispatch<any>(sendWBCommandClusterAction(command, Date.now(), options));

        // Assert
        const expectedActions = [
          sendWBCommand(),
          addErrorNotification(responsePayload as AxiosError),
          sendWBCommandFailure(responsePayload.response.data.message),
        ];
        expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions));
      });
    });
  });
});
