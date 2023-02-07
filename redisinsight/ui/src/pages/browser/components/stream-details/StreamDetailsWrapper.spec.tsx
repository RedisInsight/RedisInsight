import React from 'react'
import { useSelector } from 'react-redux'
import { instance, mock } from 'ts-mockito'
import { initialState } from 'uiSrc/slices/browser/stream'
import store, { RootState } from 'uiSrc/slices/store'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import { render, screen } from 'uiSrc/utils/test-utils'
import { MAX_FORMAT_LENGTH_STREAM_TIMESTAMP } from './constants'
import StreamDetailsWrapper, { Props } from './StreamDetailsWrapper'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

const mockedProps = mock<Props>()

const mockedEntryData = {
  keyName: bufferToString('stream_example'),
  keyNameString: 'stream_example',
  total: 1,
  lastGeneratedId: '1652942518811-0',
  lastRefreshTime: 1231231,
  firstEntry: {
    id: '1652942518810-0',
    fields: [{ value: stringToBuffer('1'), name: stringToBuffer('2') }]
  },
  lastEntry: {
    id: '1652942518811-0',
    fields: [{ value: stringToBuffer('1'), name: stringToBuffer('2') }]
  },
  entries: [{
    id: '1652942518810-0',
    fields: [{ value: stringToBuffer('1'), name: stringToBuffer('2') }]
  },
  {
    id: '1652942518811-0',
    fields: [{ value: stringToBuffer('1'), name: stringToBuffer('2') }]
  }]
}

const mockedRangeData = {
  start: '1675751507404',
  end: '1675751507406',
}

describe('StreamDetailsWrapper', () => {
  beforeEach(() => {
    const state: RootState = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      browser: {
        ...state.browser,
        stream: {
          ...state.browser.stream,
        }
      },
    }))
  })

  it('should render', () => {
    expect(render(<StreamDetailsWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render Stream Data container', () => {
    render(<StreamDetailsWrapper {...instance(mockedProps)} />)

    expect(screen.getByTestId('stream-entries-container')).toBeInTheDocument()
  })

  it('should render Range filter', () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      browser: {
        ...state.browser,
        stream: {
          ...initialState,
          loading: false,
          error: '',
          range: {
            ...mockedRangeData
          },
          data: {
            ...mockedEntryData,
          }
        },
      }
    }))

    render(<StreamDetailsWrapper {...instance(mockedProps)} />)

    expect(screen.getByTestId('range-bar')).toBeInTheDocument()
  })

  it(`should not render Range filter if id more than ${MAX_FORMAT_LENGTH_STREAM_TIMESTAMP}`, () => {
    const entryWithHugeId = {
      id: '3123123123123123123123-123123123',
      fields: [{ value: stringToBuffer('1'), name: stringToBuffer('2') }]
    }

    const mockedEntries = [
      ...mockedEntryData.entries,
      entryWithHugeId
    ]
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      browser: {
        ...state.browser,
        stream: {
          ...initialState,
          loading: false,
          error: '',
          range: {
            ...mockedRangeData
          },
          data: {
            ...mockedEntryData,
            lastEntry: entryWithHugeId,
            entries: mockedEntries,
          }
        },
      }
    }))

    const { queryByTestId } = render(<StreamDetailsWrapper {...instance(mockedProps)} />)

    expect(queryByTestId('range-bar')).not.toBeInTheDocument()
  })
})
