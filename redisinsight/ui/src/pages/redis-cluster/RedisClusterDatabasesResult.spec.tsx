import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RedisClusterDatabasesResult, {
  Props,
} from './RedisClusterDatabasesResult'

const mockedProps = mock<Props>()

describe('RedisClusterDatabasesResult', () => {
  it('should render', () => {
    const columnsMock = [
      {
        header: 'Subscription ID',
        id: 'subscriptionId',
        accessorKey: 'subscriptionId',
        enableSorting: true,
      },
    ]
    expect(
      render(
        <RedisClusterDatabasesResult
          {...instance(mockedProps)}
          columns={columnsMock}
        />,
      ),
    ).toBeTruthy()
  })
})
