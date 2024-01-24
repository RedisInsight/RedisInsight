import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import Popover, { Props } from './Popover'

const mockedProps = mock<Props>()

describe('Popover', () => {
  it('should render', () => {
    expect(
      render(
        <Popover
          {...instance(mockedProps)}
        >
          <></>
        </Popover>
      )
    ).toBeTruthy()
  })
})
