import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { ConsumerDto } from 'apiSrc/modules/browser/stream/dto'
import ConsumersView, { Props } from './ConsumersView'

const mockedProps = mock<Props>()
const mockConsumers: ConsumerDto[] = [{
  name: 'test',
  idle: 123,
  pending: 321,
}, {
  name: 'test2',
  idle: 13,
  pending: 31,
}]

describe('ConsumersView', () => {
  it('should render', () => {
    expect(render(<ConsumersView {...instance(mockedProps)} data={mockConsumers} />)).toBeTruthy()
  })
})
