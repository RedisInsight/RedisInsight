import React from 'react'
import { render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import MonacoEditor from './MonacoEditor'

const mockStore = configureStore({ reducer: () => ({}) })

const renderWithRedux = (ui: React.ReactNode) =>
  render(<Provider store={mockStore}>{ui}</Provider>)

const commonProps = {
  length: 1,
  selectedKey: 'key' as any,
  dataType: 'ReJSON-RL',
  isDownloaded: true,
  onJsonKeyExpandAndCollapse: () => {},
  expandedRows: new Set(['someKey']),
}

it('should preserve large numbers in Monaco editor', async () => {
  const bigNumber = '245343644508855571'
  const data = { huge: BigInt(bigNumber) }

  expect(() =>
    renderWithRedux(<MonacoEditor data={data as any} {...commonProps} />),
  ).toThrow(/Do not know how to serialize a BigInt/)
})
