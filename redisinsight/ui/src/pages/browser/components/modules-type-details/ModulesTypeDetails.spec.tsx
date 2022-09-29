import React from 'react'
import { ModulesKeyTypes, MODULES_KEY_TYPES_NAMES } from 'uiSrc/constants'
import { render } from 'uiSrc/utils/test-utils'

import ModulesTypeDetails from './ModulesTypeDetails'

/**
 * ModulesTypeDetails tests
 *
 * @group unit
 */
describe('ModulesTypeDetails', () => {
  it('should render', () => {
    expect(render(<ModulesTypeDetails moduleName={MODULES_KEY_TYPES_NAMES[ModulesKeyTypes.Graph]} />)).toBeTruthy()
  })
})
