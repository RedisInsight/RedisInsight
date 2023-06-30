import cx from 'classnames'
import React from 'react'
import JSONPretty from 'react-json-pretty'

interface Props {
  value: string
  expanded?: boolean
  space?: number
}

const JSONViewer = (props: Props) => {
  const { value, expanded = false, space = 2 } = props

  try {
    JSON.parse(value)

    return {
      value: (
        <div className={cx('jsonViewer', { 'jsonViewer-collapsed': !expanded })} data-testid="value-as-json">
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
