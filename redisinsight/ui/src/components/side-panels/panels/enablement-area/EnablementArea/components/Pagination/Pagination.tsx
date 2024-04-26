import React, { useContext, useEffect, useState } from 'react'
import {
  EuiButton,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiPopover
} from '@elastic/eui'
import cx from 'classnames'
import { isNil } from 'lodash'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import { Nullable } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  items: IEnablementAreaItem[]
  sourcePath: string
  activePageKey?: Nullable<string>
  compressed?: boolean
}

const Pagination = ({ items = [], sourcePath, activePageKey, compressed }: Props) => {
  const [isPopoverOpen, setPopover] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const { openPage } = useContext(EnablementAreaContext)

  useEffect(() => {
    if (activePageKey) {
      const index = items.findIndex((item) => item._key === activePageKey)
      setActivePage(index)
    }
  }, [activePageKey])

  const togglePopover = () => {
    setPopover(!isPopoverOpen)
  }

  const closePopover = () => {
    setPopover(false)
  }

  const handleOpenPage = (index: number) => {
    const path = items[index]?.args?.path
    const groupPath = items[index]?._groupPath
    const key = items[index]?._key

    closePopover()
    if (index !== activePage && openPage && path) {
      openPage({ path: sourcePath + path, manifestPath: !isNil(key) ? (`${groupPath}/${key}`) : '' })
    }
  }

  const pages = items.map((item, index) => (
    <EuiContextMenuItem
      className={cx(styles.pagesItem, { [styles.pagesItemActive]: index === activePage })}
      key={item.id}
      onClick={() => handleOpenPage(index)}
    >
      <span>{item.label}</span>
    </EuiContextMenuItem>
  ))

  const PagesControl = () => (
    <EuiPopover
      id="enablementAreaPagesMenu"
      button={(
        <button
          data-testid="enablement-area__pagination-popover-btn"
          className={styles.popoverButton}
          type="button"
          onClick={togglePopover}
        >
          {`${activePage + 1} of ${items.length}`}
        </button>
      )}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelClassName={styles.popover}
      panelPaddingSize="none"
    >
      <EuiContextMenuPanel
        data-testid="enablement-area__pagination-popover"
        style={{ minWidth: !compressed ? '280px' : 'none' }}
        className={styles.panel}
        size="s"
        items={pages}
      />
    </EuiPopover>
  )

  return (
    <div className={cx(styles.pagination, { [styles.paginationCompressed]: compressed })}>
      <div>
        {activePage > 0 && (
          <EuiButton
            aria-label="Previous page"
            fill
            data-testid="enablement-area__prev-page-btn"
            color="secondary"
            iconType="arrowLeft"
            iconSide="left"
            onClick={() => handleOpenPage(activePage - 1)}
            size={compressed ? 's' : 'm'}
            className={cx(styles.prevPage, { [styles.prevPageCompressed]: compressed })}
          >
            Back
          </EuiButton>
        )}
      </div>
      <div>
        <PagesControl />
      </div>
      <div>
        {(activePage < items.length - 1) && (
          <EuiButton
            aria-label="Next page"
            fill
            data-testid="enablement-area__next-page-btn"
            color="secondary"
            iconType="arrowRight"
            iconSide="right"
            onClick={() => handleOpenPage(activePage + 1)}
            className={cx(styles.nextPage, { [styles.nextPageCompressed]: compressed })}
            size={compressed ? 's' : 'm'}
          >
            Next
          </EuiButton>
        )}
      </div>
    </div>
  )
}

export default Pagination
