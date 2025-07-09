import React from 'react'
import { EuiSwitch, EuiText } from '@elastic/eui'
import parse from 'html-react-parser'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { ItemDescription } from './components'
import { IConsent } from '../ConsentsSettings'

import styles from '../styles.module.scss'

interface Props {
  consent: IConsent
  onChangeAgreement: (checked: boolean, name: string) => void
  checked: boolean
  isSettingsPage?: boolean
  withoutSpacer?: boolean
}

const ConsentOption = (props: Props) => {
  const {
    consent,
    onChangeAgreement,
    checked,
    isSettingsPage = false,
    withoutSpacer = false,
  } = props

  return (
    <FlexItem key={consent.agreementName} grow>
      {isSettingsPage && consent.description && (
        <>
          <EuiText
            size="s"
            className={styles.smallText}
            color="subdued"
            style={{ marginTop: '12px' }}
          >
            <ItemDescription description={consent.description} withLink={consent.linkToPrivacyPolicy} />
          </EuiText>
          <Spacer size="m" />
        </>
      )}
      <Row gap="m">
        <FlexItem>
          <EuiSwitch
            showLabel={false}
            label=""
            checked={checked}
            onChange={(e) =>
              onChangeAgreement(e.target.checked, consent.agreementName)
            }
            className={styles.switchOption}
            data-testid={`switch-option-${consent.agreementName}`}
            disabled={consent?.disabled}
          />
        </FlexItem>
        <FlexItem>
          <EuiText className={styles.smallText}>{parse(consent.label)}</EuiText>
          {!isSettingsPage && consent.description && (
            <EuiText
              size="s"
              className={styles.smallText}
              color="subdued"
              style={{ marginTop: '12px' }}
            >
              <ItemDescription description={consent.description} withLink={consent.linkToPrivacyPolicy} />
            </EuiText>
          )}
        </FlexItem>
      </Row>
      {!withoutSpacer && <Spacer />}
    </FlexItem>
  )
}

export default ConsentOption
