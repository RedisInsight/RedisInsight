import React, { useState, useEffect } from 'react'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiTableSelectionType,
  PropertySort,
  EuiPopover,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { map, pick } from 'lodash'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { FormField } from '@redis-ui/components'

import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Pages } from 'uiSrc/constants'
import { Title } from 'uiSrc/components/base/text/Title'
import { SearchInput } from 'uiSrc/components/base/inputs'
import styles from '../styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCloud>[]
  onClose: () => void
  onBack: () => void
  onSubmit: (
    databases: Pick<
      InstanceRedisCloud,
      'subscriptionId' | 'subscriptionType' | 'databaseId' | 'free'
    >[],
  ) => void
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage =
  'Your Redis Enterprise Сloud has no databases available'

const RedisCloudDatabasesPage = ({
  columns,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCloud[]>([])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<InstanceRedisCloud[]>([])

  const history = useHistory()

  const { loading, data: instances } = useSelector(cloudSelector)

  useEffect(() => {
    if (instances !== null) {
      setItems(instances)
    }
  }, [instances])

  useEffect(() => {
    if (instances === null) {
      history.push(Pages.home)
    }
  }, [])

  useEffect(() => {
    if (instances?.length === 0) {
      setMessage(noResultsMessage)
    }
  }, [instances])

  const sort: PropertySort = {
    field: 'name',
    direction: 'asc',
  }

  const handleSubmit = () => {
    onSubmit(
      map(selection, (i) =>
        pick(i, 'subscriptionId', 'subscriptionType', 'databaseId', 'free'),
      ),
    )
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const selectionValue: EuiTableSelectionType<InstanceRedisCloud> = {
    onSelectionChange: (selected: InstanceRedisCloud[]) =>
      setSelection(selected),
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp =
      instances?.filter(
        (item: InstanceRedisCloud) =>
          item.name?.toLowerCase().indexOf(value) !== -1 ||
          item.publicEndpoint?.toLowerCase().indexOf(value) !== -1 ||
          item.subscriptionId?.toString()?.indexOf(value) !== -1 ||
          item.subscriptionName?.toLowerCase().indexOf(value) !== -1 ||
          item.databaseId?.toString()?.indexOf(value) !== -1,
      ) || []

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const CancelButton = ({ isPopoverOpen: popoverIsOpen }: IPopoverProps) => (
    <EuiPopover
      anchorPosition="upCenter"
      isOpen={popoverIsOpen}
      closePopover={closePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={
        <SecondaryButton
          onClick={showPopover}
          className="btn-cancel"
          data-testid="btn-cancel"
        >
          Cancel
        </SecondaryButton>
      }
    >
      <EuiText size="m">
        <p>
          Your changes have not been saved.&#10;&#13; Do you want to proceed to
          the list of databases?
        </p>
      </EuiText>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </DestructiveButton>
      </div>
    </EuiPopover>
  )

  const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        isDisabled ? validationErrors.SELECT_AT_LEAST_ONE('database') : null
      }
      content={
        isDisabled ? (
          <span className="euiToolTip__content">
            {validationErrors.NO_DBS_SELECTED}
          </span>
        ) : null
      }
    >
      <PrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        loading={loading}
        icon={isDisabled ? InfoIcon : undefined}
        data-testid="btn-add-databases"
      >
        Add selected Databases
      </PrimaryButton>
    </EuiToolTip>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <Title size="XXL" className={styles.title} data-testid="title">
          Redis Cloud Databases
        </Title>

        <Row align="end" gap="s">
          <FlexItem grow>
            <EuiText color="subdued" className={styles.subTitle}>
              <span>
                These are {items.length > 1 ? 'databases ' : 'database '}
                in your Redis Cloud. Select the
                {items.length > 1 ? ' databases ' : ' database '} that you want
                to add.
              </span>
            </EuiText>
          </FlexItem>
        </Row>
        <FlexItem>
          <FormField className={styles.searchForm}>
            <SearchInput
              placeholder="Search..."
              onChange={onQueryChange}
              aria-label="Search"
              data-testid="search"
            />
          </FormField>
        </FlexItem>
        <br />

        <div className="itemList databaseList cloudDatabaseList">
          <EuiInMemoryTable
            items={items}
            itemId="databaseId"
            loading={loading}
            message={message}
            columns={columns}
            sorting={{ sort }}
            selection={selectionValue}
            className={styles.table}
            isSelectable
          />
        </div>
      </div>
      <FlexItem padding={4}>
        <Row justify="between" gap="m">
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <div>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={selection.length < 1} />
          </div>
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabasesPage
