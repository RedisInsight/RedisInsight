import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import userEvent from '@testing-library/user-event'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import * as keysSlice from 'uiSrc/slices/browser/keys'
import { Props, KeyDetailsHeaderSizeLength } from './KeyDetailsHeaderSizeLength'

let store: typeof mockedStore

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn()
}))

describe('KeyDetailsHeaderSizeLength', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render normal size correctly', () => {
    (keysSlice.selectedKeyDataSelector as jest.Mock).mockReturnValueOnce({
      type: 'string',
      size: 1024,
      length: 1
    })

    render(<KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />)

    expect(screen.getByTestId('key-size-text')).toBeInTheDocument()
    expect(screen.queryByTestId('key-size-info-icon')).not.toBeInTheDocument()
  })

  it('should render too large size with warning icon and expected tooltip', async () => {
    (keysSlice.selectedKeyDataSelector as jest.Mock).mockReturnValueOnce({
      type: 'string',
      size: -1,
      length: 1
    })

    render(<KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />)

    expect(screen.getByTestId('key-size-info-icon')).toBeInTheDocument()

    const infoIcon = screen.getByTestId('key-size-info-icon')
    userEvent.hover(infoIcon)

    const tooltipText = await screen.findByText('The key size is too large to run the MEMORY USAGE command, as it may lead to performance issues.')
    expect(tooltipText).toBeInTheDocument()
  })
})
