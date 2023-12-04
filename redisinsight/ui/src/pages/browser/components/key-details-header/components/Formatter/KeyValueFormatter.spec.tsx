import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'

import KeyValueFormatter, { Props } from './KeyValueFormatter'

const mockedProps = {
  ...mock<Props>(),
}

describe('KeyValueFormatter', () => {
  it('should render', () => {
    expect(render(<KeyValueFormatter {...mockedProps} />)).toBeTruthy()
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
      'Vector 32Bit',
      'Vector 64Bit',
    ]
    render(<KeyValueFormatter {...mockedProps} />)

    fireEvent.click(screen.getByTestId('select-format-key-value'))

    await waitForEuiPopoverVisible()

    expect(document.querySelector('.euiSuperSelect__listbox')).toHaveTextContent(strictOrder.join(''))
  })
})
