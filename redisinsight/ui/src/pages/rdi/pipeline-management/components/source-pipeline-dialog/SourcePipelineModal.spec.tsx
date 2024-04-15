import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, fireEvent, screen } from 'uiSrc/utils/test-utils'
import { getPipeline, setPipeline } from 'uiSrc/slices/rdi/pipeline'
import { setPipelineDialogState } from 'uiSrc/slices/app/context'

import SourcePipelineDialog, { EMPTY_PIPELINE } from './SourcePipelineModal'

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: '',
      jobs: [],
    }
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SourcePipelineDialog', () => {
  it('should render', () => {
    expect(render(<SourcePipelineDialog />)).toBeTruthy()
  })

  it('should call proper actions after select fetch from server option', () => {
    render(<SourcePipelineDialog />)

    fireEvent.click(screen.getByTestId('server-source-pipeline-dialog'))

    const expectedActions = [
      getPipeline(),
      setPipelineDialogState(false),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions after select empty pipeline  option', () => {
    render(<SourcePipelineDialog />)

    fireEvent.click(screen.getByTestId('empty-source-pipeline-dialog'))

    const expectedActions = [
      setPipeline(EMPTY_PIPELINE),
      setPipelineDialogState(false),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })
})
