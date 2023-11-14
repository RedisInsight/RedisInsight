import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { Props, AddItemsPanel } from './AddItemsPanel'

const mockedProps = mock<Props>()

const AddItemsPanelTypeTests: any[] = [
  [KeyTypes.Hash, 'add-hash-field-panel'],
  [KeyTypes.ZSet, 'add-zset-field-panel'],
  [KeyTypes.Set, 'add-set-field-panel'],
  [KeyTypes.List, 'add-list-field-panel'],
  [KeyTypes.Stream, 'add-stream-field-panel', StreamViewType.Data],
  [KeyTypes.Stream, 'add-stream-groups-field-panel', StreamViewType.Groups],
  [KeyTypes.Stream, 'add-stream-groups-field-panel', StreamViewType.Consumers],
  [KeyTypes.Stream, 'add-stream-groups-field-panel', StreamViewType.Messages],
]

describe('AddItemsPanel', () => {
  it('should render', () => {
    expect(render(<AddItemsPanel {...instance(mockedProps)} />)).toBeTruthy()
  })

  it.each(AddItemsPanelTypeTests)('for key type: %s (reply), data-subj should exists: %s',
    (type: KeyTypes, subj: string, strViewType: StreamViewType = StreamViewType.Data) => {
      const { container } = render(<AddItemsPanel
        {...instance(mockedProps)}
        selectedKeyType={type}
        streamViewType={strViewType}
      />)
      expect(container.querySelector(`[data-test-subj=${subj}]`)).toBeInTheDocument()
    })
})
