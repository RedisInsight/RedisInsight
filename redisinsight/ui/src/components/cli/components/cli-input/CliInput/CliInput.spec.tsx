import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import CliInput, { Props } from './CliInput'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CliInput', () => {
  it('should render', () => {
    expect(render(<CliInput {...instance(mockedProps)} />)).toBeTruthy()
  })

  // It's not possible to simulate events on contenteditable with testing-react-library,
  // or any testing library that uses js - dom, because of a limitation on js - dom itself.
  // https://github.com/testing-library/dom-testing-library/pull/235
  it.skip('"onChange" should be called', async () => {
    const command = 'keys *'
    const setCommandMock = jest.fn()

    render(<CliInput {...instance(mockedProps)} setCommand={setCommandMock} />)

    const cliInput = screen.getByTestId('cli-command')

    fireEvent.blur(cliInput, { target: { innerHTML: command } })

    expect(setCommandMock).toBeCalledTimes(command.length)
  })

  it('onMouseUp should be called', async () => {
    const setCommandMock = jest.fn()

    render(<CliInput {...instance(mockedProps)} setCommand={setCommandMock} />)

    const cliInput = screen.getByTestId('cli-command')

    fireEvent.mouseUp(cliInput)

    expect(setCommandMock).not.toBeCalled()
  })
})
