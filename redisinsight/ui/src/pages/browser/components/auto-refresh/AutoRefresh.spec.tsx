import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, screen, render, act } from 'uiSrc/utils/test-utils'
import AutoRefresh, { Props } from './AutoRefresh'
import { DEFAULT_REFRESH_RATE } from './utils'

const mockedProps = mock<Props>()

const INLINE_ITEM_EDITOR = 'inline-item-editor'

describe('AutoRefresh', () => {
  it('should render', () => {
    expect(render(<AutoRefresh {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('prop "displayText = true" should show Refresh text', () => {
    const { queryByTestId } = render(<AutoRefresh {...instance(mockedProps)} displayText />)

    expect(queryByTestId('refresh-message-label')).toBeInTheDocument()
  })

  it('prop "displayText = false" should hide Refresh text', () => {
    const { queryByTestId } = render(<AutoRefresh {...instance(mockedProps)} displayText={false} />)

    expect(queryByTestId('refresh-message-label')).not.toBeInTheDocument()
  })

  it('should call onRefresh', () => {
    const onRefresh = jest.fn()
    render(<AutoRefresh {...instance(mockedProps)} onRefresh={onRefresh} testid="refresh-key-btn" />)

    fireEvent.click(screen.getByTestId('refresh-key-btn'))
    expect(onRefresh).toBeCalled()
  })

  it('refresh text should contain "Last refresh" time with disabled auto-refresh', async () => {
    render(<AutoRefresh {...instance(mockedProps)} displayText />)

    expect(screen.getByTestId('refresh-message-label')).toHaveTextContent(/Last refresh:/i)
    expect(screen.getByTestId('refresh-message')).toHaveTextContent('now')
  })

  it('refresh text should contain "Auto-refresh" time with enabled auto-refresh', async () => {
    render(<AutoRefresh {...instance(mockedProps)} displayText />)

    fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
    fireEvent.click(screen.getByTestId('auto-refresh-switch'))

    expect(screen.getByTestId('refresh-message-label')).toHaveTextContent(/Auto refresh:/i)
    expect(screen.getByTestId('refresh-message')).toHaveTextContent(DEFAULT_REFRESH_RATE)
  })

  describe('AutoRefresh Config', () => {
    it('Auto refresh config should render', () => {
      const { queryByTestId } = render(<AutoRefresh {...instance(mockedProps)} />)

      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      expect(queryByTestId('auto-refresh-switch')).toBeInTheDocument()
    })

    it('should call onRefresh after enable auto-refresh and set 1 sec', async () => {
      const onRefresh = jest.fn()
      render(<AutoRefresh {...instance(mockedProps)} onRefresh={onRefresh} />)

      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      fireEvent.click(screen.getByTestId('auto-refresh-switch'))
      fireEvent.click(screen.getByTestId('refresh-rate'))

      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), { target: { value: '1' } })
      expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue('1')

      screen.getByTestId(/apply-btn/).click()

      await act(async () => {
        await new Promise((r) => setTimeout(r, 1300))
      })
      expect(onRefresh).toBeCalledTimes(1)

      await act(async () => {
        await new Promise((r) => setTimeout(r, 1300))
      })
      expect(onRefresh).toBeCalledTimes(2)

      await act(async () => {
        await new Promise((r) => setTimeout(r, 1300))
      })
      expect(onRefresh).toBeCalledTimes(3)
    })
  })
})
