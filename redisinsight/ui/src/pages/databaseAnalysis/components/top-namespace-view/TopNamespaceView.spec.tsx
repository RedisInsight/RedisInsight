import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import TopNamespaceView, { Props } from './TopNamespaceView'

const mockedProps = mock<Props>()

describe('TopNamespaceView', () => {
  it('should render', () => {
    expect(render(<TopNamespaceView {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render nsp-table-keys when click "btn-change-mode-keys" ', () => {
    const mockedData = {
      topKeysNsp: [{
        nsp: 'nsp_name',
        memory: 1,
        keys: 1,
        types: [{ type: 'hash', memory: 1, keys: 1 }]
      }],
      topMemoryNsp: [{
        nsp: 'nsp_name',
        memory: 1,
        keys: 1,
        types: [{ type: 'hash', memory: 1, keys: 1 }]
      }]
    }

    const { queryByTestId } = render(<TopNamespaceView {...instance(mockedProps)} data={mockedData} />)

    fireEvent.click(screen.getByTestId('btn-change-mode-keys'))

    expect(queryByTestId('nsp-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).toBeInTheDocument()
    expect(queryByTestId('btn-change-mode-memory')).not.toBeDisabled()
    expect(queryByTestId('btn-change-mode-keys')).toBeDisabled()
  })

  it('should render nsp-table-keys when click "btn-change-mode-memory" and memory button should be disabled', () => {
    const mockedData = {
      topKeysNsp: [{
        nsp: 'nsp_name',
        memory: 1,
        keys: 1,
        types: [{ type: 'hash', memory: 1, keys: 1 }]
      }],
      topMemoryNsp: [{
        nsp: 'nsp_name',
        memory: 1,
        keys: 1,
        types: [{ type: 'hash', memory: 1, keys: 1 }]
      }]
    }

    const { queryByTestId } = render(<TopNamespaceView {...instance(mockedProps)} data={mockedData} />)

    // memory button is disabled by default
    fireEvent.click(screen.getByTestId('btn-change-mode-keys'))
    fireEvent.click(screen.getByTestId('btn-change-mode-memory'))

    expect(queryByTestId('nsp-table-memory')).toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
    expect(queryByTestId('btn-change-mode-memory')).toBeDisabled()
    expect(queryByTestId('btn-change-mode-keys')).not.toBeDisabled()
  })

  it('should render nsp-table-keys by default" ', () => {
    const mockedData = {
      topKeysNsp: [{
        nsp: 'nsp_name',
        memory: 1,
        keys: 1,
        types: [{ type: 'hash', memory: 1, keys: 1 }]
      }],
      topMemoryNsp: [{
        nsp: 'nsp_name',
        memory: 1,
        keys: 1,
        types: [{ type: 'hash', memory: 1, keys: 1 }]
      }]
    }

    const { queryByTestId } = render(<TopNamespaceView {...instance(mockedProps)} data={mockedData} />)

    expect(queryByTestId('nsp-table-memory')).toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
    expect(queryByTestId('btn-change-mode-memory')).toBeDisabled()
    expect(queryByTestId('btn-change-mode-keys')).not.toBeDisabled()
  })

  it('should not render tables when topKeysNsp is empty array', () => {
    const mockedData = {
      topKeysNsp: [],
      topMemoryNsp: [
        {
          nsp: 'nsp_name',
          memory: 1,
          keys: 1,
          types: [{ type: 'hash', memory: 1, keys: 1 }]
        }
      ]
    }
    const { queryByTestId } = render(<TopNamespaceView {...instance(mockedProps)} data={mockedData} />)

    expect(queryByTestId('nsp-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
  })

  it('should not render tables when topMemoryNsp is empty array', () => {
    const mockedData = {
      topKeysNsp: [
        {
          nsp: 'nsp_name',
          memory: 1,
          keys: 1,
          types: [{ type: 'hash', memory: 1, keys: 1 }]
        }
      ],
      topMemoryNsp: []
    }
    const { queryByTestId } = render(<TopNamespaceView {...instance(mockedProps)} data={mockedData} />)

    expect(queryByTestId('nsp-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
  })

  it('should render loader when loading="true"', () => {
    const mockedData = {
      topKeysNsp: [
        {
          nsp: 'nsp_name',
          memory: 1,
          keys: 1,
          types: [{ type: 'hash', memory: 1, keys: 1 }]
        }
      ],
      topMemoryNsp: [
        {
          nsp: 'nsp_name',
          memory: 1,
          keys: 1,
          types: [{ type: 'hash', memory: 1, keys: 1 }]
        }
      ]
    }
    const { queryByTestId } = render(<TopNamespaceView {...instance(mockedProps)} loading data={mockedData} />)

    expect(queryByTestId('nsp-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-loader')).toBeInTheDocument()
  })
})
