import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { INFINITE_MESSAGES } from './InfiniteMessages'

describe('INFINITE_MESSAGES', () => {
  describe('SUCCESS_CREATE_DB', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(jest.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = jest.fn()
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('notification-connect-db'))
      fireEvent.mouseUp(screen.getByTestId('success-create-db-notification'))
      fireEvent.mouseDown(screen.getByTestId('success-create-db-notification'))

      expect(onSuccess).toBeCalled()
    })
  })
  describe('PENDING_CREATE_DB', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.PENDING_CREATE_DB
      expect(render(<>{Inner}</>)).toBeTruthy()
    })
  })

  describe('AUTO_CREATING_DATABASE', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.AUTO_CREATING_DATABASE
      expect(render(<>{Inner}</>)).toBeTruthy()
    })
  })
})
