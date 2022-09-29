import { ConsumerDto } from 'apiSrc/modules/browser/dto/stream.dto'
import { getDefaultConsumer } from '../streamUtils'

const consumers1: ConsumerDto[] = [
  { name: 'name_2', pending: 1, idle: 123 },
  { name: 'name_1', pending: 1, idle: 123 },
  { name: 'name_3', pending: 3, idle: 123 }
]

const consumers2: ConsumerDto[] = [
  { name: 'name_2', pending: 1, idle: 123 }
]

const consumers3: ConsumerDto[] = []

/**
 * getDefaultConsumer tests
 *
 * @group unit
 */
describe('getDefaultConsumer', () => {
  it('should get consumer with lowest pending messages count and ', () => {
    expect(getDefaultConsumer(consumers1)).toEqual({ name: 'name_1', pending: 1, idle: 123 })
    expect(getDefaultConsumer(consumers2)).toEqual({ name: 'name_2', pending: 1, idle: 123 })
    expect(getDefaultConsumer(consumers3)).toEqual(undefined)
  })
})
