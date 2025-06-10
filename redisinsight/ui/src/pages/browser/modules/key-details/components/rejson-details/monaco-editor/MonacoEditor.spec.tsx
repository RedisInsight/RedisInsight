import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import * as reactRedux from 'react-redux'

import MonacoEditor from './MonacoEditor'

const dispatchMock = jest.fn()
jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(dispatchMock)

jest.mock('uiSrc/slices/browser/rejson', () => {
  const originalModule = jest.requireActual('uiSrc/slices/browser/rejson')
  return {
    ...originalModule,
    setEditorType: jest.fn(() => ({ type: 'mock/setEditorType' })),
    setReJSONDataAction: jest.fn(() => ({ type: 'mock/setReJSONDataAction' })),
  }
})

const mockStore = configureStore({
  reducer: () => ({
    browser: {
      rejson: {},
    },
  }),
})

const renderWithRedux = (ui: React.ReactNode) =>
  render(<Provider store={mockStore}>{ui}</Provider>)

const commonProps = {
  length: 1,
  selectedKey: 'key' as any,
  dataType: 'ReJSON-RL',
  isDownloaded: true,
  onJsonKeyExpandAndCollapse: () => {},
  expandedRows: new Set(['someKey']),
}

jest.mock('uiSrc/components/monaco-editor/useMonacoValidation', () => ({
  __esModule: true,
  default: () => ({
    isValid: true,
    isValidating: false,
  }),
}))

it('should preserve large numbers in Monaco editor', async () => {
  const bigNumber = '245343644508855571'
  const data = { huge: BigInt(bigNumber) }

  renderWithRedux(<MonacoEditor data={data as any} {...commonProps} />)

  const editor = await screen.findByTestId('json-data-editor')

  expect(editor.textContent).toContain(`${bigNumber}`)
})

it('should dispatch setReJSONDataAction and reset editor when submitted', async () => {
  const data = { test: 'testing' }

  renderWithRedux(<MonacoEditor data={data as any} {...commonProps} />)

  const updateButton = await screen.findByTestId('json-data-update-btn')
  const editorTextarea = await screen.findByRole('textbox')

  // Next steps are needed to simulate a change in the input in order to make the
  // update button enabled
  await userEvent.clear(editorTextarea)
  // this is escaped value as Monaco editor is not native HTML input
  await userEvent.type(editorTextarea, '{{}"changed": true}')
  await userEvent.click(updateButton)

  expect(dispatchMock).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'mock/setReJSONDataAction' }),
  )
  expect(dispatchMock).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'mock/setEditorType' }),
  )
})
