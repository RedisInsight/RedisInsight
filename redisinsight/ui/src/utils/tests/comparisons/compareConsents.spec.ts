import { compareConsents, isDifferentConsentsExists } from 'uiSrc/utils'
import { defaultConfig } from 'uiSrc/config/default'

const spec = {
  agreements: {
    eula: {
      defaultValue: false,
      required: true,
      editable: false,
      since: '1.0.2',
      title: 'EULA: Redis Insight License Terms',
      label: 'Label',
    },
  },
}

describe('compareConsents', () => {
  it('compareConsents should return array of difference of consents', () => {
    const agreements1 = {
      eula: true,
      version: '1.0.2',
    }

    const agreements2 = {
      eula: true,
      eulaNew: false,
      version: '1.0.2',
    }

    const agreements3 = {
      eula: false,
      version: '1.0.0',
    }

    expect(compareConsents(spec.agreements, agreements1)).toHaveLength(0)
    expect(compareConsents(spec.agreements, agreements2)).toHaveLength(0)
    expect(compareConsents(spec.agreements, agreements3)).toHaveLength(1)
  })
})

describe('isDifferentConsentsExists', () => {
  it('isDifferentConsentsExists should return true if some difference in consents', () => {
    const agreements1 = {
      eula: true,
      version: '1.0.2',
    }

    const agreements2 = {
      eula: true,
      eulaNew: false,
      version: '1.0.2',
    }

    const agreements3 = {
      eula: false,
      version: '1.0.0',
    }

    expect(isDifferentConsentsExists(spec.agreements, agreements1)).toBeFalsy()
    expect(isDifferentConsentsExists(spec.agreements, agreements2)).toBeFalsy()
    expect(isDifferentConsentsExists(spec.agreements, agreements3)).toBeTruthy()
  })

  it('should return false when defaultConfig.app.acceptTermsAndConditions is true', () => {
    const originalAcceptTerms = defaultConfig.app.acceptTermsAndConditions
    defaultConfig.app.acceptTermsAndConditions = true
    const agreements = {
      eula: false,
      version: '1.0.0',
    }

    expect(isDifferentConsentsExists(spec.agreements, agreements)).toBeFalsy()

    defaultConfig.app.acceptTermsAndConditions = originalAcceptTerms
  })
})
