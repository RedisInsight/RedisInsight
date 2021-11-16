import { cloneDeep } from 'lodash';

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils';

import reducer, {
  initialState,
  removeError,
  removeMessage,
  resetErrors,
  resetMessages,
  addMessageNotification,
  addErrorNotification,
  errorsSelector,
  messagesSelector,
  IAddInstanceErrorPayload
} from '../../app/notifications';
import { IError, IMessage } from 'uiSrc/slices/interfaces';

jest.mock('uiSrc/services');

let store: typeof mockedStore;
beforeEach(() => {
  cleanup();
  store = cloneDeep(mockedStore);
  store.clearActions();
});

describe('slices', () => {
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

  describe('addErrorNotification', () => {
    it('should properly set the state', () => {
      // Arrange
      const errorMessage = 'some error';
      const responsePayload = {
        instanceId: undefined,
        name: 'Error',
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      };

      // Act
      const nextState = reducer(initialState, addErrorNotification(responsePayload as IAddInstanceErrorPayload));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      });

      const state = {
        ...initialState,
        errors: [{
          ...responsePayload,
          id: errorsSelector(rootState)[0].id,
          message: responsePayload.response.data.message,
        }]
      };

      expect(errorsSelector(rootState)).toEqual(state.errors);
    })
  });

  describe('removeError', () => {
    it('should properly remove the error', () => {
      // Arrange
      const stateWithErrors: IError[] = [
        // @ts-ignore
        { id: '1', message: ''},
        // @ts-ignore
        { id: '2', message: '' }
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          errors: stateWithErrors
        },
        removeError('1'));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      });

      const state = {
        ...initialState,
        errors: [{ id: '2', message: '' }]
      };

      expect(errorsSelector(rootState)).toEqual(state.errors);
    });
  });

  describe('resetErrors', () => {
    it('should properly reset errors', () => {
      // Arrange
      const stateWithErrors: IError[] = [
        // @ts-ignore
        { id: '1', message: ''},
        // @ts-ignore
        { id: '2', message: '' }
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          errors: stateWithErrors
        },
        resetErrors());

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      });

      const state = {
        ...initialState,
        errors: []
      };

      expect(errorsSelector(rootState)).toEqual(state.errors);
    });
  });

  describe('addMessageNotification', () => {
    it('should properly set the state', () => {
      // Arrange
      const message = 'some message';
      const responsePayload = {
        response: {
          status: 200,
          data: { message: message },
        },
      };

      // Act
      const nextState = reducer(initialState, addMessageNotification(responsePayload));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      });

      const state = {
        ...initialState,
        messages: [{
          ...responsePayload,
          id: messagesSelector(rootState)[0].id
        }]
      };

      expect(messagesSelector(rootState)).toEqual(state.messages);
    })
  });

  describe('removeMessage', () => {
    it('should properly remove the message', () => {
      // Arrange
      const stateWithMessages: IMessage[] = [
        { id: '1', message: '', title: ''},
        { id: '2', message: '', title: ''},
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          messages: stateWithMessages
        },
        removeMessage('1'));

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      });

      const state = {
        ...initialState,
        messages: [{ id: '2', message: '', title: ''}]
      };

      expect(messagesSelector(rootState)).toEqual(state.messages);
    });
  });

  describe('resetMessages', () => {
    it('should properly reset errors', () => {
      // Arrange
      const stateWithMessages: IMessage[] = [
        { id: '1', message: '', title: ''},
        { id: '2', message: '', title: ''},
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          messages: stateWithMessages
        },
        resetMessages());

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      });

      const state = {
        ...initialState,
        messages: []
      };

      expect(messagesSelector(rootState)).toEqual(state.messages);
    });
  });
})
