import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'
import StreamDetailsWrapper, { Props } from './StreamDetailsWrapper'

const mockedProps = mock<Props>()

describe('StreamDetailsWrapper', () => {
  it('should render', () => {
    expect(render(
      <StreamRangeStartContext.Provider value={{ startVal: undefined, setStartVal: () => {} }}>
        <StreamRangeEndContext.Provider value={{ endVal: undefined, setEndVal: () => {} }}>
          <StreamDetailsWrapper {...instance(mockedProps)} />
        </StreamRangeEndContext.Provider>
      </StreamRangeStartContext.Provider>
    )).toBeTruthy()
  })
})
