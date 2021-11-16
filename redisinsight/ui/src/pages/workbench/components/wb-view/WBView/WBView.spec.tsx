import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
// import MonacoEditor from 'react-monaco-editor'
import { WORKBENCH_HISTORY_WRAPPER_NAME } from 'uiSrc/pages/workbench/constants'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import HistoryContainer from 'uiSrc/services/queryHistory'
import { updateWBHistoryStorage } from 'uiSrc/utils'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import WBView, { Props } from './WBView'

const mockedProps = mock<Props>()

let store: typeof mockedStore
const history = new HistoryContainer<WBHistoryObject>(WORKBENCH_HISTORY_WRAPPER_NAME)

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

// jest.mock('react-monaco-editor', () => jest.fn().mockImplementation(() =>
//   <div data-testid="monaco">Monaco</div>))

jest.mock('uiSrc/utils/workbench', () => ({
  ...jest.requireActual('uiSrc/utils/workbench'),
  updateWBHistoryStorage: jest.fn(),
}))

jest.mock('uiSrc/slices/workbench/wb-enablement-area', () => {
  const defaultState = jest.requireActual('uiSrc/slices/workbench/wb-enablement-area').initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-enablement-area'),
    workbenchEnablementAreaSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('WBView', () => {
  it('should render', () => {
    expect(render(<WBView {...instance(mockedProps)} history={history} />)).toBeTruthy()
  })

  describe('Workbench input keyboard cases', () => {
    it.skip('"Enter" keydown should call "onSubmit"', () => {
      const command = 'info'
      const onSubmitMock = jest.fn()

      const { queryByTestId } = render(
        <WBView
          {...instance(mockedProps)}
          history={history}
          script={command}
          onSubmit={onSubmitMock}
        />
      )

      const monacoEl = queryByTestId('monaco')

      fireEvent.keyDown(monacoEl, {
        code: 'Enter',
        ctrlKey: true,
      })

      expect(updateWBHistoryStorage).toBeCalledWith(command, expect.any(Function))
      expect(onSubmitMock).toBeCalled()
    })
  })
})
