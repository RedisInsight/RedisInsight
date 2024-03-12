import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudDatabasesResult, { Props } from './RedisCloudDatabasesResult'

const mockedProps = mock<Props>()

describe('RedisCloudDatabasesResult', () => {
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
        <RedisCloudDatabasesResult
          {...instance(mockedProps)}
          columns={columnsMock}
        />
      )
    ).toBeTruthy()
  })
})
