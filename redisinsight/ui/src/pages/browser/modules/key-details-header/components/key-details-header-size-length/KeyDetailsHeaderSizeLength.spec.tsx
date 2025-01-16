import React from 'react'
import { instance, mock } from 'ts-mockito'
import userEvent from '@testing-library/user-event'
import { render, screen } from 'uiSrc/utils/test-utils'
import { Props, KeyDetailsHeaderSizeLength } from './KeyDetailsHeaderSizeLength'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderSizeLength', () => {
  it('should render normal size correctly', () => {
    const store = {
      getState: () => ({
        browser: {
          keys: {
            selectedKey: {
              data: {
                type: 'string',
                size: 1024,
                length: 1
              }
            }
          }
        }
      }),
      subscribe: jest.fn(),
      dispatch: jest.fn(),
    }

    render(<KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />, { store })

    expect(screen.getByTestId('key-size-text')).toBeInTheDocument()
    expect(screen.queryByTestId('key-size-info-icon')).not.toBeInTheDocument()
  })

  it('should render too large size with warning icon and expected tooltip', async () => {
    const store = {
      getState: () => ({
        browser: {
          keys: {
            selectedKey: {
              data: {
                type: 'string',
                size: -1,
                length: 1
              }
            }
          }
        }
      }),
      subscribe: jest.fn(),
      dispatch: jest.fn(),
    }

    render(<KeyDetailsHeaderSizeLength {...instance(mockedProps)} width={1920} />, { store })

    expect(screen.getByTestId('key-size-info-icon')).toBeInTheDocument()

    const infoIcon = screen.getByTestId('key-size-info-icon')
    userEvent.hover(infoIcon)

    const tooltipText = await screen.findByText('The key size is too large to run the MEMORY USAGE command, as it may lead to performance issues.')
    expect(tooltipText).toBeInTheDocument()
  })
})
