import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import DatabasePanelDialog, { Props } from './DatabasePanelDialog'

const mockedProps = mock<Props>()

describe('DatabasePanelDialog', () => {
  it('should render', () => {
    expect(render(<DatabasePanelDialog {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render proper form by dfeault', () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} onClose={jest.fn()} />)

    expect(screen.getByTestId('connection-url')).toBeInTheDocument()
  })

  it('should change screen to cloud and render proper form', () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('discover-cloud-btn'))

    expect(screen.getByTestId('add-db_cloud-api')).toBeInTheDocument()
  })

  it('should change screen to software and render proper form', () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('option-btn-software'))

    expect(screen.getByTestId('add-db_cluster')).toBeInTheDocument()
  })

  it('should change tab to sentinel and render proper form', async () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('option-btn-sentinel'))

    expect(screen.getByTestId('add-db_sentinel')).toBeInTheDocument()
  })

  it('should change screen to import render proper form', async () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('option-btn-import'))

    expect(screen.getByTestId('add-db_import')).toBeInTheDocument()
  })
})
