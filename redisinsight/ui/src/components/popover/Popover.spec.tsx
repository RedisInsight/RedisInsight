import React from 'react'
import { Props as PopoverProps } from '@elastic/eui/src/components/popover/popover'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import Popover from './Popover'

const mockedProps = mock<PopoverProps>()

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
