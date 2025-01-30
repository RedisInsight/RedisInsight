import { renderHook, act } from '@testing-library/react-hooks'
import { WebviewTag } from 'electron'
import useTextFileGenerator from './useTextFileGenerator'

describe('useTextFileGenerator', () => {
  let createObjectURLSpy: jest.SpyInstance
  let revokeObjectURLSpy: jest.SpyInstance
  let createElementSpy: jest.SpyInstance
  let appendChildSpy: jest.SpyInstance
  let removeChildSpy: jest.SpyInstance
  let clickSpy: jest.SpyInstance

  beforeEach(() => {
    createObjectURLSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('mock-file-url')
    revokeObjectURLSpy = jest
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation()

    const mockAnchor = document.createElement('a') as unknown as WebviewTag
    mockAnchor.click = jest.fn()

    createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation(() => mockAnchor)

    appendChildSpy = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation()
    removeChildSpy = jest
      .spyOn(document.body, 'removeChild')
      .mockImplementation()
    clickSpy = jest.spyOn(mockAnchor, 'click')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return a function that triggers a file download', () => {
    const { result } = renderHook(() => useTextFileGenerator())

    const downloadFn = result.current.textToDownloadableFile(
      'Test Content',
      'test.txt',
    )

    expect(typeof downloadFn).toBe('function')

    act(() => {
      downloadFn()
    })

    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
  })

  it('should clean up object URL after download', () => {
    const { result } = renderHook(() => useTextFileGenerator())

    const downloadFn = result.current.textToDownloadableFile(
      'Test Content',
      'test.txt',
    )

    act(() => {
      downloadFn()
    })

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('mock-file-url')
  })
})
