import React from 'react'
import { DurationUnits } from 'uiSrc/constants'
import { render } from 'uiSrc/utils/test-utils'

import EmptySlowLog from './EmptySlowLog'

describe('EmptySlowLog', () => {
  it('should render', () => {
    expect(render(
      <EmptySlowLog durationUnit={DurationUnits.milliSeconds} slowlogLogSlowerThan={100} />
    )).toBeTruthy()
  })
})
