import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import DatabaseListHeader, { Props } from './DatabaseListHeader'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('DatabaseListHeader', () => {
  it('should render', () => {
    expect(render(<DatabaseListHeader {...instance(mockedProps)} />)).toBeTruthy()
  })
})
