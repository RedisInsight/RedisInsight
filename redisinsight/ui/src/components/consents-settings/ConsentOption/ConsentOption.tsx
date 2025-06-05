import React from 'react'
import { EuiSwitch } from '@elastic/eui'
import parse from 'html-react-parser'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
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
          <Text
            size="s"
            className={styles.smallText}
            color="subdued"
            style={{ marginTop: '12px' }}
          >
            {parse(consent.description)}
          </Text>
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
          <Text className={styles.smallText}>{parse(consent.label)}</Text>
          {!isSettingsPage && consent.description && (
            <Text
              size="s"
              className={styles.smallText}
              color="subdued"
              style={{ marginTop: '12px' }}
            >
              {parse(consent.description)}
            </Text>
          )}
        </FlexItem>
      </Row>
      {!withoutSpacer && <Spacer />}
    </FlexItem>
  )
}

export default ConsentOption
