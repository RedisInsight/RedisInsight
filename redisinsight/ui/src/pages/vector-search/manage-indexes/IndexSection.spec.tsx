import React from 'react'
import { cloneDeep } from 'lodash'
import { Provider } from 'react-redux'
import {
  cleanup,
  render,
  screen,
  mockStore,
  initialStateDefault,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { MOCK_REDISEARCH_INDEX_INFO } from 'uiSrc/mocks/data/redisearch'
import { IndexSection, IndexSectionProps } from './IndexSection'

const renderComponent = (props?: Partial<IndexSectionProps>) => {
  const defaultProps: IndexSectionProps = {
    index: 'test-index',
  }

  // Create a mock store with proper connected instance state
  const stateWithConnectedInstance = cloneDeep(initialStateDefault)
  stateWithConnectedInstance.connections.instances.connectedInstance = {
    ...stateWithConnectedInstance.connections.instances.connectedInstance,
    id: INSTANCE_ID_MOCK,
    name: 'test-instance',
    host: 'localhost',
    port: 6379,
    modules: [],
  }

  const store = mockStore(stateWithConnectedInstance)

  return render(
    <Provider store={store}>
      <IndexSection {...defaultProps} {...props} />
    </Provider>,
  )
}

describe('IndexSection', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', async () => {
    const props: IndexSectionProps = {
      index: 'test-index',
    }

    const { container } = renderComponent(props)
    expect(container).toBeTruthy()

    const section = screen.getByTestId(
      `manage-indexes-list--item--${props.index}`,
    )
    expect(section).toBeInTheDocument()

    // Verify index name is formatted correctly
    const indexName = screen.getByText('test-index')
    expect(indexName).toBeInTheDocument()
  })

  it('should display index summary when collapsed', async () => {
    const props: IndexSectionProps = {
      index: 'test-index',
    }

    renderComponent(props)

    const section = screen.getByTestId(
      `manage-indexes-list--item--${props.index}`,
    )
    expect(section).toBeInTheDocument()

    // Verify index name is formatted correctly
    const indexName = screen.getByText('test-index')
    expect(indexName).toBeInTheDocument()

    // Verify the index summary info is displayed
    const recordsLabel = screen.getByText('Records')
    const recordsValue = await screen.findByText(
      MOCK_REDISEARCH_INDEX_INFO.num_records!,
    )

    expect(recordsLabel).toBeInTheDocument()
    expect(recordsValue).toBeInTheDocument()

    const termsLabel = screen.getByText('Terms')
    const termsValue = await screen.findByText(
      MOCK_REDISEARCH_INDEX_INFO.num_terms!,
    )

    expect(termsLabel).toBeInTheDocument()
    expect(termsValue).toBeInTheDocument()

    const fieldsLabel = screen.getByText('Fields')
    const fieldsValue = await screen.findByText(
      MOCK_REDISEARCH_INDEX_INFO.attributes.length.toString(),
    )

    expect(fieldsLabel).toBeInTheDocument()
    expect(fieldsValue).toBeInTheDocument()
  })

  it('should display index attributes when expanded', async () => {
    const props: IndexSectionProps = {
      index: 'test-index',
    }

    const { container } = renderComponent(props)

    // Verify index name is formatted correctly
    const indexName = screen.getByText(props.index as string)
    expect(indexName).toBeInTheDocument()

    // Click to expand the section
    await userEvent.click(indexName)

    // Verify the index attributes are displayed
    const attribute = await screen.findByText('Attribute')
    const type = await screen.findByText('Type')
    const weight = await screen.findByText('Weight')
    const separator = await screen.findByText('Separator')

    expect(attribute).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(weight).toBeInTheDocument()
    expect(separator).toBeInTheDocument()

    // Verify that data rows are rendered
    const regularRows = container.querySelectorAll(
      'tr[data-row-type="regular"]',
    )
    expect(regularRows.length).toBe(9)

    // Verify their values as well
    const mockAttribute = MOCK_REDISEARCH_INDEX_INFO.attributes[0]
    const attributeValue = await screen.findByText(mockAttribute.attribute)
    const typeValue = await screen.findAllByText(mockAttribute.type)
    const weightValue = await screen.findAllByText(mockAttribute.WEIGHT!)
    const separatorValue = await screen.findAllByText(mockAttribute.SEPARATOR!)

    expect(attributeValue).toBeInTheDocument()
    expect(typeValue[0]).toBeInTheDocument()
    expect(weightValue[0]).toBeInTheDocument()
    expect(separatorValue[0]).toBeInTheDocument()
  })
})
