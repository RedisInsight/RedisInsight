import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import ModuleNotLoaded, { IProps } from './ModuleNotLoaded'

const mockedProps = mock<IProps>()

describe('ModuleNotLoaded', () => {
  it('should render', () => {
    expect(render(<ModuleNotLoaded {...instance(mockedProps)} />)).toBeTruthy()
  })
})
