import React from 'react'
import { EuiBadge, EuiButton, EuiTitle, } from '@elastic/eui'
import cx from 'classnames'
import { AddDbType } from 'uiSrc/pages/home/constants'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'

import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'
import RocketIcon from 'uiSrc/assets/img/oauth/rocket.svg?react'

import { FlexItem, Grid } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { CONNECTIVITY_OPTIONS } from '../../constants'

import styles from './styles.module.scss'

export interface Props {
  onClickOption: (type: AddDbType) => void
  onClose?: () => void
}

const ConnectivityOptions = (props: Props) => {
  const { onClickOption, onClose } = props

  return (
    <>
      <section className={styles.cloudSection}>
        <EuiTitle size="xs" className={styles.sectionTitle}>
          <span>Get started with Redis Cloud account</span>
        </EuiTitle>
        <Spacer />
        <Grid gap="l" columns={3} responsive>
          <FlexItem>
            <EuiButton
              color="secondary"
              className={styles.typeBtn}
              onClick={() => onClickOption(AddDbType.cloud)}
              data-testid="discover-cloud-btn"
            >
              <CloudIcon className={styles.btnIcon} />
              Add databases
            </EuiButton>
          </FlexItem>
          <FeatureFlagComponent name={FeatureFlags.cloudAds}>
            <FlexItem>
              <OAuthSsoHandlerDialog>
                {(ssoCloudHandlerClick, isSSOEnabled) => (
                  <EuiButton
                    color="secondary"
                    className={styles.typeBtn}
                    href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                      campaign: UTM_CAMPAINGS[OAuthSocialSource.AddDbForm],
                    })}
                    target="_blank"
                    onClick={(e: React.MouseEvent) => {
                      ssoCloudHandlerClick(e, {
                        source: OAuthSocialSource.AddDbForm,
                        action: OAuthSocialAction.Create,
                      })
                      isSSOEnabled && onClose?.()
                    }}
                    data-testid="create-free-db-btn"
                  >
                    <EuiBadge color="subdued" className={styles.freeBadge}>
                      Free
                    </EuiBadge>
                    <RocketIcon className={cx(styles.btnIcon, styles.rocket)} />
                    New database
                  </EuiButton>
                )}
              </OAuthSsoHandlerDialog>
            </FlexItem>
          </FeatureFlagComponent>
          <FlexItem grow />
        </Grid>
      </section>
      <Spacer size="xxl" />
      <section>
        <EuiTitle size="xs" className={styles.sectionTitle}>
          <span>More connectivity options</span>
        </EuiTitle>
        <Spacer />
        <Grid gap="l" responsive columns={3}>
          {CONNECTIVITY_OPTIONS.map(({ id, type, title, icon }) => (
            <FlexItem key={id}>
              <EuiButton
                color="secondary"
                className={cx(styles.typeBtn, styles.small)}
                onClick={() => onClickOption(type)}
                data-testid={`option-btn-${id}`}
              >
                {icon?.({ className: styles.btnIcon })}
                {title}
              </EuiButton>
            </FlexItem>
          ))}
        </Grid>
      </section>
    </>
  )
}

export default ConnectivityOptions
