import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'

import Recommendations from './Recommendations'

const mockdbAnalysisSelector = jest.requireActual('uiSrc/slices/analytics/dbAnalysis')

jest.mock('uiSrc/slices/analytics/dbAnalysis', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/dbAnalysis'),
  dbAnalysisSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null,
    history: {
      loading: false,
      error: '',
      data: [],
      selectedAnalysis: null,
    }
  }),
}))

describe('Recommendations', () => {
  it('should render', () => {
    expect(render(<Recommendations />)).toBeTruthy()
  })

  it('should render loader', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      loading: true
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('recommendations-loader')).toBeInTheDocument()
  })

  it('should not render loader', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('recommendations-loader')).not.toBeInTheDocument()
  })

  it('should render code changes badge in luaScript recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'luaScript' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
  })

  it('should render code changes badge in useSmallerKeys recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'useSmallerKeys' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
  })

  it('should render code changes badge and configuration_changes in bigHashes recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigHashes' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render code changes badge in avoidLogicalDatabases recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'avoidLogicalDatabases' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
  })

  it('should render code changes badge in combineSmallStringsToHashes recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'combineSmallStringsToHashes' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
  })

  it('should render configuration_changes badge in increaseSetMaxIntsetEntries recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'increaseSetMaxIntsetEntries' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render code changes badge in convertHashtableToZiplist recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'convertHashtableToZiplist' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render configuration_changes badge in compressHashFieldNames recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'compressHashFieldNames' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render configuration_changes badge in compressionForList recommendation', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'compressionForList' }]
      }
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should collapse/expand', () => {
    (dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'luaScript' }]
      }
    }))

    const { container } = render(<Recommendations />)

    expect(screen.queryAllByTestId('luaScript-accordion')[0]?.classList.contains('euiAccordion-isOpen')).not.toBeTruthy()

    fireEvent.click(container.querySelector('[data-test-subj="luaScript-button"]') as HTMLInputElement)

    expect(screen.queryAllByTestId('luaScript-accordion')[0]?.classList.contains('euiAccordion-isOpen')).toBeTruthy()

    fireEvent.click(container.querySelector('[data-test-subj="luaScript-button"]') as HTMLInputElement)

    expect(screen.queryAllByTestId('luaScript-accordion')[0]?.classList.contains('euiAccordion-isOpen')).not.toBeTruthy()
  })
})
