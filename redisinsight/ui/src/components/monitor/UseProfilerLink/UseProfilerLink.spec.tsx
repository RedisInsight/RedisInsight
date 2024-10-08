import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import UseProfilerLink from './UseProfilerLink'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    disabledByEnv: {
      flag: true,
    }
  }),
}))

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const props = {
  onClick: () => {},
}

describe('UseProfilerLink', () => {
  beforeAll(() => {
  })

  it('should render', () => {
    expect(render(<UseProfilerLink {...props} />)).toBeTruthy()
  })

  // todo: revise flag naming
  it('should show the link when isDisabledByEnv = true', () => {
    render(<UseProfilerLink {...props} />)

    expect(screen.getByText('tool to see all the requests processed by the server.', { exact: false })).toBeInTheDocument()
  })

  it('should not show the link when isDisabledByEnv = false', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      disabledByEnv: {
        flag: false,
      }
    })
    render(<UseProfilerLink {...props} />)

    expect(screen.getByText('Monitor not supported in this environment.')).toBeInTheDocument()
  })
})
