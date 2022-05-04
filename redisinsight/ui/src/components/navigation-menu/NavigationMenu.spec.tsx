import { cloneDeep } from 'lodash'
import React from 'react'
import { BuildType } from 'uiSrc/constants/env'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import NavigationMenu from './NavigationMenu'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NavigationMenu', () => {
  describe('without connectedInstance', () => {
    it('should render', () => {
      expect(render(<NavigationMenu buildType={BuildType.DockerOnPremise} />)).toBeTruthy()
    })

    it('shouldn\'t render private routes', () => {
      render(<NavigationMenu buildType={BuildType.DockerOnPremise} />)

      expect(screen.queryByTestId('browser-page-btn"')).not.toBeInTheDocument()
      expect(screen.queryByTestId('workbench-page-btn')).not.toBeInTheDocument()
    })

    it('should render help menu', () => {
      render(<NavigationMenu buildType={BuildType.RedisStack} />)

      expect(screen.getByTestId('help-menu-button')).toBeTruthy()
    })

    it('should render help menu items with proper links', () => {
      render(<NavigationMenu buildType={BuildType.RedisStack} />)

      fireEvent.click(screen.getByTestId('help-menu-button'))

      const submitBugBtn = screen.getByTestId('submit-bug-btn')
      expect(submitBugBtn).toBeInTheDocument()
      expect(submitBugBtn?.getAttribute('href')).toEqual(EXTERNAL_LINKS.githubIssues)

      expect(screen.getByTestId('shortcuts-btn')).toBeInTheDocument()

      const releaseNotesBtn = screen.getByTestId('release-notes-btn')
      expect(releaseNotesBtn).toBeInTheDocument()
      expect(releaseNotesBtn?.getAttribute('href')).toEqual(EXTERNAL_LINKS.releaseNotes)
    })
  })

  describe('with connectedInstance', () => {
    beforeAll(() => {
      jest.mock('uiSrc/slices/instances/instances', () => ({
        ...jest.requireActual('uiSrc/slices/instances/instances'),
        connectedInstanceSelector: jest.fn().mockReturnValue({
          id: '123',
          connectionType: 'STANDALONE',
          db: 0,
        })
      }))
    })

    it('should render', () => {
      expect(render(<NavigationMenu buildType={BuildType.DockerOnPremise} />)).toBeTruthy()
    })

    it('should render private routes with instanceId', () => {
      render(<NavigationMenu buildType={BuildType.DockerOnPremise} />)

      expect(screen.findByTestId('browser-page-btn')).toBeTruthy()
      expect(screen.findByTestId('workbench-page-btn')).toBeTruthy()
    })

    it('should render public routes', () => {
      render(<NavigationMenu buildType={BuildType.DockerOnPremise} />)

      expect(screen.getByTestId('settings-page-btn')).toBeTruthy()
    })

    it('should render github btn with proper link', () => {
      const { container } = render(<NavigationMenu buildType={BuildType.Electron} />)

      const githubBtn = container.querySelector('[data-test-subj="github-repo-btn"]')
      expect(githubBtn).toBeTruthy()
      expect(githubBtn?.getAttribute('href')).toEqual(EXTERNAL_LINKS.githubRepo)
    })
  })
})
