import React from 'react'
import { EuiLink, EuiSwitch, EuiText } from '@elastic/eui'
import parse from 'html-react-parser'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { IConsent } from '../ConsentsSettings'

import styles from '../styles.module.scss'

interface Props {
  consent: IConsent
  onChangeAgreement: (checked: boolean, name: string) => void
  checked: boolean
  isSettingsPage?: boolean
  withoutSpacer?: boolean
  linkToPrivacyPolicy?: boolean
}

const ConsentOption = (props: Props) => {
  const {
    consent,
    onChangeAgreement,
    checked,
    isSettingsPage = false,
    withoutSpacer = false,
    linkToPrivacyPolicy = false,
  } = props

  const getText = () => (
    <>
      {consent.description && parse(consent.description)}
      {linkToPrivacyPolicy && (
        <>
          <EuiLink
            external={false}
            target="_blank"
            href="https://redis.io/legal/privacy-policy/?utm_source=redisinsight&utm_medium=app&utm_campaign=telemetry"
          >
            Privacy Policy
          </EuiLink>
          .
        </>
      )}
    </>
  )

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
            {getText()}
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
              {getText()}
            </EuiText>
          )}
        </FlexItem>
      </Row>
      {!withoutSpacer && <Spacer />}
    </FlexItem>
  )
}

export default ConsentOption
