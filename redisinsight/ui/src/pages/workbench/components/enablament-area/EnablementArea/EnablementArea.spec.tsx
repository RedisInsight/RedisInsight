import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { MOCK_ENABLEMENT_AREA_ITEMS } from 'uiSrc/constants'
import { EnablementAreaComponent } from 'uiSrc/slices/interfaces'

import EnablementArea, { Props } from './EnablementArea'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/workbench/wb-enablement-area', () => {
  const defaultState = jest.requireActual('uiSrc/slices/workbench/wb-enablement-area').initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-enablement-area'),
    workbenchEnablementAreaSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('EnablementArea', () => {
  it('should render', () => {
    expect(render(<EnablementArea {...instance(mockedProps)} items={MOCK_ENABLEMENT_AREA_ITEMS} />))
      .toBeTruthy()
  })

  it('should render loading', () => {
    const { queryByTestId } = render(<EnablementArea {...instance(mockedProps)} loading />)
    const loaderEl = queryByTestId('enablementArea-loader')
    const treeViewEl = queryByTestId('enablementArea-treeView')

    expect(loaderEl).toBeInTheDocument()
    expect(treeViewEl).not.toBeInTheDocument()
  })

  it('should correctly render tree view on first level', () => {
    const { queryByTestId } = render(
      <EnablementArea
        {...instance(mockedProps)}
        items={MOCK_ENABLEMENT_AREA_ITEMS}
      />
    )
    const loaderEl = queryByTestId('enablementArea-loader')
    const treeViewEl = queryByTestId('enablementArea-treeView')

    expect(loaderEl).not.toBeInTheDocument()
    expect(treeViewEl).toBeInTheDocument()
    expect(treeViewEl?.childNodes.length).toEqual(Object.values(MOCK_ENABLEMENT_AREA_ITEMS).length)
  })
  it('should render Group component', () => {
    const item = {
      type: EnablementAreaComponent.Group,
      id: 'quick-guides',
      label: 'Quick Guides',
      children: [
        {
          type: EnablementAreaComponent.InternalLink,
          id: 'document-capabilities',
          label: 'Document Capabilities',
          args: {
            path: 'static/workbench/quick-guides/document-capabilities.html'
          },
        }
      ]
    }

    const { queryByTestId } = render(
      <EnablementArea
        {...instance(mockedProps)}
        items={{ 'quick-guides': item }}
      />
    )

    expect(
      queryByTestId('accordion-quick-guides')
    ).toBeInTheDocument()
  })
  it('should render CodeButton component', () => {
    const item = {
      type: EnablementAreaComponent.CodeButton,
      id: 'manual',
      label: 'Manual',
      args: {
        path: 'static/workbench/_scripts/manual.txt'
      },
    }
    const { queryByTestId } = render(
      <EnablementArea
        {...instance(mockedProps)}
        items={{ manual: item }}
      />
    )
    const codeButtonEl = queryByTestId(`preselect-${item.label}`)

    expect(codeButtonEl).toBeInTheDocument()
  })
  it('should render InternalLink component', () => {
    const item = {
      type: EnablementAreaComponent.InternalLink,
      id: 'internal-page',
      label: 'Internal Page',
      args: {
        path: 'static/workbench/quick-guides/document-capabilities.html',
      }
    }
    const { queryByTestId } = render(
      <EnablementArea
        {...instance(mockedProps)}
        items={{ 'internal-page': item }}
      />
    )

    expect(queryByTestId('internal-link-internal-page')).toBeInTheDocument()
  })
})
