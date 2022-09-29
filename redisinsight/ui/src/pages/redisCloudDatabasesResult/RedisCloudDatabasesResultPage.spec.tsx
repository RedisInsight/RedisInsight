import React from 'react'
import { EuiInMemoryTable } from '@elastic/eui'

import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'

import RedisCloudDatabasesResultPage from './RedisCloudDatabasesResultPage'
import RedisCloudDatabasesResult, { Props as RedisCloudDatabasesResultProps } from './RedisCloudDatabasesResult'

jest.mock('./RedisCloudDatabasesResult', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockRedisCloudDatabasesResult = (props: RedisCloudDatabasesResultProps) => (
  <div>
    <button type="button" onClick={() => props.onView()} data-testid="view-btn">onView</button>
    <button type="button" onClick={() => props.onBack()} data-testid="back-btn">onBack</button>
    <div className="databaseList">
      <EuiInMemoryTable
        isSelectable
        items={[]}
        itemId="id"
        loading={false}
        columns={props.columns}
        data-testid="table"
      />
    </div>
  </div>
)

/**
 * RedisCloudDatabasesResultPage tests
 *
 * @group component
 */
describe('RedisCloudDatabasesResultPage', () => {
  beforeAll(() => {
    RedisCloudDatabasesResult.mockImplementation(mockRedisCloudDatabasesResult)
  })
  it('should render', () => {
    const wrapped = render(<RedisCloudDatabasesResultPage />)

    expect(wrapped).toBeTruthy()
  })

  it('should call onBack', () => {
    const component = render(<RedisCloudDatabasesResultPage />)
    fireEvent.click(screen.getByTestId('back-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onView', () => {
    const component = render(<RedisCloudDatabasesResultPage />)
    fireEvent.click(screen.getByTestId('view-btn'))
    expect(component).toBeTruthy()
  })
})
