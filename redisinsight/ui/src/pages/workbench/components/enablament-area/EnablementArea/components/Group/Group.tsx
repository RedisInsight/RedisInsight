import React from 'react'
import { EuiAccordion, EuiText } from '@elastic/eui'
import './styles.scss'

export interface Props {
  testId: string,
  label: string;
  children: React.ReactElement[];
  withBorder?: boolean;
  initialIsOpen?: boolean;
  forceState?: 'open' | 'closed';
  arrowDisplay?: 'left' | 'right' | 'none';
}

const Group = (props: Props) => {
  const { label, children, testId, forceState, withBorder = false, arrowDisplay = 'right', initialIsOpen = false } = props
  const buttonContent = (
    <EuiText className="group-header" size="m">
      {label}
    </EuiText>
  )
  const buttonProps: any = { 'data-testid': `accordion-button-${testId}` }

  return (
    <EuiAccordion
      id={testId}
      data-testid={`accordion-${testId}`}
      buttonContent={buttonContent}
      buttonProps={buttonProps}
      forceState={forceState}
      arrowDisplay={arrowDisplay}
      initialIsOpen={initialIsOpen}
      style={{ whiteSpace: 'nowrap', width: 'auto' }}
      className={[withBorder ? 'withBorder' : ''].join(' ')}
    >
      {children}
    </EuiAccordion>
  )
}

export default Group
