import { EuiBasicTableColumn } from '@elastic/eui'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Instance } from 'uiSrc/slices/interfaces'
import { render } from 'uiSrc/utils/test-utils'
import DatabasesList, { Props } from './DatabasesList'

const mockedProps = mock<Props>()

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

const columnVariationsMock: EuiBasicTableColumn<Instance>[][] = [
  columnsMock,
  columnsMock,
]

describe('DatabasesList', () => {
  it('should render', () => {
    expect(
      render(
        <DatabasesList
          {...instance(mockedProps)}
          columnVariations={columnVariationsMock}
        />
      )
    ).toBeTruthy()
  })
})
