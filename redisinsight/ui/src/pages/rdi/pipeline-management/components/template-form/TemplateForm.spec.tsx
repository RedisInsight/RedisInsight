import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'

import { fireEvent, render, cleanup, mockedStore, screen, act } from 'uiSrc/utils/test-utils'
import { getPipelineStrategies } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import TemplateForm, { Props } from './TemplateForm'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

describe('TemplateForm', () => {
  it('should render', () => {
    expect(
      render(<TemplateForm {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should call closePopover', async () => {
    const mockClosePopover = jest.fn()

    render(
      <TemplateForm
        {...instance(mockedProps)}
        closePopover={mockClosePopover}
      />
    )

    fireEvent.click(screen.getByTestId('template-cancel-btn'))

    expect(mockClosePopover).toBeCalled()
  })

  it('should fetch rdi strategies on initial', async () => {
    await act(() => {
      render(<TemplateForm {...instance(mockedProps)} />)
    })

    const expectedActions = [
      getPipelineStrategies(),
    ]
    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
  })

  it('apply btn should be disabled if there is any value', () => {
    render(<TemplateForm {...instance(mockedProps)} value="some value" />)

    expect(screen.getByTestId('template-apply-btn')).toBeDisabled()
  })

  it('apply btn should be disabled if there is any value', () => {
    render(<TemplateForm {...instance(mockedProps)} value="some value" />)

    expect(screen.getByTestId('template-apply-btn')).toBeDisabled()
  })

  it('should display db type select when source is "config"', () => {
    render(<TemplateForm {...instance(mockedProps)} source={RdiPipelineTabs.Config} />)

    expect(screen.getByTestId('strategy-type-select')).toBeInTheDocument()
    expect(screen.getByTestId('db-type-select')).toBeInTheDocument()
  })

  it('should not render db type select when source is "jobs"', () => {
    render(<TemplateForm {...instance(mockedProps)} source={RdiPipelineTabs.Jobs} />)

    expect(screen.getByTestId('strategy-type-select')).toBeInTheDocument()

    const dbTypeSelect = screen.queryByTestId('db-type-select')

    expect(dbTypeSelect).toBeNull()
  })

  it('should not render db type select when source is "jobs"', () => {
    render(<TemplateForm {...instance(mockedProps)} source={RdiPipelineTabs.Jobs} />)

    expect(screen.getByTestId('strategy-type-select')).toBeInTheDocument()

    const dbTypeSelect = screen.queryByTestId('db-type-select')

    expect(dbTypeSelect).toBeNull()
  })
})
