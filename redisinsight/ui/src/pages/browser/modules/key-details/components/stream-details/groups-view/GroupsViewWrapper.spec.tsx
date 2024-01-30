import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import {
  deleteConsumerGroups,
  loadConsumerGroups,
  setSelectedGroup
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { stringToBuffer } from 'uiSrc/utils'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { ConsumerGroupDto } from 'apiSrc/modules/browser/stream/dto'
import GroupsView, { Props as GroupsViewProps } from './GroupsView'
import GroupsViewWrapper, { Props } from './GroupsViewWrapper'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('./GroupsView', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockGroupName = 'group'
const mockGroups: ConsumerGroupDto[] = [{
  name: {
    ...stringToBuffer('test'),
    viewValue: 'test',
  },
  consumers: 123,
  pending: 321,
  smallestPendingId: '123',
  greatestPendingId: '123',
  lastDeliveredId: '123'
}, {
  name: {
    ...stringToBuffer('test2'),
    viewValue: 'test2',
  },
  consumers: 13,
  pending: 31,
  smallestPendingId: '3',
  greatestPendingId: '23',
  lastDeliveredId: '12'
}]

const mockGroupsView = (props: GroupsViewProps) => (
  <div data-testid="stream-groups-container">
    <button
      type="button"
      data-testid="select-group-btn"
      onClick={() => props?.onSelectGroup?.({ name: mockGroupName })}
    >
      some group name
    </button>

    <VirtualTable
      items={mockGroups}
      loading={false}
      onRowClick={props?.onSelectGroup}
      columns={props.columns}
    />
  </div>
)

describe('GroupsViewWrapper', () => {
  beforeAll(() => {
    (GroupsView as jest.Mock).mockImplementation(mockGroupsView)
  })

  it('should render', () => {
    expect(render(<GroupsViewWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render Groups container', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    expect(screen.getByTestId('stream-groups-container')).toBeInTheDocument()
  })

  it('should select Group', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('select-group-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedGroup(),
      loadConsumerGroups(false)
    ])
  })

  it('should delete Group', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('remove-groups-button-test-icon'))
    fireEvent.click(screen.getByTestId('remove-groups-button-test'))

    expect(store.getActions()).toEqual([...afterRenderActions, deleteConsumerGroups()])
  })

  it('should disable refresh when editing Group', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('edit-stream-last-id-123'))

    expect(store.getActions()).toEqual([...afterRenderActions, setSelectedKeyRefreshDisabled(true)])
  })
})
