import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, mockedStore, cleanup, act } from 'uiSrc/utils/test-utils'

import { defaultInstanceChanging } from 'uiSrc/slices/instances/instances'
import { AddDbType } from 'uiSrc/pages/home/constants'
import ConnectionUrl, { Props } from './ConnectionUrl'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ConnectionUrl', () => {
  it('should render', () => {
    expect(render(<ConnectionUrl {...mockedProps} />)).toBeTruthy()
  })

  it('should call proper actions with empty connection url', async () => {
    render(<ConnectionUrl {...mockedProps} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })

    expect(store.getActions()).toEqual([defaultInstanceChanging()])
  })

  it('should disable test connection and submit buttons when connection url is invalid', async () => {
    render(<ConnectionUrl {...mockedProps} />)

    await act(async () => {
      fireEvent.change(
        screen.getByTestId('connection-url'),
        { target: { value: 'q' } }
      )
    })

    expect(screen.getByTestId('btn-submit')).toBeDisabled()
    expect(screen.getByTestId('btn-test-connection')).toBeDisabled()
  })

  it('should not disable buttons with proper connection url', async () => {
    render(<ConnectionUrl {...mockedProps} />)

    await act(async () => {
      fireEvent.change(
        screen.getByTestId('connection-url'),
        { target: { value: 'redis://localhost:6322' } }
      )
    })

    expect(screen.getByTestId('btn-submit')).not.toBeDisabled()
    expect(screen.getByTestId('btn-test-connection')).not.toBeDisabled()
  })

  it('should call proper actions after click manual settings', async () => {
    const onSelectOptionMock = jest.fn()
    render(<ConnectionUrl {...mockedProps} onSelectOption={onSelectOptionMock} />)

    await act(async () => {
      fireEvent.change(
        screen.getByTestId('connection-url'),
        { target: { value: 'redis://localhost:6322' } }
      )
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-connection-settings'))
    })

    expect(onSelectOptionMock).toBeCalledWith(
      AddDbType.manual,
      {
        db: undefined,
        host: 'localhost',
        name: 'localhost:6322',
        password: undefined,
        port: 6322,
        tls: false,
        username: 'default'
      }
    )
  })

  it('should call proper actions after click connectivity option', async () => {
    const onSelectOptionMock = jest.fn()
    render(<ConnectionUrl {...mockedProps} onSelectOption={onSelectOptionMock} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('option-btn-sentinel'))
    })

    expect(onSelectOptionMock).toBeCalledWith(AddDbType.sentinel, expect.any(Object))
  })
})
