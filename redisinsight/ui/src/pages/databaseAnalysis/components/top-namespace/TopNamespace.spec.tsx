import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import TopNamespace, { Props } from './TopNamespace'

const mockedProps = mock<Props>()

describe('TopNamespace', () => {
  it('should render', () => {
    expect(render(<TopNamespace {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render nsp-table-keys when click "btn-change-table-keys" ', () => {
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

    const { queryByTestId } = render(<TopNamespace {...instance(mockedProps)} data={mockedData} />)

    fireEvent.click(screen.getByTestId('btn-change-table-keys'))

    expect(queryByTestId('nsp-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).toBeInTheDocument()
    expect(queryByTestId('btn-change-table-memory')).not.toBeDisabled()
    expect(queryByTestId('btn-change-table-keys')).toBeDisabled()
  })

  it('should render nsp-table-keys when click "btn-change-table-memory" and memory button should be disabled', () => {
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

    const { queryByTestId } = render(<TopNamespace {...instance(mockedProps)} data={mockedData} />)

    // memory button is disabled by default
    fireEvent.click(screen.getByTestId('btn-change-table-keys'))
    fireEvent.click(screen.getByTestId('btn-change-table-memory'))

    expect(queryByTestId('nsp-table-memory')).toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
    expect(queryByTestId('btn-change-table-memory')).toBeDisabled()
    expect(queryByTestId('btn-change-table-keys')).not.toBeDisabled()
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

    const { queryByTestId } = render(<TopNamespace {...instance(mockedProps)} data={mockedData} />)

    expect(queryByTestId('nsp-table-memory')).toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
    expect(queryByTestId('btn-change-table-memory')).toBeDisabled()
    expect(queryByTestId('btn-change-table-keys')).not.toBeDisabled()
  })

  it('should not render tables when topMemoryNsp and topKeysNsp are empty array', () => {
    const mockedData = {
      topKeysNsp: [],
      topMemoryNsp: []
    }
    const { queryByTestId } = render(<TopNamespace {...instance(mockedProps)} data={mockedData} />)

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
    const { queryByTestId } = render(<TopNamespace {...instance(mockedProps)} loading data={mockedData} />)

    expect(queryByTestId('nsp-table-memory')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-keys')).not.toBeInTheDocument()
    expect(queryByTestId('nsp-table-loader')).toBeInTheDocument()
  })
})
