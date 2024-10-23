import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import { toggleSubscribeTriggerPubSub } from 'uiSrc/slices/pubsub/pubsub'
import { cleanup, clearStoreActions, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import SubscriptionPanel from './SubscriptionPanel'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SubscriptionPanel', () => {
  it('should render', () => {
    expect(render(<SubscriptionPanel />)).toBeTruthy()
  })

  it('should dispatch subscribe action after toggle subscribe button', () => {
    render(<SubscriptionPanel />)
    const expectedActions = [toggleSubscribeTriggerPubSub('1 2 3')]
    fireEvent.change(screen.getByTestId('channels-input'), { target: { value: '1 2 3' } })
    fireEvent.click(screen.getByTestId('subscribe-btn'))

    expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions))
  })

  it('should set default value on blur when empty', async () => {
    render(<SubscriptionPanel />)
    fireEvent.change(screen.getByTestId('channels-input'), { target: { value: '' } })
    fireEvent.blur(screen.getByTestId('channels-input'))

    await waitFor(() => screen.getByDisplayValue('*'))
    expect(screen.getByDisplayValue('*')).toBeInTheDocument()
  })
})
