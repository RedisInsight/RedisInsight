import React from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSwitch,
  EuiText,
  EuiSpacer,
} from '@elastic/eui'
import parse from 'html-react-parser'

import { IConsent } from '../ConsentsSettings'

import styles from '../styles.module.scss'

interface Props {
  consent: IConsent
  onChangeAgreement: (checked: boolean, name: string, independent?: boolean) => void
  checked: boolean
  isSettingsPage?: boolean
  independent?: boolean
}

const ConsentOption = (props: Props) => {
  const { consent, onChangeAgreement, checked, isSettingsPage = false, independent = false } = props
  return (
    <EuiFlexItem key={consent.agreementName}>
      {isSettingsPage && consent.description && (
        <>
          <EuiText size="s" color="subdued" style={{ marginTop: '1em' }}>
            {parse(consent.description)}
          </EuiText>
          <EuiSpacer size="m" />
        </>
      )}
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiSwitch
            showLabel={false}
            label=""
            checked={checked}
            onChange={(e) => onChangeAgreement(e.target.checked, consent.agreementName, independent)}
            className={styles.switchOption}
            data-testid={`switch-option-${consent.agreementName}`}
            disabled={consent?.disabled}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText className={styles.label}>{parse(consent.label)}</EuiText>
          {!isSettingsPage && consent.description && (
            <EuiText size="s" color="subdued" style={{ marginTop: '1em' }}>
              {parse(consent.description)}
            </EuiText>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xl" />
    </EuiFlexItem>
  )
}

export default ConsentOption
