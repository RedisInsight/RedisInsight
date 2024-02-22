import React from 'react'
import { EuiAccordion, EuiButtonEmpty, EuiIcon } from '@elastic/eui'

import { AutoRefresh } from 'uiSrc/components'

import styles from './styles.module.scss'

interface Props {
  id: string
  title: string
  children: JSX.Element
}

const Accordion = ({ id, title, children }: Props) => (
  <EuiAccordion
    id={id}
    className={styles.wrapper}
    buttonContent={title}
    paddingSize="m"
    initialIsOpen
    extraAction={(
      <AutoRefresh
        postfix={id}
        displayText
        loading={false}
        disabled={false}
        lastRefreshTime={0}
        onRefresh={() => {}}
        onRefreshClicked={() => {}}
        onEnableAutoRefresh={() => {}}
        testid={`${id}-refresh-btn`}
      />
    )}
  >
    {children}
  </EuiAccordion>
)

export default Accordion
