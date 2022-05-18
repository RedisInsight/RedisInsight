import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'
import KeyDetails, { Props } from './KeyDetails'

const mockedProps = mock<Props>()

describe('KeyDetails', () => {
  it('should render', () => {
    expect(render(
      <StreamRangeStartContext.Provider value={{ startVal: undefined, setStartVal: () => {} }}>
        <StreamRangeEndContext.Provider value={{ endVal: undefined, setEndVal: () => {} }}>
          <KeyDetails {...instance(mockedProps)} />
        </StreamRangeEndContext.Provider>
      </StreamRangeStartContext.Provider>
    )).toBeTruthy()
  })
})
