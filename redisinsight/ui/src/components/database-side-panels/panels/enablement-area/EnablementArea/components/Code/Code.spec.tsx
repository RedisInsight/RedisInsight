import React from 'react'
import { instance, mock } from 'ts-mockito'
import { MONACO_MANUAL, ExecuteButtonMode } from 'uiSrc/constants'
import { defaultValue, EnablementAreaProvider } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import Code, { Props } from './Code'

const mockedProps = mock<Props>()

describe('Code', () => {
  it('should render', () => {
    const label = 'Manual'
    const component = render(<Code {...instance(mockedProps)} label={label}>{MONACO_MANUAL}</Code>)
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
  })
  it('should correctly set script', () => {
    const setScript = jest.fn()
    const label = 'Manual'

    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <Code {...instance(mockedProps)} label={label}>{MONACO_MANUAL}</Code>
      </EnablementAreaProvider>
    )

    const link = queryByTestId(`run-btn-${label}`)
    fireEvent.click(link as Element)
    expect(setScript).toBeCalledWith(
      MONACO_MANUAL,
      { mode: ExecuteButtonMode.Manual, params: undefined },
      {},
    )
  })

  it('should correctly set script with auto execute', () => {
    const setScript = jest.fn()
    const label = 'Manual'

    render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <Code {...instance(mockedProps)} label={label} params="[auto=true]">{MONACO_MANUAL}</Code>
      </EnablementAreaProvider>
    )

    fireEvent.click(screen.queryByTestId(`run-btn-${label}`) as Element)
    expect(setScript).toBeCalledWith(
      MONACO_MANUAL,
      { mode: ExecuteButtonMode.Auto, params: { auto: 'true' } },
      {},
    )
  })
})
