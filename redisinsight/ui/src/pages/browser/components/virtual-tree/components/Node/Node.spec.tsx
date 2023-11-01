import React from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import Node from './Node'
import { TreeData } from '../../interfaces'
import { mockVirtualTreeResult } from '../../VirtualTree.spec'

const mockDataFullName = 'test'
const mockedProps = mock<NodePublicState<TreeData>>()
const mockedPropsData = mock<TreeData>()
const mockedData: TreeData = {
  ...instance(mockedPropsData),
  nestingLevel: 3,
  isLeaf: true,
  path: '0.0.5.6',
  fullName: mockDataFullName,
  nameString: mockDataFullName,
  nameBuffer: stringToBuffer(mockDataFullName),
}

const mockedDataWithMetadata = {
  ...mockedData,
  type: KeyTypes.Hash,
  ttl: 123,
  size: 123,
}

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  useDisposableWebworker: () => ({ result: mockVirtualTreeResult, run: jest.fn() }),
}))

describe('Node', () => {
  it('should render', () => {
    expect(render(<Node {...instance(mockedProps)} data={mockedData} />)).toBeTruthy()
  })

  it('should render arrow and folder icons for Node properly', () => {
    const mockData: TreeData = {
      ...mockedData,
      isLeaf: false,
      fullName: mockDataFullName
    }

    const { container } = render(<Node {...instance(mockedProps)} data={mockData} />)

    expect(container.querySelector(`[data-test-subj="node-arrow-icon_${mockDataFullName}"`)).toBeInTheDocument()
    expect(container.querySelector(`[data-test-subj="node-folder-icon_${mockDataFullName}"`)).toBeInTheDocument()
  })

  it('"setItems", "updateStatusSelected", "mockGetMetadata" should be called after click on Leaf', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()
    const mockGetMetadata = jest.fn()

    const mockData: TreeData = {
      ...mockedData,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
      getMetadata: mockGetMetadata,
    }

    render(<Node
      {...instance(mockedProps)}
      setOpen={mockSetOpen}
      isOpen={false}
      data={mockData}
    />)

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).toBeCalledWith(mockData.nameBuffer)
    expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
    expect(mockGetMetadata).toBeCalledWith(mockData.nameBuffer, mockData.path)
    expect(mockSetOpen).not.toBeCalled()
  })

  it('"mockGetMetadata" not be call if size and ttl exists', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()
    const mockGetMetadata = jest.fn()

    const mockData: TreeData = {
      ...mockedDataWithMetadata,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
      getMetadata: mockGetMetadata,
    }

    render(<Node
      {...instance(mockedProps)}
      setOpen={mockSetOpen}
      isOpen={false}
      data={mockData}
    />)

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).toBeCalledWith(mockData.nameBuffer)
    expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
    expect(mockGetMetadata).not.toBeCalled()
    expect(mockSetOpen).not.toBeCalled()
  })

  it('name, ttl and size should be rendered', () => {
    const { getByTestId } = render(<Node
      {...instance(mockedProps)}
      data={mockedDataWithMetadata}
    />)

    expect(getByTestId(`node-item_${mockDataFullName}`)).toBeInTheDocument()
    expect(getByTestId(`badge-${mockedDataWithMetadata.type}_${mockDataFullName}`)).toBeInTheDocument()
    expect(getByTestId(`ttl-${mockDataFullName}`)).toBeInTheDocument()
    expect(getByTestId(`size-${mockDataFullName}`)).toBeInTheDocument()
  })

  it('"updateStatusOpen", "setOpen" should be called after click on Node', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()
    const mockIsOpen = false

    const mockData: TreeData = {
      ...mockedData,
      isLeaf: mockIsOpen,
      fullName: mockDataFullName,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
    }

    render(<Node
      {...instance(mockedProps)}
      isOpen={false}
      setOpen={mockSetOpen}
      data={mockData}
    />)

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).not.toBeCalled()
    expect(mockUpdateStatusOpen).toHaveBeenCalledWith(mockDataFullName, !mockIsOpen)
    expect(mockSetOpen).toBeCalledWith(!mockIsOpen)
  })
})
