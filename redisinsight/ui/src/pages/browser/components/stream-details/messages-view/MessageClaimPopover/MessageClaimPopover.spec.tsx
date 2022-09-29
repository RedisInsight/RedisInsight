import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import MessageClaimPopover, { Props } from './MessageClaimPopover'

const mockedProps = mock<Props>()

describe('MessageClaimPopover', () => {
  it('should render', () => {
    expect(render(<MessageClaimPopover {...instance(mockedProps)} />)).toBeTruthy()
  })
})
