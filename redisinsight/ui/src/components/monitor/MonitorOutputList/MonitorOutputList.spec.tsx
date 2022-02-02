import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import MonitorOutputList, { Props } from './MonitorOutputList'

const mockedProps = {
  ...mock<Props>(),
  height: 20,
  width: 20
}

describe('MonitorOutputList', () => {
  it('should render', () => {
    expect(render(<MonitorOutputList {...mockedProps} />)).toBeTruthy()
  })

  it('should "ReactVirtualized__Grid" be in the DOM', () => {
    const item = { time: '112', args: ['ttl'], source: '12', database: '0' }
    const mockItems = [item]
    const { container } = render(<MonitorOutputList {...mockedProps} items={mockItems} />)
    expect(container.getElementsByClassName('ReactVirtualized__Grid').length).toBe(1)
  })
})
