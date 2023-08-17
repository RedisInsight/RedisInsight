import React, { Fragment } from 'react'

import JsonPretty from 'uiSrc/components/json-viewer/components/json-pretty'
import { IJsonObjectProps } from 'uiSrc/components/json-viewer/interfaces'
import styles from 'uiSrc/components/json-viewer/styles.module.scss'

const JsonObject = ({ data, space = 2, gap = 0, lastElement = true }: IJsonObjectProps) => {
  const keys = Object.keys(data)

  return (
    <span data-testid="json-object-component">
      {'{\n'}
      {keys.map((key, idx) => (
        <Fragment key={key}>
          {!!space && Array.from({ length: space + gap }, () => ' ')}
          <span className={styles.key}>
            {`"${key}"`}
          </span>
          {': '}
          <JsonPretty
            data={data[key]}
            lastElement={idx === keys.length - 1}
            space={space}
            gap={gap + space}
          />
        </Fragment>
      ))}
      {!!gap && Array.from({ length: gap }, () => ' ')}
      {'}'}
      {!lastElement && ','}
      {'\n'}
    </span>
  )
}

export default JsonObject
