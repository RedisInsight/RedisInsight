import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import NoKeysFound, { Props } from './NoKeysFound'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'RE_CLOUD'
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NoKeysFound', () => {
  it('should render', () => {
    expect(render(<NoKeysFound {...mockedProps} />)).toBeTruthy()
  })

  it('should call props on click buttons', () => {
    const onAddMock = jest.fn()

    render(<NoKeysFound {...mockedProps} onAddKeyPanel={onAddMock} />)

    fireEvent.click(screen.getByTestId('add-key-msg-btn'))

    expect(onAddMock).toBeCalled()
  })
})
