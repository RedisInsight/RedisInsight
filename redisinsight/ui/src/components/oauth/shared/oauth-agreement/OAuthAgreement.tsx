import React, { ChangeEvent } from 'react'
import { EuiLink, EuiCheckbox } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { setAgreement, oauthCloudPAgreementSelector } from 'uiSrc/slices/oauth/cloud'

import styles from './styles.module.scss'

export interface Props {
  size?: 's' | 'm'
}

const OAuthAgreement = (props: Props) => {
  const { size = 'm' } = props
  const agreement = useSelector(oauthCloudPAgreementSelector)

  const dispatch = useDispatch()

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setAgreement(e.target.checked))
    localStorageService.set(BrowserStorageItem.OAuthAgreement, e.target.checked)
  }

  return (
    <div className={cx(styles.wrapper, { [styles.small]: size === 's' })}>
      <EuiCheckbox
        id="ouath-agreement"
        name="agreement"
        label="By signing up, you acknowledge that you agree:"
        checked={agreement}
        onChange={handleCheck}
        className={styles.agreement}
        data-testid="oauth-agreement-checkbox"
      />
      <ul className={styles.list}>
        <li className={styles.listItem}>
          {'to our '}
          <EuiLink
            color="subdued"
            href="https://redis.com/legal/cloud-tos/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
            className={styles.link}
            external={false}
            target="_blank"
            data-testid="ouath-agreements-cloud-terms-of-service"
          >
            Cloud Terms of Service
          </EuiLink>
          {' and '}
          <EuiLink
            color="subdued"
            href="https://redis.com/legal/privacy-policy/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
            className={styles.link}
            external={false}
            target="_blank"
            data-testid="oauth-agreement-privacy-policy"
          >
            Privacy Policy
          </EuiLink>
        </li>
        <li className={styles.listItem}>
          that Redis Insight will generate Redis Cloud API account and user keys, and store them locally on your machine
        </li>
      </ul>
    </div>
  )
}

export default OAuthAgreement
