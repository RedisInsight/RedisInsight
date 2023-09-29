import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { AutoExecute } from 'uiSrc/slices/interfaces'
import { ExecuteButtonMode } from 'uiSrc/constants'
import CodeButton, { Props } from './CodeButton'

const mockedProps = mock<Props>()

describe('CodeButton', () => {
  it('should render', () => {
    const label = 'Manual'
    const component = render(<CodeButton {...instance(mockedProps)} label={label} />)
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
  })

  it('should not render auto-execute button', () => {
    const label = 'Manual'
    render(<CodeButton {...instance(mockedProps)} label={label} />)

    expect(screen.queryByTestId(`preselect-auto-${label}`)).not.toBeInTheDocument()
  })

  it('should call onClick function', () => {
    const onClick = jest.fn()
    const label = 'Manual'

    render(<CodeButton {...instance(mockedProps)} label={label} onClick={onClick} />)
    fireEvent.click(screen.getByTestId(`preselect-${label}`))

    expect(onClick).toBeCalled()
  })

  it('should call onClick with auto execute param', () => {
    const onClick = jest.fn()
    const label = 'Auto'

    render(
      <CodeButton
        {...instance(mockedProps)}
        label={label}
        onClick={onClick}
        mode={ExecuteButtonMode.Auto}
        params={{ auto: AutoExecute.True }}
      />
    )
    fireEvent.click(screen.getByTestId(`preselect-auto-${label}`))

    expect(onClick).toBeCalledWith({ mode: ExecuteButtonMode.Auto, params: { auto: AutoExecute.True } })
  })
})
