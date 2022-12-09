import cx from 'classnames'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import styles from './styles.module.scss'

interface Props {
  value: string
  expanded?: boolean
  space?: number
}

const JSONViewer = (props: Props) => {
  const { value, expanded = false, space = 4 } = props

  try {
    JSON.parse(value)

    return {
      value: (
        <div className={cx(styles.jsonViewer, { [styles.collapsed]: !expanded })} data-testid="value-as-json">
          <JSONPretty json={value} space={space} />
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
