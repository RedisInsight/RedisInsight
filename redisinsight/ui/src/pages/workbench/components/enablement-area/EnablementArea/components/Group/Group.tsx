import React from 'react'
import { EuiAccordion, EuiText } from '@elastic/eui'
import './styles.scss'

export interface Props {
  testId: string
  label: string | React.ReactElement
  children: React.ReactElement[]
  withBorder?: boolean
  initialIsOpen?: boolean
  forceState?: 'open' | 'closed'
  arrowDisplay?: 'left' | 'right' | 'none'
  onToggle?: (isOpen: boolean) => void
  triggerStyle?: any
}

const Group = (props: Props) => {
  const {
    label,
    children,
    testId,
    forceState,
    withBorder = false,
    arrowDisplay = 'right',
    initialIsOpen = false,
    onToggle,
    triggerStyle,
  } = props
  const buttonContent = (
    <EuiText className="group-header" size="m">
      {label}
    </EuiText>
  )
  const buttonProps: any = {
    'data-testid': `accordion-button-${testId}`,
    style: triggerStyle,
  }

  return (
    <EuiAccordion
      id={testId}
      data-testid={`accordion-${testId}`}
      buttonContent={buttonContent}
      buttonProps={buttonProps}
      forceState={forceState}
      arrowDisplay={arrowDisplay}
      onToggle={onToggle}
      initialIsOpen={initialIsOpen}
      style={{ whiteSpace: 'nowrap', width: 'auto' }}
      className={[withBorder ? 'withBorder' : ''].join(' ')}
    >
      {children}
    </EuiAccordion>
  )
}

export default Group
