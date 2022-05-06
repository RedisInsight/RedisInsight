import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import PopoverDelete, { Props } from './PopoverDelete'

const mockedProps = mock<Props>()

describe('PopoverDelete', () => {
  it('should render', () => {
    expect(render(<PopoverDelete {...instance(mockedProps)} />)).toBeTruthy()
  })
})
