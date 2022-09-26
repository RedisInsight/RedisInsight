import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import TopNamespaceView, { Props } from './TopNamespaceView'

const mockedProps = mock<Props>()

describe('TopNamespaceView', () => {
  it('should render', () => {
    expect(render(<TopNamespaceView {...instance(mockedProps)} />)).toBeTruthy()
  })
})
