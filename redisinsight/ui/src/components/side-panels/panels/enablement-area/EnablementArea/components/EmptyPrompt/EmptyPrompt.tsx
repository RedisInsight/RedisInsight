import React from 'react'
import { EuiEmptyPrompt, EuiIcon } from '@elastic/eui'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Link } from 'uiSrc/components/base/link/Link'
import styles from './styles.module.scss'

const EmptyPrompt = () => (
  <div className={styles.container}>
    <EuiEmptyPrompt
      data-testid="enablement-area__empty-prompt"
      icon={<EuiIcon type="alert" color="danger" size="l" />}
      title={<h2>No information to display</h2>}
      body={
        <p className={styles.body}>
          <span>Restart the application.</span>
          <br />
          <span>
            If the problem persists, please{' '}
            <Link
              color="ghost"
              href={EXTERNAL_LINKS.githubIssues}
              external={false}
              target="_blank"
              data-testid="contact-us"
            >
              contact us
            </Link>
            .
          </span>
        </p>
      }
    />
  </div>
)

export default EmptyPrompt
