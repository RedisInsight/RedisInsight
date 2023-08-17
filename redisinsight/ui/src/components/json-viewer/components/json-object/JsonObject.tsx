import React from 'react'

import JsonComponent from 'uiSrc/components/json-viewer/components/json-component'
import { IJsonObjectProps } from 'uiSrc/components/json-viewer/interfaces'
import styles from 'uiSrc/components/json-viewer/styles.module.scss'

const JsonObject = ({ data, space = 2, gap = 0, lastElement = true }: IJsonObjectProps) => (
  <span data-testid="json-object-component">
    {'{\n'}
    {Object.keys(data).map((key, idx) => (
      <>
        {!!space && Array.from({ length: space + gap }, () => ' ')}
        <span className={styles.key}>
          {`"${key}"`}
        </span>
        {': '}
        <JsonComponent
          data={data[key]}
          lastElement={idx === Object.keys(data).length - 1}
          space={space}
          gap={gap + space}
          key={idx}
        />
      </>
    ))}
    {!!gap && Array.from({ length: gap }, () => ' ')}
    {'}'}
    {!lastElement && ','}
    {'\n'}
  </span>
)

export default JsonObject
