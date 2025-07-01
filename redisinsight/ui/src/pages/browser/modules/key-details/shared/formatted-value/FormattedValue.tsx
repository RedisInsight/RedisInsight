import { ToolTipPositions } from '@elastic/eui'
import { EuiToolTipProps } from '@elastic/eui/src/components/tool_tip/tool_tip'
import React from 'react'
import { RiTooltip } from 'uiSrc/components'

export interface Props
  extends Omit<EuiToolTipProps, 'children' | 'delay' | 'position'> {
  value: string | JSX.Element
  tooltipContent: string | JSX.Element
  expanded?: boolean
  title?: string
  truncateLength?: number
  position?: ToolTipPositions
}

const FormattedValue = ({
  expanded,
  value,
  title,
  tooltipContent,
  truncateLength = 200,
  position = 'bottom',
  ...rest
}: Props) => {
  if (expanded) return <>{value}</>

  const truncated = value?.substring?.(0, truncateLength) ?? value

  return (
    <RiTooltip
      title={title}
      content={tooltipContent}
      position={position}
      {...rest}
    >
      <>{truncated}</>
    </RiTooltip>
  )
}

export default FormattedValue
