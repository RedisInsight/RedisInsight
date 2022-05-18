import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'
import StreamDetails, { Props } from './StreamDetails'

const mockedProps = mock<Props>()

describe('StreamDetails', () => {
  it('should render', () => {
    expect(render(
      <StreamRangeStartContext.Provider value={{ startVal: undefined, setStartVal: () => {} }}>
        <StreamRangeEndContext.Provider value={{ endVal: undefined, setEndVal: () => {} }}>
          <StreamDetails {...instance(mockedProps)} />
        </StreamRangeEndContext.Provider>
      </StreamRangeStartContext.Provider>
    )).toBeTruthy()
  })
})
