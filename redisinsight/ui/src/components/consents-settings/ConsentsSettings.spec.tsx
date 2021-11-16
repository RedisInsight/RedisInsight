import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
  clearStoreActions,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { updateUserConfigSettings } from 'uiSrc/slices/user/user-settings'
import ConsentsSettings from './ConsentsSettings'

const BTN_SUBMIT = 'btn-submit'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})
const COMMON_CONSENT_CONTENT = {
  defaultValue: false,
  required: false,
  editable: true,
  disabled: false,
  displayInSetting: true,
  since: '1.0.0',
  title: 'Title',
  label: '<a>Text</a>',
}

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsSelector: jest.fn().mockReturnValue({
    isShowConceptsPopup: true,
    config: {
      agreements: {
        eula: true,
        version: '1.0.1',
      },
    },
    spec: {
      version: '1.0.0',
      agreements: {
        eula: {
          ...COMMON_CONSENT_CONTENT,
          editable: false,
          displayInSetting: false,
          required: true,
        },
        eulaNew: {
          ...COMMON_CONSENT_CONTENT,
          editable: false,
          displayInSetting: false,
          required: true,
        },
        analytics: {
          ...COMMON_CONSENT_CONTENT,
        },
        disabledConsent: {
          ...COMMON_CONSENT_CONTENT,
          disabled: true,
        },
      },
    },
  }),
}))

describe('ConsentsSettings', () => {
  it('should render', () => {
    expect(render(<ConsentsSettings />)).toBeTruthy()
  })

  it('should render proper elements', () => {
    render(<ConsentsSettings />)
    expect(screen.getAllByTestId(/switch-option/)).toHaveLength(3)
  })

  it('should be disabled submit button with required options with false value', () => {
    render(<ConsentsSettings />)
    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()
  })

  it('should be able to submit with required options with true value', () => {
    render(<ConsentsSettings />)
    screen.getAllByTestId(/switch-option/).forEach((el) => {
      fireEvent.click(el)
    })
    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()
  })

  describe('liveEditMode', () => {
    it('btn submit should not render', () => {
      const { queryByTestId } = render(<ConsentsSettings liveEditMode />)
      expect(queryByTestId(BTN_SUBMIT)).not.toBeInTheDocument()
    })

    it('option change should call "updateUserConfigSettingsAction"', async () => {
      const { queryByTestId } = render(<ConsentsSettings liveEditMode />)

      await waitFor(() => {
        screen.getAllByTestId(/switch-option/).forEach(async (el) => {
          fireEvent.click(el)
        })
      })

      const expectedActions = [{}].fill(updateUserConfigSettings(), 0)
      expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
        clearStoreActions(expectedActions)
      )

      expect(queryByTestId(BTN_SUBMIT)).not.toBeInTheDocument()
    })
  })
})
