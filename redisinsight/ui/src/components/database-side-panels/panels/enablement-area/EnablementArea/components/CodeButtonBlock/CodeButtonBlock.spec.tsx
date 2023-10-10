import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { AutoExecute } from 'uiSrc/slices/interfaces'
import { ExecuteButtonMode } from 'uiSrc/constants'
import CodeButtonBlock, { Props } from './CodeButtonBlock'

const mockedProps = mock<Props>()

const simpleContent = 'ft.info'

describe('CodeButtonBlock', () => {
  it('should render', () => {
    const label = 'Manual'
    const component = render(<CodeButtonBlock {...instance(mockedProps)} label={label} content={simpleContent} />)
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
    expect(container).toHaveTextContent(simpleContent)
  })

  it('should call onClick function', () => {
    const onClick = jest.fn()
    const label = 'Manual'

    render(<CodeButtonBlock {...instance(mockedProps)} label={label} onClick={onClick} content={simpleContent} />)
    fireEvent.click(screen.getByTestId(`run-btn-${label}`))

    expect(onClick).toBeCalled()
  })

  it('should call onCopy function', () => {
    const onCopy = jest.fn()
    const label = 'Manual'

    render(<CodeButtonBlock
      {...instance(mockedProps)}
      label={label}
      onCopy={onCopy}
      onClick={jest.fn()}
      content={simpleContent}
    />)
    fireEvent.click(screen.getByTestId(`copy-btn-${label}`))

    expect(onCopy).toBeCalled()
  })

  it('should call onClick with auto execute param', () => {
    const onClick = jest.fn()
    const label = 'Auto'

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onClick={onClick}
        mode={ExecuteButtonMode.Auto}
        params={{ auto: AutoExecute.True }}
        content={simpleContent}
      />
    )
    fireEvent.click(screen.getByTestId(`run-btn-${label}`))

    expect(onClick).toBeCalledWith({ mode: ExecuteButtonMode.Auto, params: { auto: AutoExecute.True } })
  })
})
