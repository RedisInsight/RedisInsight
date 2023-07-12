import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { INFINITE_MESSAGES } from './InfiniteMessages'

describe('INFINITE_MESSAGES', () => {
  describe('SUCCESS_CREATE_DB', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(jest.fn())
      expect(render(<>{Inner}</>))
    })

    it('should call onSuccess', () => {
      const onSuccess = jest.fn()
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('notification-connect-db'))

      expect(onSuccess).toBeCalled()
    })
  })
})
