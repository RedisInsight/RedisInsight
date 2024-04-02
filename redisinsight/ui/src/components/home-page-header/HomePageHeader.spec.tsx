import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import HomePageHeader, { Props } from './HomePageHeader'

const mockedProps = mock<Props>()

const mockComponent = <div />

describe('FullScreen', () => {
  it('should render', () => {
    expect(render(<HomePageHeader {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render addBtn', () => {
    render(<HomePageHeader {...instance(mockedProps)} addBtn={mockComponent} />)

    expect(screen.queryByTestId('addBtn-wrapper')).toBeInTheDocument()
  })

  it('should not render addBtn', () => {
    render(<HomePageHeader {...instance(mockedProps)} addBtn={undefined} />)

    expect(screen.queryByTestId('addBtn-wrapper')).not.toBeInTheDocument()
  })

  it('should render importBtn', () => {
    render(<HomePageHeader {...instance(mockedProps)} importBtn={mockComponent} />)

    expect(screen.queryByTestId('importBtn-wrapper')).toBeInTheDocument()
  })

  it('should not render importBtn', () => {
    render(<HomePageHeader {...instance(mockedProps)} importBtn={undefined} />)

    expect(screen.queryByTestId('importBtn-wrapper')).not.toBeInTheDocument()
  })

  it('should render promoComponent', () => {
    render(<HomePageHeader {...instance(mockedProps)} promoComponent={mockComponent} />)

    expect(screen.queryByTestId('promoComponent-wrapper')).toBeInTheDocument()
  })

  it('should not render promoComponent', () => {
    render(<HomePageHeader {...instance(mockedProps)} promoComponent={undefined} />)

    expect(screen.queryByTestId('promoComponent-wrapper')).not.toBeInTheDocument()
  })

  it('should render searchComponent', () => {
    render(<HomePageHeader {...instance(mockedProps)} searchComponent={mockComponent} />)

    expect(screen.queryByTestId('searchComponent-wrapper')).toBeInTheDocument()
  })

  it('should not render searchComponent', () => {
    render(<HomePageHeader {...instance(mockedProps)} searchComponent={undefined} />)

    expect(screen.queryByTestId('searchComponent-wrapper')).not.toBeInTheDocument()
  })
})
