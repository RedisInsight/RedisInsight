import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import reactRouterDom from 'react-router-dom'
import { cleanup, mockedStore, render, screen, fireEvent, act, waitFor } from 'uiSrc/utils/test-utils'
import { MOCK_GUIDES_ITEMS, MOCK_TUTORIALS_ITEMS, MOCK_CUSTOM_TUTORIALS_ITEMS } from 'uiSrc/constants'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'

import { deleteWbCustomTutorial, uploadWbCustomTutorial } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import EnablementArea, { Props } from './EnablementArea'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/workbench/wb-guides', () => {
  const defaultState = jest.requireActual('uiSrc/slices/workbench/wb-guides').initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-guides'),
    workbenchGuidesSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('EnablementArea', () => {
  beforeEach(() => {
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: jest.fn() })
    reactRouterDom.useLocation = jest.fn().mockImplementation(() => ({ search: '' }))
  })
  it('should render', () => {
    expect(render(<EnablementArea
      {...instance(mockedProps)}
      guides={MOCK_GUIDES_ITEMS}
      tutorials={MOCK_TUTORIALS_ITEMS}
    />))
      .toBeTruthy()
  })

  it('should render loading', () => {
    const { queryByTestId } = render(<EnablementArea {...instance(mockedProps)} loading />)
    const loaderEl = queryByTestId('enablementArea-loader')
    const treeViewEl = queryByTestId('enablementArea-treeView')

    expect(loaderEl).toBeInTheDocument()
    expect(treeViewEl).not.toBeInTheDocument()
  })

  it('should render Group component', () => {
    const item: IEnablementAreaItem = {
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
        guides={[item]}
      />
    )

    expect(
      queryByTestId('accordion-quick-guides')
    ).toBeInTheDocument()
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
        guides={[item]}
      />
    )

    expect(queryByTestId('internal-link-internal-page')).toBeInTheDocument()
  })

  it('should find guide and push proper search path', async () => {
    const search = '?guidePath=/quick-guides/working-with-json.html'

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockImplementationOnce(() => ({ search }))

    await act(() => {
      render(<EnablementArea {...instance(mockedProps)} guides={MOCK_GUIDES_ITEMS} onOpenInternalPage={jest.fn} />)
    })

    await waitFor(() => {
      expect(pushMock).toBeCalledWith({ search: '?path=quick-guides/0/1' })
    }, { timeout: 1000 })
  })

  describe('Custom Tutorials', () => {
    it('should render custom tutorials', () => {
      render(<EnablementArea {...instance(mockedProps)} customTutorials={MOCK_CUSTOM_TUTORIALS_ITEMS} />)
      expect(screen.getByTestId('enablementArea')).toHaveTextContent('MY TUTORIALS')
    })

    it('should render add button and open form', () => {
      render(<EnablementArea {...instance(mockedProps)} customTutorials={MOCK_CUSTOM_TUTORIALS_ITEMS} />)
      fireEvent.click(screen.getByTestId('open-upload-tutorial-btn'))
      expect(screen.getByTestId('upload-tutorial-form')).toBeInTheDocument()
    })

    it('should render welcome screen and open form', () => {
      const customTutorials = [{ ...MOCK_CUSTOM_TUTORIALS_ITEMS[0], children: [] }]
      render(<EnablementArea {...instance(mockedProps)} customTutorials={customTutorials} />)
      expect(screen.getByTestId('welcome-my-tutorials')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('upload-tutorial-btn'))
      expect(screen.getByTestId('upload-tutorial-form')).toBeInTheDocument()
    })

    it('should call proper actions after upload form submit', async () => {
      render(<EnablementArea {...instance(mockedProps)} customTutorials={MOCK_CUSTOM_TUTORIALS_ITEMS} />)
      fireEvent.click(screen.getByTestId('open-upload-tutorial-btn'))

      await act(() => {
        fireEvent.change(
          screen.getByTestId('tutorial-link-field'),
          { target: { value: 'link' } }
        )
      })

      await act(() => {
        fireEvent.click(screen.getByTestId('submit-upload-tutorial-btn'))
      })

      const expectedActions = [uploadWbCustomTutorial()]
      expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    })

    it('should render delete button and call proper actions after click on delete', () => {
      render(<EnablementArea {...instance(mockedProps)} customTutorials={MOCK_CUSTOM_TUTORIALS_ITEMS} />)
      fireEvent.click(screen.getByTestId('delete-tutorial-icon-12mfp-rem'))
      fireEvent.click(screen.getByTestId('delete-tutorial-12mfp-rem'))

      const expectedActions = [deleteWbCustomTutorial()]
      expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    })
  })
})
