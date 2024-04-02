import { isString } from 'lodash'
import { EuiToolTip } from '@elastic/eui'
import { ToolTipPositions } from '@elastic/eui/src/components/tool_tip/tool_tip'
import cx from 'classnames'
import React from 'react'
import { FeaturesHighlightingType } from 'uiSrc/constants/featuresHighlighting'

import styles from './styles.modules.scss'

export interface Props {
  isHighlight?: boolean
  children: React.ReactElement<any, any> | string
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  type?: FeaturesHighlightingType
  transformOnHover?: boolean
  onClick?: () => void
  wrapperClassName?: string
  dotClassName?: string
  tooltipPosition?: ToolTipPositions
  hideFirstChild?: boolean
  dataTestPostfix?: string
}
const HighlightedFeature = (props: Props) => {
  const {
    isHighlight,
    children,
    title,
    content,
    type = 'plain',
    transformOnHover,
    onClick,
    wrapperClassName,
    dotClassName,
    tooltipPosition,
    hideFirstChild,
    dataTestPostfix = ''
  } = props

  const innerContent = hideFirstChild && !isString(children) ? children.props.children : children

  const DotHighlighting = () => (
    <>
      {innerContent}
      <span className={cx(styles.dot, dotClassName)} data-testid="dot-highlighting" />
    </>
  )

  const TooltipHighlighting = () => (
    <EuiToolTip
      title={title}
      content={content}
      position={tooltipPosition || 'bottom'}
      data-testid="tooltip-highlighting"
    >
      <div data-testid="tooltip-highlighting-inner">
        <DotHighlighting />
      </div>
    </EuiToolTip>
  )

  if (type === 'dialog') {
    return !isHighlight ? null : (<>{children}</>)
  }

  if (!isHighlight) return (<>{children}</>)

  return (
    <div
      className={cx(styles.wrapper, wrapperClassName, { 'transform-on-hover': transformOnHover })}
      onClick={() => onClick?.()}
      role="presentation"
      data-testid={`feature-highlighted-${dataTestPostfix}`}
    >
      {type === 'plain' && (<DotHighlighting />)}
      {type === 'tooltip' && (<TooltipHighlighting />)}
      {type === 'popover' && (<DotHighlighting />)}
    </div>
  )
}

export default HighlightedFeature
