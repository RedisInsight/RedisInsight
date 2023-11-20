import React, { useState, useEffect } from 'react'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiTableSelectionType,
  PropertySort,
  EuiButton,
  EuiPopover,
  EuiText,
  EuiTitle,
  EuiFieldSearch,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
  EuiToolTip,
} from '@elastic/eui'
import { map, pick } from 'lodash'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'

import { Pages } from 'uiSrc/constants'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { PageHeader } from 'uiSrc/components'
import validationErrors from 'uiSrc/constants/validationErrors'

import styles from '../styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCloud>[];
  onClose: () => void;
  onBack: () => void;
  onSubmit: (
    databases: Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'databaseId' | 'free'>[]
  ) => void;
}

interface IPopoverProps {
  isPopoverOpen: boolean;
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage = 'Your Redis Enterprise Сloud has no databases available'

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
    onSubmit(map(selection, (i) => pick(i, 'subscriptionId', 'subscriptionType', 'databaseId', 'free')))
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

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()

    const itemsTemp = instances.filter(
      (item: InstanceRedisCloud) =>
        item.name?.toLowerCase().indexOf(value) !== -1
        || item.publicEndpoint?.toLowerCase().indexOf(value) !== -1
        || item.subscriptionId?.toString()?.indexOf(value) !== -1
        || item.subscriptionName?.toLowerCase().indexOf(value) !== -1
        || item.databaseId?.toString()?.indexOf(value) !== -1
    )

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
      button={(
        <EuiButton onClick={showPopover} color="secondary" className="btn-cancel" data-testid="btn-cancel">
          Cancel
        </EuiButton>
      )}
    >
      <EuiText size="m">
        <p>
          Your changes have not been saved.&#10;&#13; Do you want to proceed to
          the list of databases?
        </p>
      </EuiText>
      <br />
      <div>
        <EuiButton fill size="s" color="warning" onClick={onClose} data-testid="btn-cancel-proceed">
          Proceed
        </EuiButton>
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
      <EuiButton
        fill
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        isLoading={loading}
        color="secondary"
        iconType={isDisabled ? 'iInCircle' : undefined}
        data-testid="btn-add-databases"
      >
        Add selected Databases
      </EuiButton>
    </EuiToolTip>
  )

  return (
    <>
      <PageHeader title="My Redis databases" />
      <div />
      <EuiPage>
        <EuiPageBody component="div">
          <div className="homePage">
            <div className="databaseContainer">
              <EuiTitle size="s" className={styles.title} data-testid="title">
                <h1>
                  Redis Cloud Databases
                </h1>
              </EuiTitle>

              <EuiText color="subdued" className={styles.subTitle}>
                <span>
                  These are
                  {' '}
                  {items.length > 1 ? 'databases ' : 'database '}
                  in your Redis Cloud. Select the
                  {items.length > 1 ? ' databases ' : ' database '}
                  {' '}
                  that you
                  want to add.
                </span>
              </EuiText>
              <EuiFormRow className={styles.searchForm}>
                <EuiFieldSearch
                  placeholder="Search..."
                  className={styles.search}
                  onChange={onQueryChange}
                  isClearable
                  aria-label="Search"
                  data-testid="search"
                />
              </EuiFormRow>
              <br />

              <div className="databaseList cloudDatabaseList">
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
            <div className={cx(styles.footer, 'footerAddDatabase')}>
              <EuiButton
                onClick={onBack}
                color="secondary"
                className="btn-cancel btn-back"
                data-testid="btn-back-to-adding"
              >
                Back to adding databases
              </EuiButton>
              <CancelButton isPopoverOpen={isPopoverOpen} />
              <SubmitButton isDisabled={selection.length < 1} />
            </div>
          </div>
        </EuiPageBody>
      </EuiPage>
    </>
  )
}

export default RedisCloudDatabasesPage
