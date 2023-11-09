import React from 'react'
import { mock } from 'ts-mockito'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import DatabaseAlias, { Props } from './DatabaseAlias'

const mockedProps = mock<Props>()

const mockAppInfoSelector = jest.requireActual('uiSrc/slices/app/info')

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {}
  })
}))

describe('DatabaseAlias', () => {
  it('should render', () => {
    expect(render(<DatabaseAlias {...mockedProps} />)).toBeTruthy()
  })

  it('should call onApplyChanges on edit alias', () => {
    const onApply = jest.fn()
    render(<DatabaseAlias {...mockedProps} onApplyChanges={onApply} />)

    fireEvent.click(screen.getByTestId('edit-alias-btn'))
    fireEvent.change(screen.getByTestId('alias-input'), { target: { value: 'alias' } })
    fireEvent.submit(screen.getByTestId('alias-input'))

    expect(onApply).toHaveBeenCalledWith('alias', expect.anything(), expect.anything())
  })

  it('should call onOpen', () => {
    const onOpen = jest.fn()
    render(<DatabaseAlias {...mockedProps} onOpen={onOpen} />)

    fireEvent.click(screen.getByTestId('connect-to-db-btn'))
    expect(onOpen).toHaveBeenCalled()
  })

  it('should not render part of content in edit mode', () => {
    render(<DatabaseAlias {...mockedProps} isCloneMode={false} alias="alias" />)

    expect(screen.queryByTestId('back-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('db-alias')).toHaveTextContent('alias')
  })

  it('should call onCloneBack in clone mode', () => {
    const onCloneBack = jest.fn()
    render(<DatabaseAlias {...mockedProps} onCloneBack={onCloneBack} isCloneMode />)

    fireEvent.click(screen.getByTestId('back-btn'))
    expect(onCloneBack).toHaveBeenCalled()
  })

  it('should render icon for redis-stack', () => {
    render(<DatabaseAlias {...mockedProps} isRediStack />)

    expect(screen.queryByTestId('redis-stack-icon')).toBeInTheDocument()
  })

  it('should not render clone button with buildType=REDIS_STACK', () => {
    (appInfoSelector as jest.Mock).mockImplementation(() => ({
      ...mockAppInfoSelector,
      server: {
        buildType: BuildType.RedisStack
      }
    }))

    render(<DatabaseAlias {...mockedProps} />)

    expect(screen.queryByTestId('clone-db-btn')).not.toBeInTheDocument()
  })
})
