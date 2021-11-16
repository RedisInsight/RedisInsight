import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import CloudConnectionForm, { Props } from './CloudConnectionForm'

const mockedProps = mock<Props>()

describe('CloudConnectionForm', () => {
  it('should render', () => {
    expect(
      render(<CloudConnectionForm {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
