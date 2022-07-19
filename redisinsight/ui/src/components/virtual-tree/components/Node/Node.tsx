import React, { useEffect } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import { EuiIcon, EuiToolTip, keys as ElasticKeys } from '@elastic/eui'

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

  useEffect(() => {
    if (isSelected && keys) {
      updateStatusSelected?.(fullName, keys)
    }
  }, [keys, isSelected])

  const handleClick = () => {
    if (isLeaf && keys) {
      setItems?.(keys)
      updateStatusSelected?.(fullName, keys)
    }

    updateStatusOpen?.(fullName, !isOpen)

    !isLeaf && setOpen(!isOpen)
  }

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === ElasticKeys.SPACE) {
      handleClick()
    }
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
      <div className={styles.nodeName}>
        {!isLeaf && (
        <>
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
          {name}
        </>
        )}

        {isLeaf && (
          <>
            <EuiIcon
              type={leafIcon}
              className={cx(styles.nodeIcon, styles.nodeIconLeaf)}
              data-test-subj={`leaf-icon_${fullName}`}
            />
            Keys
          </>
        )}
      </div>
      <div className={styles.options} data-testid={`count_${fullName}`}>
        <span>{keyCount ?? ''}</span>
        <span className={styles.approximate} data-testid={`percentage_${fullName}`}>
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
        paddingLeft: nestingLevel * 8,
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
