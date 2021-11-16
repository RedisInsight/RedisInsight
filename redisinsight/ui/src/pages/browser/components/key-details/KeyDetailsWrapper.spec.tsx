import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { refreshHashFieldsAction } from 'uiSrc/slices/hash'
import { refreshZsetMembersAction } from 'uiSrc/slices/zset'
import { refreshSetMembersAction } from 'uiSrc/slices/set'
import { refreshListElementsAction } from 'uiSrc/slices/list'
import { resetStringValue } from 'uiSrc/slices/string'
import {
  deleteKeyAction,
  editKey,
  editKeyTTL,
  fetchKeyInfo,
  refreshKeyInfoAction,
  selectedKeySelector
} from 'uiSrc/slices/keys'
import KeyDetails, { Props as KeyDetailsProps } from './KeyDetails/KeyDetails'
import KeyDetailsWrapper, { Props } from './KeyDetailsWrapper'

const mockedProps = mock<Props>()
const key = 'key'

interface ExtendedKeyDetailsProps extends KeyDetailsProps {
  keyType: string
}

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

jest.mock('uiSrc/slices/hash')
jest.mock('uiSrc/slices/zset')
jest.mock('uiSrc/slices/string')
jest.mock('uiSrc/slices/set')
jest.mock('uiSrc/slices/list')
jest.mock('uiSrc/slices/keys')

describe('KeyDetailsWrapper', () => {
  beforeAll(() => {
    KeyDetails.mockImplementation(MockKeyDetails)
  })
  beforeEach(() => {
    refreshHashFieldsAction.mockImplementation(() => jest.fn)
    refreshZsetMembersAction.mockImplementation(() => jest.fn)
    resetStringValue.mockImplementation(() => jest.fn)
    refreshSetMembersAction.mockImplementation(() => jest.fn)
    refreshListElementsAction.mockImplementation(() => jest.fn)
    deleteKeyAction.mockImplementation(() => jest.fn)
    editKey.mockImplementation(() => jest.fn)
    editKeyTTL.mockImplementation(() => jest.fn)
    fetchKeyInfo.mockImplementation(() => jest.fn)
    refreshKeyInfoAction.mockImplementation(() => jest.fn)
    selectedKeySelector.mockReturnValue('keyName')
  })
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
      const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
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
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
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
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} onCloseKey={onClose} />)
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
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
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
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
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
