import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import { BulkActionsType } from 'uiSrc/constants'
import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'
import NoKeysFound, { Props } from './NoKeysFound'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NoKeysFound', () => {
  it('should render', () => {
    expect(render(<NoKeysFound {...mockedProps} />)).toBeTruthy()
  })

  it('should call props on click buttons', () => {
    const onAddMock = jest.fn()
    const onBulkUploadMOck = jest.fn()

    render(<NoKeysFound {...mockedProps} onAddKeyPanel={onAddMock} onBulkActionsPanel={onBulkUploadMOck} />)

    fireEvent.click(screen.getByTestId('add-key-msg-btn'))

    expect(onAddMock).toBeCalled()

    fireEvent.click(screen.getByTestId('upload-data-msg-btn'))

    expect(onBulkUploadMOck).toBeCalledWith(true)
  })

  it('should call proper actions on click bulk upload', () => {
    const onBulkUploadMOck = jest.fn()
    render(<NoKeysFound {...mockedProps} onBulkActionsPanel={onBulkUploadMOck} />)

    fireEvent.click(screen.getByTestId('upload-data-msg-btn'))

    expect(store.getActions()).toEqual([setBulkActionType(BulkActionsType.Upload)])
  })
})
