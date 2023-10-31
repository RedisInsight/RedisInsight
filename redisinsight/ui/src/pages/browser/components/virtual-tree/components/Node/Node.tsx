import React, { useEffect, useState } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import {
  EuiIcon,
  EuiToolTip,
  keys as ElasticKeys,
} from '@elastic/eui'

import {
  Maybe,
} from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { TreeData } from '../../interfaces'
import styles from './styles.module.scss'

const MAX_NESTING_LEVEL = 20

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
    shortName,
    size,
    deleting,
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
    if (!isLeaf || !nameBuffer) {
      return
    }
    if (!size || !ttl) {
      getMetadata?.(nameBuffer, path)
    }
  }, [])

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

  const handleDelete = (nameBuffer: RedisResponseBuffer) => {
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
    <EuiToolTip
      content={tooltipContent}
      position="bottom"
      anchorClassName={styles.anchorTooltipNode}
    >
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
          <span className="truncateText" data-testid={`folder-${nameString}`}>
            {nameString}
          </span>
        </div>
        <div className={styles.options}>
          <div className={styles.approximate} data-testid={`percentage_${fullName}`}>
            {keyApproximate ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%` : '' }
          </div>
          <div className={styles.keyCount} data-testid={`count_${fullName}`}>{keyCount ?? ''}</div>
        </div>
      </>
    </EuiToolTip>
  )

  const Leaf = () => (
    <>
      <KeyRowType type={type} nameString={nameString} />
      <KeyRowName nameString={shortName} />
      <KeyRowTTL ttl={ttl} nameString={nameString} deletePopoverId={deletePopoverId} rowId={nodeId} />
      <KeyRowSize
        size={size}
        nameString={nameString}
        nameBuffer={nameBuffer}
        deletePopoverId={deletePopoverId}
        rowId={nodeId}
        type={type}
        deleting={deleting}
        setDeletePopoverId={setDeletePopoverId}
        handleDeletePopoverOpen={handleDeletePopoverOpen}
        handleDelete={handleDelete}
      />
    </>
  )

  const Node = (
    <div
      className={cx(styles.nodeContent, 'rowKey', {
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
        paddingLeft: (nestingLevel > MAX_NESTING_LEVEL ? MAX_NESTING_LEVEL : nestingLevel) * 8,
      }}
      className={cx(
        styles.nodeContainer, {
          [styles.nodeSelected]: isSelected && isLeaf,
          [styles.nodeRowEven]: index % 2 === 0,
        }
      )}
    >
      {Node}
    </div>
  )
}

export default Node
