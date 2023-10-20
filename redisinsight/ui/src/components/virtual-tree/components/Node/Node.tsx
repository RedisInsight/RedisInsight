import React, { useEffect, useState } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import { isUndefined } from 'lodash'
import {
  EuiIcon,
  EuiToolTip,
  keys as ElasticKeys,
  EuiButtonIcon,
  EuiLoadingContent,
  EuiText,
  EuiTextColor,
  EuiPopover,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui'

import GroupBadge from 'uiSrc/components/group-badge'
import {
  Maybe,
  formatBytes,
  formatLongName,
  replaceSpaces,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
} from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { TreeData } from '../../interfaces'
import styles from './styles.module.scss'

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// `style` parameter that should be added to the root div.
const Node = ({
  data,
  isOpen,
  index,
  style,
  setOpen,
}: NodePublicState<TreeData>) => {
  const {
    id: nodeId,
    isLeaf,
    keyCount,
    nestingLevel,
    fullName,
    nameBuffer,
    path,
    type,
    ttl,
    size,
    deleting,
    shortName,
    nameString,
    keyApproximate,
    isSelected,
    getMetadata,
    onDelete,
    onDeleteClicked,
    updateStatusOpen,
    updateStatusSelected,
  } = data

  const [deletePopoverId, setDeletePopoverId] = useState<Maybe<string>>(undefined)

  useEffect(() => {
    if (!size && isLeaf && nameBuffer) {
      getMetadata(nameBuffer, path)
    }
  }, [])

  useEffect(() => {
    if (isSelected && nameBuffer) {
      updateStatusSelected?.(nameBuffer)
    }
  }, [isSelected])

  const handleClick = () => {
    if (isLeaf && !isSelected) {
      updateStatusSelected?.(nameBuffer)
    }

    updateStatusOpen?.(fullName, !isOpen)
    !isLeaf && setOpen(!isOpen)
  }

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === ElasticKeys.SPACE) {
      handleClick()
    }
  }

  const handleDelete = () => {
    onDelete(nameBuffer)
    setDeletePopoverId(undefined)
  }

  const handleDeletePopoverOpen = (index: Maybe<string>, type: KeyTypes | ModulesKeyTypes) => {
    if (index !== deletePopoverId) {
      onDeleteClicked(type)
    }
    setDeletePopoverId(index !== deletePopoverId ? index : undefined)
  }

  const Folder = () => (
    <>
      <div className={styles.nodeName}>
        <EuiIcon
          type={isOpen ? 'arrowDown' : 'arrowRight'}
          className={cx(styles.nodeIcon, styles.nodeIconArrow)}
          data-test-subj={`node-arrow-icon_${fullName}`}
        />
        <EuiIcon
          type={isOpen ? 'folderOpen' : 'folderClosed'}
          className={styles.nodeIcon}
          data-test-subj={`node-folder-icon_${fullName}`}
        />
        {nameString}
      </div>
      <div className={styles.options} data-testid={`count_${fullName}`}>
        <div className={styles.approximate} data-testid={`percentage_${fullName}`}>
          {keyApproximate ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%` : '' }
        </div>
        <div className={styles.keyCount}>{keyCount ?? ''}</div>
      </div>
    </>
  )

  const Leaf = () => (
    <>
      <LeafType />
      <LeafName />
      <LeafTTL />
      <LeafSize />
    </>
  )

  const LeafType = () => (
    <>
      {!type && <EuiLoadingContent lines={1} className={cx(styles.keyInfoLoading, styles.keyType)} data-testid="type-loading" />}
      {!!type && <div className={styles.keyType}><GroupBadge type={type} name={nameString} /></div>}
    </>
  )

  const LeafName = () => {
    // Better to cut the long string, because it could affect virtual scroll performance
    const nameContent = replaceSpaces(shortName?.substring?.(0, 200))
    const nameTooltipContent = formatLongName(nameString)

    return (
      <div className={styles.keyName}>
        <EuiText color="subdued" size="s" style={{ maxWidth: '100%', display: 'flex' }}>
          <div style={{ display: 'flex' }} className="truncateText" data-testid={`key-${nameString}`}>
            <EuiToolTip
              title="Key Name"
              className={styles.tooltip}
              anchorClassName="truncateText"
              position="bottom"
              content={nameTooltipContent}
            >
              <>{nameContent}</>
            </EuiToolTip>
          </div>
        </EuiText>
      </div>
    )
  }

  const LeafTTL = () => {
    if (isUndefined(ttl)) {
      return <EuiLoadingContent lines={1} className={cx(styles.keyInfoLoading, styles.keyTTL)} data-testid="ttl-loading" />
    }
    if (ttl === -1) {
      return (
        <EuiTextColor
          className={cx(
            styles.keyTTL,
            styles.moveOnHover,
            { hide: deletePopoverId === nodeId },
          )}
          color="subdued"
          data-testid={`ttl-${nameString}`}
        >
          No limit
        </EuiTextColor>
      )
    }
    return (
      <EuiText
        className={cx(
          styles.keyTTL,
          styles.moveOnHover,
          { hide: deletePopoverId === nodeId },
        )}
        color="subdued"
        size="s"
      >
        <div style={{ display: 'flex' }} className="truncateText" data-testid={`ttl-${nameString}`}>
          <EuiToolTip
            title="Time to Live"
            className={styles.tooltip}
            anchorClassName="truncateText"
            position="right"
            content={(
              <>
                {`${truncateTTLToSeconds(ttl)} s`}
                <br />
                {`(${truncateNumberToDuration(ttl)})`}
              </>
            )}
          >
            <>{truncateNumberToFirstUnit(ttl)}</>
          </EuiToolTip>
        </div>
      </EuiText>
    )
  }

  const LeafSize = () => {
    if (isUndefined(size)) {
      return <EuiLoadingContent lines={1} className={cx(styles.keyInfoLoading, styles.keySize)} data-testid="size-loading" />
    }

    if (!size) {
      return (
        <EuiText color="subdued" size="s" className={cx(styles.keySize)} data-testid={`size-${nameString}`}>
          -
        </EuiText>
      )
    }
    return (
      <>
        <EuiText
          color="subdued"
          size="s"
          className={cx(
            styles.keySize,
            styles.moveOnHover,
            { hide: deletePopoverId === nodeId },
          )}
          style={{ maxWidth: '100%' }}
        >
          <div style={{ display: 'flex' }} className="truncateText" data-testid={`size-${nameString}`}>
            <EuiToolTip
              title="Key Size"
              className={styles.tooltip}
              anchorClassName="truncateText"
              position="right"
              content={(
                <>
                  {formatBytes(size, 3)}
                </>
              )}
            >
              <>{formatBytes(size, 0)}</>
            </EuiToolTip>
          </div>
        </EuiText>
        <EuiPopover
          anchorClassName={cx(
            styles.deleteAnchor,
            styles.showOnHover,
            { show: deletePopoverId === nodeId },
          )}
          anchorPosition="rightUp"
          isOpen={deletePopoverId === nodeId}
          closePopover={() => setDeletePopoverId(undefined)}
          panelPaddingSize="l"
          panelClassName={styles.deletePopover}
          button={(
            <EuiButtonIcon
              iconType="trash"
              onClick={() => handleDeletePopoverOpen(nodeId, type)}
              aria-label="Delete Key"
              data-testid={`delete-key-btn-${nameString}`}
            />
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <>
            <EuiText size="m">
              <h4 style={{ wordBreak: 'break-all' }}><b>{formatLongName(nameString)}</b></h4>
              <EuiText size="s">will be deleted.</EuiText>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiButton
              fill
              size="s"
              color="warning"
              iconType="trash"
              isDisabled={deleting}
              onClick={handleDelete}
              data-testid="submit-delete-key"
            >
              Delete
            </EuiButton>
          </>
        </EuiPopover>
      </>
    )
  }

  const Node = (
    <div
      className={cx(styles.nodeContent, {
        [styles.nodeContentOpen]: isOpen && !isLeaf,
      })}
      role="treeitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onFocus={() => {}}
      data-testid={`node-item_${fullName}`}
    >
      {!isLeaf && <Folder />}
      {isLeaf && <Leaf />}
    </div>
  )

  const tooltipContent = (
    <>
      <b>{`${fullName}*`}</b>
      <br />
      <span>{`${keyCount} key(s) (${Math.round(keyApproximate * 100) / 100}%)`}</span>
    </>
  )

  return (
    <div
      style={{
        ...style,
        paddingLeft: nestingLevel * 8,
      }}
      className={cx(
        styles.nodeContainer, {
          [styles.nodeSelected]: isSelected && isLeaf,
          [styles.nodeRowEven]: index % 2 === 0,
        }
      )}
    >
      {isLeaf && Node}
      {!isLeaf && (
        <EuiToolTip
          content={tooltipContent}
          position="bottom"
          anchorClassName={styles.anchorTooltipNode}
        >
          {Node}
        </EuiToolTip>
      )}
    </div>
  )
}

export default Node
