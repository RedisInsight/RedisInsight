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
        field: 'subscriptionId',
        className: 'column_subscriptionId',
        name: 'Subscription ID',
        dataType: 'string',
        sortable: true,
        width: '170px',
        truncateText: true,
      },
    ]
    expect(
      render(
        <RedisClusterDatabasesResult
          {...instance(mockedProps)}
          columns={columnsMock}
        />
      )
    ).toBeTruthy()
  })
})
