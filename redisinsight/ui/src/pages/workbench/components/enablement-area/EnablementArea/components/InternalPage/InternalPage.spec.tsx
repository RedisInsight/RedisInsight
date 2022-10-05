import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import InternalPage, { Props } from './InternalPage'

const mockedProps = mock<Props>()

/**
 * InternalPage tests
 *
 * @group component
 */
describe('InternalPage', () => {
  it('should render', () => {
    expect(render(<InternalPage {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should display loader', () => {
    const { queryByTestId } = render(<InternalPage {...instance(mockedProps)} isLoading />)

    expect(queryByTestId('enablement-area__page-loader')).toBeTruthy()
  })
  it('should display empty prompt on error', () => {
    const { queryByTestId } = render(<InternalPage {...instance(mockedProps)} error="Some error" />)

    expect(queryByTestId('enablement-area__empty-prompt')).toBeTruthy()
  })
  it('should call onClose function in click BackButton empty prompt on error', () => {
    const onClose = jest.fn()
    const { queryByTestId } = render(<InternalPage {...instance(mockedProps)} onClose={onClose} />)

    const button = queryByTestId(/enablement-area__page-close/)
    fireEvent.click(button as Element)

    expect(onClose).toBeCalled()
  })
  it('should parse and render JSX string', () => {
    const content = '<h1 data-testid="header">Header</h1>'
    const { queryByTestId } = render(<InternalPage {...instance(mockedProps)} content={content} />)

    expect(queryByTestId('header')).toBeInTheDocument()
  })
})
