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
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { map } from 'lodash'
import { useSelector } from 'react-redux'
import { Maybe } from 'uiSrc/utils'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCluster>[];
  onClose: () => void;
  onBack: () => void;
  onSubmit: (uids: Maybe<number>[]) => void;
}

interface IPopoverProps {
  isPopoverOpen: boolean;
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage = 'Your Redis Enterprise Cluster has no databases available.'

const RedisClusterDatabases = ({ columns, onClose, onBack, onSubmit }: Props) => {
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<InstanceRedisCluster[]>([])

  const { data: instances, loading } = useSelector(clusterSelector)

  useEffect(() => {
    if (instances !== null) {
      setItems(instances)
    }
  }, [instances])

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
    onSubmit(map(selection, 'uid'))
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const isSubmitDisabled = () => selection.length < 1

  const selectionValue: EuiTableSelectionType<InstanceRedisCluster> = {
    onSelectionChange: (selected: InstanceRedisCluster[]) => setSelection(selected),
  }

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()
    const itemsTemp = instances?.filter(
      (item: InstanceRedisCluster) =>
        item.name?.toLowerCase().indexOf(value) !== -1
        || item.dnsName?.toLowerCase().indexOf(value) !== -1
        || item.port?.toString().toLowerCase().indexOf(value) !== -1
    ) ?? []

    if (!itemsTemp?.length) {
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
        <EuiButton onClick={showPopover} color="secondary" className="btn-cancel" data-testid="btn-back">
          Cancel
        </EuiButton>
      )}
    >
      <EuiText size="m">
        <p>
          Your changes have not been saved.&#10;&#13; Do you want to proceed to the list of
          databases?
        </p>
      </EuiText>
      <br />
      <div>
        <EuiButton fill size="s" color="warning" onClick={onClose} data-testid="btn-back-proceed">
          Proceed
        </EuiButton>
      </div>
    </EuiPopover>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <EuiTitle size="s" className={styles.title} data-testid="title">
          <h1>
            Auto-Discover Redis Enterprise Databases
          </h1>
        </EuiTitle>

        {!!items.length && (
        <EuiText color="subdued" className={styles.subTitle}>
          <span>
            These are the
            {' '}
            {items.length > 1 ? 'databases ' : 'database '}
            in your Redis Enterprise Cluster. Select the
            {items.length > 1 ? ' databases ' : ' database '}
            {' '}
            that you want to add.
          </span>
        </EuiText>
        )}
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

        <div className={cx('databaseList clusterDatabaseList', styles.databaseListWrapper)}>
          <EuiInMemoryTable
            items={items}
            itemId="uid"
            loading={loading}
            message={message}
            columns={columns}
            sorting={{ sort }}
            selection={selectionValue}
            className={cx(styles.table, { [styles.tableEmpty]: !items.length })}
            isSelectable
          />
          {!items.length && <EuiText className={styles.noDatabases}>{message}</EuiText>}
        </div>
      </div>
      <div className={cx(styles.footer, 'footerAddDatabase', styles.footerClusterDatabases)}>
        <EuiButton
          onClick={onBack}
          color="secondary"
          className="btn-cancel btn-back"
          data-testid="btn-back-to-adding"
        >
          Back to adding databases
        </EuiButton>
        <div className={styles.footerButtonsGroup}>
          <CancelButton isPopoverOpen={isPopoverOpen} />
          <EuiToolTip
            position="top"
            anchorClassName="euiToolTip__btn-disabled"
            title={isSubmitDisabled() ? validationErrors.SELECT_AT_LEAST_ONE('database') : null}
            content={
            isSubmitDisabled() ? (
              <span className="euiToolTip__content">{validationErrors.NO_DBS_SELECTED}</span>
            ) : null
          }
          >
            <EuiButton
              fill
              size="m"
              disabled={isSubmitDisabled()}
              onClick={handleSubmit}
              isLoading={loading}
              color="secondary"
              iconType={isSubmitDisabled() ? 'iInCircle' : undefined}
              data-testid="btn-add-databases"
            >
              Add selected Databases
            </EuiButton>
          </EuiToolTip>
        </div>
      </div>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabases
