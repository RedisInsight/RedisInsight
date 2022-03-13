import React from 'react'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import { defaultValue, EnablementAreaProvider } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import Pagination from './Pagination'

const paginationItems = Object.values(MOCK_GUIDES_ITEMS['quick-guides']?.children || {})

describe('Pagination', () => {
  it('should render', () => {
    const component = render(<Pagination items={paginationItems} />)
    const { queryByTestId } = component

    expect(component).toBeTruthy()
    expect(queryByTestId('enablement-area__prev-page-btn')).not.toBeInTheDocument()
    expect(queryByTestId('enablement-area__next-page-btn')).toBeInTheDocument()
  })
  it('should correctly open popover', () => {
    const { queryByTestId } = render(
      <Pagination items={paginationItems} activePageId={paginationItems[0].id} />
    )
    fireEvent.click(screen.getByTestId('enablement-area__pagination-popover-btn'))
    const popover = queryByTestId('enablement-area__pagination-popover')

    expect(popover).toBeInTheDocument()
    expect(popover?.querySelectorAll('.pagesItem').length).toEqual(paginationItems.length)
    expect(popover?.querySelector('.pagesItemActive')).toHaveTextContent(paginationItems[0].label)
  })
  it('should correctly open next page', () => {
    const openPage = jest.fn()
    const pageIndex = 0

    render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination items={paginationItems} activePageId={paginationItems[pageIndex].id} />
      </EnablementAreaProvider>
    )
    fireEvent.click(screen.getByTestId('enablement-area__next-page-btn'))

    expect(openPage).toBeCalledWith({ path: paginationItems[pageIndex + 1]?.args?.path })
  })
  it('should correctly open previous page', () => {
    const openPage = jest.fn()
    const pageIndex = 1

    render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination items={paginationItems} activePageId={paginationItems[pageIndex].id} />
      </EnablementAreaProvider>
    )
    fireEvent.click(screen.getByTestId('enablement-area__prev-page-btn'))

    expect(openPage).toBeCalledWith({ path: paginationItems[pageIndex - 1]?.args?.path })
  })
  it('should correctly open by using pagination popover', async () => {
    const openPage = jest.fn()
    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination items={paginationItems} activePageId={paginationItems[0].id} />
      </EnablementAreaProvider>
    )

    fireEvent.click(screen.getByTestId('enablement-area__pagination-popover-btn'))
    const popover = queryByTestId('enablement-area__pagination-popover')
    await waitFor(() => {
      popover?.querySelectorAll('.pagesItem').forEach(async (el) => {
        fireEvent.click(el)
      })
    })

    expect(openPage).toBeCalledTimes(paginationItems.length - 1) // -1 because active item should not be clickable
    expect(openPage)
      .lastCalledWith({ path: paginationItems[paginationItems.length - 1]?.args?.path })
  })
})
