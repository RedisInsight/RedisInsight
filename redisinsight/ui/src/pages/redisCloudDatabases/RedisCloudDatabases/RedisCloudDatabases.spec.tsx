import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudDatabases, { Props } from './RedisCloudDatabases'

const mockedProps = mock<Props>()

describe('RedisCloudDatabases', () => {
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
        <RedisCloudDatabases
          {...instance(mockedProps)}
          columns={columnsMock}
        />
      )
    ).toBeTruthy()
  })
})
