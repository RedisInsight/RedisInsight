import React, { useState, useEffect } from 'react'
import cx from 'classnames'
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
import { useSelector } from 'react-redux'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import styles from '../../../styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<ModifiedSentinelMaster>[];
  masters: ModifiedSentinelMaster[];
  onClose: () => void;
  onBack: () => void;
  onSubmit: (databases: ModifiedSentinelMaster[]) => void;
}

interface IPopoverProps {
  isPopoverOpen: boolean;
}

const loadingMsg = 'loading...'
const notMastersMsg = 'Your Redis Sentinel has no primary groups available.'
const notFoundMsg = 'Not found.'

const SentinelDatabases = ({
  columns,
  onClose,
  onBack,
  onSubmit,
  masters,
}: Props) => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>(masters)
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selection, setSelection] = useState<ModifiedSentinelMaster[]>([])

  const { loading } = useSelector(sentinelSelector)

  const sort: PropertySort = {
    field: 'name',
    direction: 'asc',
  }

  const updateSelection = (
    selected: ModifiedSentinelMaster[],
    masters: ModifiedSentinelMaster[]
  ) =>
    selected.map(
      (select) => masters.find((master) => master.id === select.id) ?? select
    )

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
      setSelection((prevState) => updateSelection(prevState, masters))
    }

    if (!masters.length) {
      setMessage(notMastersMsg)
    }
  }, [masters])

  const handleSubmit = () => {
    onSubmit(selection)
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const isSubmitDisabled = () => {
    const selected = selection.length < 1
    const emptyAliases = selection.filter(({ alias }) => !alias)
    return selected || emptyAliases.length !== 0
  }

  const selectionValue: EuiTableSelectionType<ModifiedSentinelMaster> = {
    onSelectionChange: (selected: ModifiedSentinelMaster[]) =>
      setSelection(selected),
  }

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()

    const itemsTemp = masters.filter(
      (item: ModifiedSentinelMaster) =>
        item.name?.toLowerCase().includes(value)
        || item.host?.toLowerCase().includes(value)
        || item.alias?.toLowerCase().includes(value)
        || item.username?.toLowerCase().includes(value)
        || item.port?.toString()?.includes(value)
        || item.numberOfSlaves?.toString().includes(value)
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

  const SubmitButton = ({ onClick }: { onClick: () => void }) => {
    let title = null
    let content = null
    const emptyAliases = selection.filter(({ alias }) => !alias)

    if (selection.length < 1) {
      title = validationErrors.SELECT_AT_LEAST_ONE('primary group')
      content = validationErrors.NO_PRIMARY_GROUPS_SENTINEL
    }

    if (emptyAliases.length !== 0) {
      title = validationErrors.REQUIRED_TITLE(emptyAliases.length)
      content = 'Database Alias'
    }

    return (
      <EuiToolTip
        position="top"
        anchorClassName="euiToolTip__btn-disabled"
        title={title}
        content={
          isSubmitDisabled() ? (
            <span className="euiToolTip__content">{content}</span>
          ) : null
        }
      >
        <EuiButton
          fill
          color="secondary"
          type="submit"
          onClick={onClick}
          disabled={isSubmitDisabled()}
          isLoading={loading}
          iconType={isSubmitDisabled() ? 'iInCircle' : undefined}
          data-testid="btn-add-primary-group"
        >
          Add Primary Group
        </EuiButton>
      </EuiToolTip>
    )
  }

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <EuiTitle size="s" className={styles.title} data-testid="title">
          <h1>Auto-Discover Redis Sentinel Primary Groups</h1>
        </EuiTitle>

        <EuiText color="subdued" className={styles.subTitle}>
          <span>
            Redis Sentinel instance found.
            {' '}
            <br />
            Here is a list of primary groups your Sentinel instance is
            managing. Select the primary group(s) you want to add:
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

        <div className="databaseList sentinelDatabaseList">
          <EuiInMemoryTable
            isSelectable
            items={items}
            itemId="id"
            loading={loading}
            message={message}
            columns={columns}
            sorting={{ sort }}
            selection={selectionValue}
            className={cx(
              styles.table,
              !masters.length && styles.tableEmpty
            )}
            data-testid="table"
          />
          {!masters.length && (
          <EuiText className={styles.notFoundMsg} color="subdued">
            {notMastersMsg}
          </EuiText>
          )}
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
        <SubmitButton onClick={handleSubmit} />
      </div>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabases
