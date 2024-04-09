import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'

import { Props, KeyDetailsHeaderFormatter } from './KeyDetailsHeaderFormatter'

const mockedProps = {
  ...mock<Props>(),
}

describe('KeyValueFormatter', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderFormatter {...mockedProps} />)).toBeTruthy()
  })

  it('should render options in the strict order', async () => {
    const strictOrder = [
      'Unicode',
      'ASCII',
      'Binary',
      'HEX',
      'JSON',
      'Msgpack',
      'Pickle',
      'Protobuf',
      'PHP serialized',
      'Java serialized',
      'Vector 32-bit',
      'Vector 64-bit',
    ]
    render(<KeyDetailsHeaderFormatter {...mockedProps} />)

    fireEvent.click(screen.getByTestId('select-format-key-value'))

    await waitForEuiPopoverVisible()

    expect(document.querySelector('.euiSuperSelect__listbox')).toHaveTextContent(strictOrder.join(''))
  })
})
