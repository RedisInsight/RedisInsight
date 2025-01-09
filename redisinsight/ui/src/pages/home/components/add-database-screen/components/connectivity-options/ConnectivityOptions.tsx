import React from 'react'
import { EuiButton, EuiFlexGrid, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import { AddDbType } from 'uiSrc/pages/home/constants'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'

import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'
import StarIcon from 'uiSrc/assets/img/icons/star.svg?react'

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
      <section>
        <EuiTitle size="xs" className={styles.sectionTitle}>
          <span>
            <CloudIcon className={styles.cloudIcon} />Get started with Redis Cloud account
          </span>
        </EuiTitle>
        <EuiSpacer />
        <EuiFlexGrid columns={3}>
          <EuiFlexItem grow={1}>
            <EuiButton
              color="secondary"
              className={styles.typeBtn}
              onClick={() => onClickOption(AddDbType.cloud)}
              data-testid="discover-cloud-btn"
            >
              Add Cloud databases
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={1}>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick, isSSOEnabled) => (
                <EuiButton
                  color="secondary"
                  className={cx(styles.typeBtn, styles.primary)}
                  href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                    campaign: UTM_CAMPAINGS[OAuthSocialSource.AddDbForm]
                  })}
                  target="_blank"
                  onClick={(e: React.MouseEvent) => {
                    ssoCloudHandlerClick(e, {
                      source: OAuthSocialSource.AddDbForm,
                      action: OAuthSocialAction.Create
                    })
                    isSSOEnabled && onClose?.()
                  }}
                  data-testid="create-free-db-btn"
                >
                  <StarIcon className={styles.star} />
                  Create free database
                </EuiButton>
              )}
            </OAuthSsoHandlerDialog>
          </EuiFlexItem>
          <EuiFlexItem />
        </EuiFlexGrid>
      </section>
      <EuiSpacer size="xxl" />
      <section>
        <EuiTitle size="xs" className={styles.sectionTitle}>
          <span>More connectivity options</span>
        </EuiTitle>
        <EuiSpacer />
        <EuiFlexGrid columns={3}>
          {CONNECTIVITY_OPTIONS.map(({ id, type, title }) => (
            <EuiFlexItem grow={1} key={id}>
              <EuiButton
                color="secondary"
                className={styles.typeBtn}
                onClick={() => onClickOption(type)}
                data-testid={`option-btn-${id}`}
              >
                {title}
              </EuiButton>
            </EuiFlexItem>
          ))}
        </EuiFlexGrid>
      </section>
    </>
  )
}

export default ConnectivityOptions
