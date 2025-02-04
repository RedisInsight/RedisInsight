import React from 'react'
import { instance, mock } from 'ts-mockito'
import { WebviewTag } from 'electron'
import { render } from 'uiSrc/utils/test-utils'
import RdiDeployErrorContent, {
  Props,
  textToDownloadableFile,
} from './RdiDeployErrorContent'

const mockedProps = mock<Props>()

describe('RdiDeployErrorContent', () => {
  it('should render', () => {
    expect(
      render(<RdiDeployErrorContent {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})

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
    const downloadFn = textToDownloadableFile('Test Content', 'test.txt')

    downloadFn()

    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
  })

  it('should clean up object URL after download', () => {
    const downloadFn = textToDownloadableFile('Test Content', 'test.txt')

    downloadFn()

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('mock-file-url')
  })
})
