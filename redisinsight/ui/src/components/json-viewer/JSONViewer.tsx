import cx from 'classnames'
import React from 'react'
import JSONBigInt from 'json-bigint'

import JsonComponent from 'uiSrc/components/json-viewer/components/json-component'
import styles from './styles.module.scss'

interface Props {
  value: string
  expanded?: boolean
  space?: number
}

const JSONViewer = (props: Props) => {
  const { value, expanded = false, space = 2 } = props

  try {
    const data = JSONBigInt({ useNativeBigInt: true }).parse(value)

    return {
      value: (
        <div className={cx(styles.jsonViewer, { [styles['jsonViewer-collapsed']]: !expanded })} data-testid="value-as-json">
          <JsonComponent data={data} space={space} />
        </div>
      ),
      isValid: true
    }
  } catch (e) {
    return {
      value,
      isValid: false
    }
  }
}

export default JSONViewer
