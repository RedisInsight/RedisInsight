import * as reactRedux from 'react-redux'
import { renderHook, act } from '@testing-library/react-hooks'
import { EditorType } from 'uiSrc/slices/interfaces'
import { useChangeEditorType } from './useChangeEditorType'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

const mockedUseDispatch = reactRedux.useDispatch as jest.Mock
const mockedUseSelector = reactRedux.useSelector as jest.Mock

describe('useChangeEditorType', () => {
  const dispatchMock = jest.fn()

  beforeEach(() => {
    mockedUseDispatch.mockReturnValue(dispatchMock)
    dispatchMock.mockClear()
  })

  it('should return opposite editor type correctly', () => {
    mockedUseSelector.mockReturnValue({
      editorType: EditorType.Default,
    })

    const { result } = renderHook(() => useChangeEditorType())

    expect(result.current.editorType).toBe(EditorType.Default)

    act(() => {
      result.current.switchEditorType()
    })

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'rejson/setEditorType',
      payload: EditorType.Text,
    })
  })

  it('should return opposite editor type correctly when editorType is Text', () => {
    mockedUseSelector.mockReturnValue({
      editorType: EditorType.Text,
    })

    const { result } = renderHook(() => useChangeEditorType())

    expect(result.current.editorType).toBe(EditorType.Text)

    act(() => {
      result.current.switchEditorType()
    })

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'rejson/setEditorType',
      payload: EditorType.Default,
    })
  })
})
