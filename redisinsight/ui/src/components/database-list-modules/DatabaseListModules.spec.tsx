import React from 'react'
import { instance, mock } from 'ts-mockito'
import { RedisDefaultModules, DATABASE_LIST_MODULES_TEXT } from 'uiSrc/slices/interfaces'
import { fireEvent, render, waitFor } from 'uiSrc/utils/test-utils'
import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import DatabaseListModules, { Props } from './DatabaseListModules'

const mockedProps = mock<Props>()

const modulesMock: RedisModuleDto[] = [
  { name: RedisDefaultModules.AI },
  { name: RedisDefaultModules.Bloom },
  { name: RedisDefaultModules.Gears },
  { name: RedisDefaultModules.Graph },
  { name: RedisDefaultModules.ReJSON },
  { name: RedisDefaultModules.Search },
  { name: RedisDefaultModules.TimeSeries },
]

describe('DatabaseListModules', () => {
  it('should render', () => {
    expect(render(<DatabaseListModules {...instance(mockedProps)} modules={modulesMock} />)).toBeTruthy()
  })

  it('copy module name', async () => {
    const { queryByTestId } = render(
      <DatabaseListModules {...instance(mockedProps)} modules={modulesMock} />
    )

    const term = DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search]

    const module = queryByTestId(`${term}_module`)

    await waitFor(() => {
      module && fireEvent.click(module)
    })

    // queryByTestId
    expect(render(<DatabaseListModules {...instance(mockedProps)} modules={modulesMock} />)).toBeTruthy()
  })
})
