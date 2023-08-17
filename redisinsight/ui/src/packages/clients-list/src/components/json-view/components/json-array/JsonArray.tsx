import React, { Fragment } from 'react'

import { IJsonArrayProps } from '../../interfaces'
import JsonPretty from '../json-pretty'

const JsonArray = ({ data, space = 2, gap = 0, lastElement = true }: IJsonArrayProps) => (
  <span data-testid="json-array-component">
    {'[\n'}
    {data.map((value, idx) => (
      <Fragment key={`${value}-{idx}`}>
        {!!space && Array.from({ length: space + gap }, () => ' ')}
        <JsonPretty
          data={value}
          lastElement={idx === data.length - 1}
          space={space}
          gap={gap + space}
        />
      </Fragment>
    ))}
    {!!gap && Array.from({ length: gap }, () => ' ')}
    ]
    {!lastElement && ','}
    {'\n'}
  </span>
)

export default JsonArray
