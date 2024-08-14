import { EuiToolTip, ToolTipPositions } from '@elastic/eui'
import React from 'react'
import { KeyValueFormat, TEXT_FAILED_CONVENT_FORMATTER } from 'uiSrc/constants'

export interface Props {
  value: string | JSX.Element
  tooltipContent: string
  viewFormatProp: KeyValueFormat
  isValid: boolean
  expanded?: boolean
  title?: string
  truncateLength?: number
  anchorClassName?: string
  position?: ToolTipPositions
}

const FormattedValue = ({
  expanded,
  value,
  isValid,
  title = 'Field',
  tooltipContent,
  viewFormatProp,
  truncateLength = 200,
  ...rest
}: Props) => {
  if (expanded) {
    return <>{value}</>
  }
  const truncated = value?.substring?.(0, truncateLength) ?? value

  let length: number = value?.length || 0

  if (!length && value && typeof value === 'object' && value.type === 'div') {
    length = value.props?.children?.props?.data?.length || 0
  }
  if (length > 500) {
    return <>{truncated}</>
  }

  return (
    <EuiToolTip
      title={isValid ? title : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)}
      content={tooltipContent}
      position="bottom"
      anchorClassName="truncateText"
      {...rest}
    >
      <>{truncated}</>
    </EuiToolTip>
  )
}

export default FormattedValue
