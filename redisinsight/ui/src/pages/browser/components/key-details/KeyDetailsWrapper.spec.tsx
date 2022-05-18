import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'

import KeyDetails, { Props as KeyDetailsProps } from './KeyDetails/KeyDetails'
import KeyDetailsWrapper, { Props } from './KeyDetailsWrapper'

const mockedProps = mock<Props>()
const key = 'key'

interface ExtendedKeyDetailsProps extends KeyDetailsProps {
  keyType: string
}

const MockKeyDetailsWrapper = (props: any) => (
  <StreamRangeStartContext.Provider value={{ startVal: undefined, setStartVal: () => {} }}>
    <StreamRangeEndContext.Provider value={{ endVal: undefined, setEndVal: () => {} }}>
      <KeyDetailsWrapper {...instance(mockedProps)} {...props} />
    </StreamRangeEndContext.Provider>
  </StreamRangeStartContext.Provider>
)

const MockKeyDetails = (props: ExtendedKeyDetailsProps) => (
  <div>
    <button
      type="button"
      onClick={() => props.onRefresh(key, props.keyType as KeyTypes)}
      data-testid="refresh-btn"
    >
      Refresh
    </button>
    <button type="button" onClick={() => props.onClose(key)} data-testid="close-btn">Close</button>
    <button type="button" onClick={() => props.onDelete(key)} data-testid="delete-btn">Delete</button>
    <button
      type="button"
      onClick={() => props.onEditKey(key, 'newKey')}
      data-testid="edit-key-btn"
    >
      EditKey
    </button>
    <button
      type="button"
      onClick={() => props.onEditTTL(key, 111)}
      data-testid="edit-ttl-btn"
    >
      EditTTL
    </button>
  </div>
)

jest.mock('./KeyDetails/KeyDetails', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

// jest.mock('uiSrc/slices/browser/hash')
// jest.mock('uiSrc/slices/browser/zset')
// jest.mock('uiSrc/slices/browser/string')
// jest.mock('uiSrc/slices/browser/set')
// jest.mock('uiSrc/slices/browser/list')
// jest.mock('uiSrc/slices/browser/keys')

describe('KeyDetailsWrapper', () => {
  beforeAll(() => {
    KeyDetails.mockImplementation(MockKeyDetails)
  })
  // beforeEach(() => {
  //   refreshHashFieldsAction.mockImplementation(() => jest.fn)
  //   refreshZsetMembersAction.mockImplementation(() => jest.fn)
  //   resetStringValue.mockImplementation(() => jest.fn)
  //   refreshSetMembersAction.mockImplementation(() => jest.fn)
  //   refreshListElementsAction.mockImplementation(() => jest.fn)
  //   deleteKeyAction.mockImplementation(() => jest.fn)
  //   editKey.mockImplementation(() => jest.fn)
  //   editKeyTTL.mockImplementation(() => jest.fn)
  //   fetchKeyInfo.mockImplementation(() => jest.fn)
  //   refreshKeyInfoAction.mockImplementation(() => jest.fn)
  //   selectedKeySelector.mockReturnValue('keyName')
  // })
  it('should render', () => {
    expect(
      render(<KeyDetailsWrapper {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  describe('should call onRefresh', () => {
    test.each(Object.values(KeyTypes))('should call onRefresh', (keyType) => {
      KeyDetails.mockImplementationOnce((props: KeyDetailsProps) => (
        <MockKeyDetails
          {...props}
          keyType={keyType}
        />
      ))
      const component = render(<MockKeyDetailsWrapper />)
      fireEvent(
        screen.getByTestId('refresh-btn'),
        new MouseEvent(
          'click',
          {
            bubbles: true
          }
        )
      )
      expect(component).toBeTruthy()
    })
  })

  it('should call onDelete', () => {
    const component = render(<MockKeyDetailsWrapper />)
    fireEvent(
      screen.getByTestId('delete-btn'),
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(component).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    const component = render(<MockKeyDetailsWrapper onCloseKey={onClose} />)
    fireEvent(
      screen.getByTestId('close-btn'),
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(component).toBeTruthy()
    expect(onClose).toBeCalled()
  })

  it('should call onEditKey', () => {
    const component = render(<MockKeyDetailsWrapper />)
    fireEvent(
      screen.getByTestId('edit-key-btn'),
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(component).toBeTruthy()
  })

  it('should call onEditTtl', () => {
    const component = render(<MockKeyDetailsWrapper />)
    fireEvent(
      screen.getByTestId('edit-ttl-btn'),
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(component).toBeTruthy()
  })
})
