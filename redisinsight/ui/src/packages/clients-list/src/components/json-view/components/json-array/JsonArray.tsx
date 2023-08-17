import React from 'react'

import { IJsonArrayProps } from '../../interfaces'
import JsonComponent from '../json-component'

const JsonArray = ({ data, space = 2, gap = 0, lastElement = true }: IJsonArrayProps) => (
  <span data-testid="json-array-component">
    {'[\n'}
    {data.map((value, idx) => (
      <>
        {!!space && Array.from({ length: space + gap }, () => ' ')}
        <JsonComponent
          data={value}
          lastElement={idx === data.length - 1}
          space={space}
          gap={gap + space}
          key={idx}
        />
      </>
    ))}
    {!!gap && Array.from({ length: gap }, () => ' ')}
    ]
    {!lastElement && ','}
    {'\n'}
  </span>
)

export default JsonArray
