import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import DatabasePanelDialog, { Props } from './DatabasePanelDialog'

const mockedProps = mock<Props>()

describe('DatabasePanelDialog', () => {
  it('should render', () => {
    expect(render(<DatabasePanelDialog {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should change tab to cloud and render proper form', () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('add-database_tab_cloud'))

    expect(screen.getByTestId('add-db_cloud-api')).toBeInTheDocument()
  })

  it('should change tab to software and render proper form', () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('add-database_tab_software'))

    expect(screen.getByTestId('add-db_cluster')).toBeInTheDocument()
  })

  it('should change tab to software sentinel and render proper form', async () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('add-database_tab_software'))

    await act(async () => {
      fireEvent.click(document.querySelector('[data-test-subj="radio-btn-sentinel"] label') as Element)
    })

    expect(screen.getByTestId('add-db_sentinel')).toBeInTheDocument()
  })

  it('should change tab to import render proper form', async () => {
    render(<DatabasePanelDialog {...instance(mockedProps)} isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('add-database_tab_import'))

    expect(screen.getByTestId('add-db_import')).toBeInTheDocument()
  })
})
