import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'

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

// jest.mock('uiSrc/slices/browser/hash')
// jest.mock('uiSrc/slices/browser/zset')
// jest.mock('uiSrc/slices/browser/string')
// jest.mock('uiSrc/slices/browser/set')
// jest.mock('uiSrc/slices/browser/list')
// jest.mock('uiSrc/slices/browser/keys')

/**
 * KeyDetailsWrapper tests
 *
 * @group unit
 */
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

  /**
 * should call onRefresh tests
 *
 * @group unit
 */
  describe('should call onRefresh', () => {
    test.each(Object.values(KeyTypes))('should call onRefresh', (keyType) => {
      KeyDetails.mockImplementationOnce((props: KeyDetailsProps) => (
        <MockKeyDetails
          {...props}
          keyType={keyType}
        />
      ))
      const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
      fireEvent.click(screen.getByTestId('refresh-btn'))
      expect(component).toBeTruthy()
    })
  })

  it('should call onDelete', () => {
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('delete-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} onCloseKey={onClose} />)
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(component).toBeTruthy()
    expect(onClose).toBeCalled()
  })

  it('should call onEditKey', () => {
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('edit-key-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onEditTtl', () => {
    const component = render(<KeyDetailsWrapper {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('edit-ttl-btn'))
    expect(component).toBeTruthy()
  })
})
