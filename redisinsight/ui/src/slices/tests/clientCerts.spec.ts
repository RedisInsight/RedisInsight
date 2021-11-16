import { cloneDeep } from 'lodash';
import { apiService } from 'uiSrc/services';
import { initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils';
import reducer, {
  initialState,
  loadClientCerts,
  loadClientCertsSuccess,
  loadClientCertsFailure,
  clientCertsSelector,
  fetchClientCerts,
} from '../clientCerts';

jest.mock('uiSrc/services');

describe('clientCerts slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState;

      // Act
      const result = reducer(undefined, {});

      // Assert
      expect(result).toEqual(nextState);
    });
  });

  describe('loadClientCerts', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      };

      // Act
      const nextState = reducer(initialState, loadClientCerts());

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      });
      expect(clientCertsSelector(rootState)).toEqual(state);
    });
  });

  describe('loadClientCertsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'client cert' },
      ];
      const state = {
        ...initialState,
        loading: false,
        data,
      };

      // Act
      const nextState = reducer(initialState, loadClientCertsSuccess(data));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      });
      expect(clientCertsSelector(rootState)).toEqual(state);
    });

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = [];

      const state = {
        ...initialState,
        loading: false,
        data,
      };

      // Act
      const nextState = reducer(initialState, loadClientCertsSuccess(data));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      });
      expect(clientCertsSelector(rootState)).toEqual(state);
    });
  });

  describe('loadClientCertsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error';
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: [],
      };

      // Act
      const nextState = reducer(initialState, loadClientCertsFailure(data));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      });
      expect(clientCertsSelector(rootState)).toEqual(state);
    });
  });

  describe('thunks', () => {
    it('call both fetchClientCerts and loadClientCertsSuccess when fetch is successed', async () => {
      // Arrange
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ];
      const responsePayload = { data, status: 200 };

      apiService.get = jest.fn().mockResolvedValue(responsePayload);
      const store = cloneDeep(mockedStore);

      // Act
      await store.dispatch<any>(fetchClientCerts());

      // Assert
      const expectedActions = [
        loadClientCerts(),
        loadClientCertsSuccess(responsePayload.data),
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
