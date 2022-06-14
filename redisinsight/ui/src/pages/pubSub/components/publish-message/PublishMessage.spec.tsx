import { fireEvent } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import React from 'react'
import { publishMessage } from 'uiSrc/slices/pubsub/pubsub'
import { cleanup, clearStoreActions, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import PublishMessage from './PublishMessage'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('PublishMessage', () => {
  it('should render', () => {
    expect(render(<PublishMessage />)).toBeTruthy()
  })

  it('should dispatch subscribe action after submit', () => {
    render(<PublishMessage />)
    const expectedActions = [publishMessage()]
    fireEvent.click(screen.getByTestId('publish-message-submit'))

    expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions))
  })
})
