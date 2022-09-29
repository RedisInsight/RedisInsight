import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import ZSetDetails, { Props } from './ZSetDetails'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/zset', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/zset').initialState
  return ({
    zsetSelector: jest.fn().mockReturnValue(defaultState),
    setZsetInitialState: jest.fn,
    zsetDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: 'z',
      keyName: 'z',
      members: [
        { name: { type: 'Buffer', data: [49] }, score: 1 },
        { name: { type: 'Buffer', data: [50] }, score: 2 },
        { name: { type: 'Buffer', data: [51] }, score: 3 },
      ],
    }),
    updateZsetScoreStateSelector: jest.fn().mockReturnValue(defaultState.updateScore),
    fetchSearchZSetMembers: () => jest.fn()
  })
})

/**
 * ZSetDetails tests
 *
 * @group unit
 */
describe('ZSetDetails', () => {
  it('should render', () => {
    expect(render(<ZSetDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render search input', () => {
    render(<ZSetDetails {...instance(mockedProps)} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeTruthy()
  })

  it('should call search', () => {
    render(<ZSetDetails {...instance(mockedProps)} />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(
      searchInput,
      { target: { value: '*' } }
    )
    expect(searchInput).toHaveValue('*')
  })

  it('should render delete popup after click remove button', () => {
    render(<ZSetDetails {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/zset-edit-button/)[0])
    expect(screen.getByTestId(/zset-edit-button-1/)).toBeInTheDocument()
  })

  it('should render editor after click edit button and able to change value', () => {
    render(<ZSetDetails {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/zset-edit-button/)[0])
    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('inline-item-editor'), { target: { value: '123' } })
    expect(screen.getByTestId('inline-item-editor')).toHaveValue('123')
  })
})
