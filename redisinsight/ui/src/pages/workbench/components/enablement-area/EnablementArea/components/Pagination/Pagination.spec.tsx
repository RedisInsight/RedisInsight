import { act } from '@testing-library/react'
import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { ApiEndpoints, MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import { defaultValue, EnablementAreaProvider } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { EnablementAreaComponent } from 'uiSrc/slices/interfaces'

import Pagination from './Pagination'

const paginationItems = MOCK_GUIDES_ITEMS[0]?.children
  ?.map((item, index) => ({ ...item, _key: `${index}` }))
  ?.filter((item) => item.type === EnablementAreaComponent.InternalLink)
  || []

describe('Pagination', () => {
  it('should render', () => {
    const component = render(<Pagination sourcePath={ApiEndpoints.GUIDES_PATH} items={paginationItems} />)
    const { queryByTestId } = component

    expect(component).toBeTruthy()
    expect(queryByTestId('enablement-area__prev-page-btn')).not.toBeInTheDocument()
    expect(queryByTestId('enablement-area__next-page-btn')).toBeInTheDocument()
  })
  it('should correctly open popover', () => {
    const { queryByTestId } = render(
      <Pagination sourcePath={ApiEndpoints.GUIDES_PATH} items={paginationItems} activePageKey="0" />
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
        <Pagination
          sourcePath={ApiEndpoints.GUIDES_PATH}
          items={paginationItems}
          activePageKey="0"
        />
      </EnablementAreaProvider>
    )
    fireEvent.click(screen.getByTestId('enablement-area__next-page-btn'))

    expect(openPage).toBeCalledWith({
      path: ApiEndpoints.GUIDES_PATH + paginationItems[pageIndex + 1]?.args?.path,
      manifestPath: expect.any(String)
    })
  })
  it('should correctly open previous page', () => {
    const openPage = jest.fn()
    const pageIndex = 1

    render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination
          sourcePath={ApiEndpoints.GUIDES_PATH}
          items={paginationItems}
          activePageKey="1"
        />
      </EnablementAreaProvider>
    )
    fireEvent.click(screen.getByTestId('enablement-area__prev-page-btn'))

    expect(openPage).toBeCalledWith({
      path: ApiEndpoints.GUIDES_PATH + paginationItems[pageIndex - 1]?.args?.path,
      manifestPath: expect.any(String)
    })
  })
  it('should correctly open by using pagination popover', async () => {
    const openPage = jest.fn()
    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination
          sourcePath={ApiEndpoints.GUIDES_PATH}
          items={paginationItems}
          activePageKey="0"
        />
      </EnablementAreaProvider>
    )

    fireEvent.click(screen.getByTestId('enablement-area__pagination-popover-btn'))
    const popover = queryByTestId('enablement-area__pagination-popover')
    await act(() => {
      popover?.querySelectorAll('.pagesItem').forEach(async (el) => {
        fireEvent.click(el)
      })
    })

    expect(openPage).toBeCalledTimes(paginationItems.length - 1) // -1 because active item should not be clickable
    expect(openPage)
      .lastCalledWith({
        path: ApiEndpoints.GUIDES_PATH + paginationItems[paginationItems.length - 1]?.args?.path,
        manifestPath: expect.any(String)
      })
  })
})
