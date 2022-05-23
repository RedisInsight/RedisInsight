import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import GroupsViewWrapper, { Props } from './GroupsViewWrapper'

const mockedProps = mock<Props>()

describe('GroupsViewWrapper', () => {
  it('should render', () => {
    expect(render(<GroupsViewWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
