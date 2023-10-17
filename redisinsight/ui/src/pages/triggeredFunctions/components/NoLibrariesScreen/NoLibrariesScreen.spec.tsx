import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { cleanup, clearStoreActions, render, fireEvent, screen, mockedStore } from 'uiSrc/utils/test-utils'

import NoLibrariesScreen, { IProps } from './NoLibrariesScreen'

const mockedProps = mock<IProps>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/workbench/wb-guides', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-guides'),
  workbenchGuidesSelector: jest.fn().mockReturnValue({
    items: [{
      label: 'Quick guides',
      type: 'group',
      children: [
        {
          label: 'Quick guides',
          type: 'group',
          children: [
            {
              type: 'internal-link',
              id: 'document-capabilities',
              label: 'Triggers and Functions',
              args: {
                path: '/quick-guides/triggers-and-functions/introduction.md',
              },
            },
          ]
        }
      ]
    }],
  }),
}))

describe('NoLibrariesScreen', () => {
  it('should render', () => {
    expect(render(<NoLibrariesScreen {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call proper actions and push to quick guides page ', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<NoLibrariesScreen {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('no-libraries-tutorial-link'))

    const expectedActions = []
    expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions))
    expect(pushMock).toBeCalledWith('/instanceId/workbench?guidePath=/quick-guides/triggers-and-functions/introduction.md')
  })

  it('should have proper text when module is loaded', () => {
    render(<NoLibrariesScreen {...instance(mockedProps)} isModuleLoaded />)

    expect(screen.getByTestId('no-libraries-title')).toHaveTextContent('Triggers and functions')
    expect(screen.getByTestId('no-libraries-action-text')).toHaveTextContent('Upload a new library to start working with triggers and functions or try the interactive tutorial to learn more.')
  })

  it('should have proper text when module is not loaded', () => {
    render(<NoLibrariesScreen {...instance(mockedProps)} />)

    expect(screen.getByTestId('no-libraries-title')).toHaveTextContent('triggers and functions are not available for this database')
    expect(screen.getByTestId('no-libraries-action-text')).toHaveTextContent('Create a free Redis Stack database which extends the core capabilities of open-source Redis and try the interactive tutorial to learn how to work with triggers and functions.')
  })
})
