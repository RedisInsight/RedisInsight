import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import PopoverItemEditor, { Props } from './PopoverItemEditor'

const mockedProps = mock<Props>()

/**
 * PopoverItemEditor tests
 *
 * @group unit
 */
describe('PopoverItemEditor', () => {
  it('should render', () => {
    expect(
      render(
        <PopoverItemEditor
          {...instance(mockedProps)}
          onDecline={jest.fn()}
        >
          <></>
        </PopoverItemEditor>
      )
    ).toBeTruthy()
  })
})
