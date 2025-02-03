import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import ChatHeader, { Props } from './ChatHeader'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ChatHeader', () => {
  it('should render', () => {
    expect(render(<ChatHeader {...mockedProps} databaseId="1" />)).toBeTruthy()
  })

  it('should display action buttons', () => {
    render(<ChatHeader {...mockedProps} databaseId="1" />)
    expect(screen.getByTestId('show-agreements-btn')).toBeInTheDocument()
    expect(screen.getByTestId('ai-restart-session-btn')).toBeInTheDocument()
  })
})
