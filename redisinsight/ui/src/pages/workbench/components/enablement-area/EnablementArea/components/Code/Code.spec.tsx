import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { EnablementAreaProvider, defaultValue } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { MONACO_MANUAL } from 'uiSrc/constants'

import Code, { Props } from './Code'

const mockedProps = mock<Props>()

/**
 * Code tests
 *
 * @group unit
 */
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

    const link = queryByTestId(`preselect-${label}`)
    fireEvent.click(link as Element)
    expect(setScript).toBeCalledWith(MONACO_MANUAL)
  })
})
