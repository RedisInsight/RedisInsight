import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudSubscriptions, { Props } from './RedisCloudSubscriptions'

const mockedProps = mock<Props>()

describe('RedisCloudSubscriptions', () => {
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

    const subscriptionsMock: RedisCloudSubscription[] = [
      {
        id: 123,
        name: 'name',
        numberOfDatabases: 123,
        provider: 'provider',
        region: 'region',
        status: RedisCloudSubscriptionStatus.Active,
      },
    ]
    expect(
      render(
        <RedisCloudSubscriptions
          {...instance(mockedProps)}
          columns={columnsMock}
          subscriptions={subscriptionsMock}
        />
      )
    ).toBeTruthy()
  })
})
