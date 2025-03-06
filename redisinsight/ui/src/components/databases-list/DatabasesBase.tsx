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
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingContent,
} from '@elastic/eui'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

export interface DatabaseItem {
  id?: string | number;
  name?: string;
  [key: string]: any;
}

export interface IPopoverProps {
  isPopoverOpen: boolean;
}

type InternalProps<T extends DatabaseItem> = {
  title: string;
  subtitle?: string;
  columns: EuiBasicTableColumn<T>[];
  databases: Nullable<T[]>;
  loading: boolean;
  error?: string;
  noResultsMessage?: string;
  loadingMessage?: string;
  notFoundMessage?: string;
  submitButtonText?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  cancelConfirmationTitle?: string;
  cancelConfirmationText?: string;
  selectionFilter?: (item: T) => boolean;
  renderSummary?: (items: T[], selection: T[]) => React.ReactNode;
  onClose: () => void;
  onBack?: () => void;
  onSubmit: (databases: T[]) => void;
}

function DatabasesBase<T extends DatabaseItem>({
  title,
  subtitle,
  columns,
  databases,
  loading,
  error = '',
  noResultsMessage = 'No databases available.',
  loadingMessage = 'Loading...',
  notFoundMessage = 'Not found',
  submitButtonText = 'Add Databases',
  showBackButton = false,
  backButtonText = 'Back',
  cancelConfirmationTitle = 'Cancel adding databases?',
  cancelConfirmationText = 'You will lose all your progress.',
  selectionFilter = () => true,
  renderSummary,
  onClose,
  onBack,
  onSubmit,
}: InternalProps<T>) {
  const [items, setItems] = useState(databases || [])
  const [message, setMessage] = useState(loadingMessage)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selection, setSelection] = useState<T[]>([])

  useEffect(() => {
    if (databases !== null) {
      setItems(databases)
    }

    if (databases?.length === 0 && !loading) {
      setMessage(noResultsMessage)
    }
  }, [databases, loading, noResultsMessage])

  const sort: PropertySort = {
    field: 'name',
    direction: 'asc',
  }

  const handleSubmit = () => {
    onSubmit(selection)
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleCancel = () => {
    closePopover()
    onClose()
  }

  const selectionValue: EuiTableSelectionType<T> = {
    selectable: selectionFilter,
    onSelectionChange: (selected: T[]) => setSelection(selected),
  }

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()
    const itemsTemp = databases?.filter(
      (item: T) =>
        item.name?.toLowerCase()?.indexOf(value) !== -1
          || item.id?.toString()?.toLowerCase().indexOf(value) !== -1
    ) ?? []

    if (!itemsTemp?.length) {
      setMessage(notFoundMessage)
    }
    setItems(itemsTemp)
  }

  const CancelButton = ({ isPopoverOpen: popoverIsOpen }: IPopoverProps) => (
    <EuiPopover
      button={(
        <EuiButton
          data-testid="btn-cancel"
          color="secondary"
          onClick={showPopover}
        >
          Cancel
        </EuiButton>
      )}
      isOpen={popoverIsOpen}
      closePopover={closePopover}
      panelPaddingSize="m"
      anchorPosition="upCenter"
    >
      <div className={styles.popoverContent}>
        <EuiTitle size="xs" className={styles.popoverTitle}>
          <h4>{cancelConfirmationTitle}</h4>
        </EuiTitle>
        <EuiText size="s" className={styles.popoverText}>
          <p>
            {cancelConfirmationText}
          </p>
        </EuiText>
        <div className={styles.popoverButtons}>
          <EuiButton
            data-testid="btn-cancel-no"
            color="text"
            onClick={closePopover}
          >
            No
          </EuiButton>
          <EuiButton
            data-testid="btn-cancel-yes"
            color="primary"
            fill
            onClick={handleCancel}
          >
            Yes
          </EuiButton>
        </div>
      </div>
    </EuiPopover>
  )

  const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        isDisabled ? 'Please select at least one database' : null
      }
      content={
        isDisabled ? (
          <span className="euiToolTip__content">
            No databases selected
          </span>
        ) : null
      }
    >
      <EuiButton
        fill
        data-testid="btn-submit"
        color="secondary"
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        {submitButtonText}
      </EuiButton>
    </EuiToolTip>
  )

  const BackButton = () => (
    <EuiButton
      onClick={onBack}
      color="secondary"
      className="btn-back"
      data-testid="btn-back"
    >
      {backButtonText}
    </EuiButton>
  )

  const DefaultSummary = () => (
    <EuiText className={styles.subTitle}>
      <span>
        {selection.length ? (
          <>
            <b>Summary: </b>
            <span className={styles.summaryCount}>{selection.length}</span>
            {' '}
            {selection.length === 1 ? 'database' : 'databases'}
            {' '}
            selected
          </>
        ) : 'No databases selected'}
      </span>
    </EuiText>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className={styles.container}>
        <div className={styles.content}>
          <EuiTitle size="s" className={styles.title} data-testid="title">
            <h1>{title}</h1>
          </EuiTitle>

          {subtitle && (
            <EuiText color="subdued" className={styles.subTitle}>
              <span>{subtitle}</span>
            </EuiText>
          )}

          {loading && (
            <div className={styles.loadingContent}>
              <EuiLoadingContent lines={3} />
            </div>
          )}

          {!loading && error && (
            <div className={styles.errorContainer}>
              <EuiText color="danger">
                <p>{error}</p>
              </EuiText>
              <EuiButton
                onClick={onClose}
                data-testid="btn-error-close"
              >
                Back
              </EuiButton>
            </div>
          )}

          {!loading && !error && (
            <>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="flexEnd" gutterSize="s">
                  <EuiFlexItem grow={false}>
                    {renderSummary ? renderSummary(items, selection) : <DefaultSummary />}
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
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
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <br />

              <div className={cx('databaseList', 'itemList', styles.databasesList)}>
                <EuiInMemoryTable
                  items={items}
                  itemId="id"
                  loading={loading}
                  columns={columns}
                  pagination={{
                    initialPageSize: 10,
                    pageSizeOptions: [5, 10, 20],
                  }}
                  sorting={{ sort }}
                  selection={selectionValue}
                  className={cx(styles.table, { [styles.tableEmpty]: !items.length })}
                  isSelectable
                  data-testid="databases-table"
                />
                {!items.length && <EuiText className={styles.noDatabases}>{message}</EuiText>}
              </div>
            </>
          )}
        </div>
        <div className={cx(styles.footer, 'footerAddDatabase')}>
          {showBackButton && onBack && <BackButton />}
          <div className={styles.tableFooterButtons}>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={selection.length < 1} />
          </div>
        </div>
      </div>
    </AutodiscoveryPageTemplate>
  )
}

export default DatabasesBase
