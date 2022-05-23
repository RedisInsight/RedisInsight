import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import GroupsView, { Props } from './GroupsView'

const mockedProps = mock<Props>()

describe('GroupsView', () => {
  it('should render', () => {
    expect(render(<GroupsView {...instance(mockedProps)} />)).toBeTruthy()
  })
})
