import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import Navigation from './Navigation'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: 'value',
      jobs: [
        { name: 'job1', value: 'value' },
        { name: 'job2', value: 'value' }
      ]
    }
  })
}))

describe('Navigation', () => {
  it('should render', () => {
    expect(render(<Navigation />)).toBeTruthy()
  })

  it('should call proper history push after click on tabs', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<Navigation />)

    fireEvent.click(screen.getByTestId('rdi-nav-btn-config'))
    expect(pushMock).toBeCalledWith('/integrate/rdiInstanceId/pipeline-management/config')
  })
})
