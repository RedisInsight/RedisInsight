import React from 'react'
import { EuiEmptyPrompt, EuiIcon, EuiLink } from '@elastic/eui'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

const EmptyPrompt = () => (
  <div className={styles.container}>
    <EuiEmptyPrompt
      data-testid="enablement-area__empty-prompt"
      icon={<RiIcon type="ToastDangerIcon" color="danger600" size="l" />}
      title={<h2>No information to display</h2>}
      body={
        <p className={styles.body}>
          <span>Restart the application.</span>
          <br />
          <span>
            If the problem persists, please{' '}
            <EuiLink
              color="ghost"
              href={EXTERNAL_LINKS.githubIssues}
              external={false}
              target="_blank"
              data-testid="contact-us"
            >
              contact us
            </EuiLink>
            .
          </span>
        </p>
      }
    />
  </div>
)

export default EmptyPrompt
