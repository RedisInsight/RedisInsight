import React from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import KeyDarkSVG from 'uiSrc/assets/img/sidebar/browser_active.svg'
import Node from './Node'
import { TreeData } from '../../interfaces'
import { mockVirtualTreeResult } from '../../VirtualTree.spec'

const mockedProps = mock<NodePublicState<TreeData>>()
const mockedPropsData = mock<TreeData>()
const mockedData: TreeData = {
  ...instance(mockedPropsData),
  nestingLevel: 3,
  leafIcon: KeyDarkSVG
}
const mockDataFullName = 'test'

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

  it('should render leaf icon for Leaf properly', () => {
    const mockData: TreeData = {
      ...mockedData,
      isLeaf: true,
      fullName: mockDataFullName
    }

    const { container } = render(<Node {...instance(mockedProps)} data={mockData} />)

    expect(container.querySelector(`[data-test-subj="leaf-icon_${mockDataFullName}"`)).toBeInTheDocument()
  })

  it('"setItems", "updateStatusSelected" should be called after click on Leaf', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()

    const mockData: TreeData = {
      ...mockedData,
      isLeaf: true,
      fullName: mockDataFullName,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
    }

    render(<Node
      {...instance(mockedProps)}
      setOpen={mockSetOpen}
      isOpen={false}
      data={mockData}
    />)

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).toBeCalledWith(mockDataFullName)
    expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
    expect(mockSetOpen).not.toBeCalled()
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
