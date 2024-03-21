import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RdiHeader, { Props } from './RdiHeader'

const mockedProps = mock<Props>()

describe('RdiHeader', () => {
  it('should render', () => {
    expect(render(<RdiHeader {...instance(mockedProps)} />)).toBeTruthy()
  })
})
