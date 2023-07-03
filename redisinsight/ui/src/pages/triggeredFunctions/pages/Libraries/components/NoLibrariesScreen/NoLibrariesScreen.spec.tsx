import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'

import NoLibrariesScreen, { IProps } from './NoLibrariesScreen'

const mockedProps = mock<IProps>()

describe('NoLibrariesScreen', () => {
  it('should render', () => {
    expect(render(<NoLibrariesScreen {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call onAddLibrary', () => {
    const onAddLibrary = jest.fn()

    render(<NoLibrariesScreen onAddLibrary={onAddLibrary} />)

    fireEvent.click(screen.getByTestId('add-library-no-libraries-btn'))

    expect(onAddLibrary).toHaveBeenCalled()
  })
})
