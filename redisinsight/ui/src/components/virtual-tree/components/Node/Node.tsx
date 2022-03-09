import React from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import { EuiIcon, EuiToolTip } from '@elastic/eui'

import { TreeData } from '../../interfaces'
import styles from './styles.module.scss'

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// `style` parameter that should be added to the root div.
const Node = ({
  data,
  isOpen,
  style,
  setOpen
}: NodePublicState<TreeData>) => {
  const {
    id,
    isLeaf,
    leafIcon,
    keys,
    name,
    keyCount,
    nestingLevel,
    fullName,
    keyApproximate,
    isSelected,
    setItems,
    updateStatusOpen,
    updateStatusSelected,
  } = data

  const handleClick = () => {
    if (isLeaf && keys) {
      setItems?.(keys)
      updateStatusSelected?.(fullName, keys)
    }

    updateStatusOpen?.(fullName, !isOpen)

    !isLeaf && setOpen(!isOpen)
  }

  const Node = (
    <div
      className={cx(styles.nodeContent, {
        [styles.nodeContentOpen]: isOpen && !isLeaf,
      })}
      onClick={handleClick}
      role="treeitem"
      onKeyDown={() => {}}
      tabIndex={0}
      onFocus={() => {}}
    >
      <div>
        {!isLeaf
          && <EuiIcon type={isOpen ? 'arrowDown' : 'arrowRight'} className={cx(styles.nodeIcon, styles.nodeIconArrow)} /> }
        {!isLeaf && <EuiIcon type={isOpen ? 'folderOpen' : 'folderClosed'} className={styles.nodeIcon} />}
        {isLeaf && <EuiIcon type={leafIcon} className={cx(styles.nodeIcon, styles.nodeIconLeaf)} />}
        {isLeaf ? 'Keys' : name}
      </div>
      <div>
        <span>{keyCount ?? ''}</span>
        <span className={styles.approximate}>
          {keyApproximate ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%` : '' }
        </span>
      </div>
    </div>
  )

  const content = (
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
        paddingLeft: nestingLevel * 30,
      }}
      className={cx(styles.nodeContainer, { [styles.nodeSelected]: isSelected && isLeaf, })}
    >
      {isLeaf && Node}
      {!isLeaf && (
        <EuiToolTip
          content={content}
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
