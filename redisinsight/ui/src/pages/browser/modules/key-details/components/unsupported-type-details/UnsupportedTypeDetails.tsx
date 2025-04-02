import React from 'react'
import { EuiText, EuiTitle } from '@elastic/eui'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper';

import styles from './styles.module.scss'

const UnsupportedTypeDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="unsupported-type">
    <EuiTitle>
      <h4>This key type is not currently supported.</h4>
    </EuiTitle>
    <EuiText size="s">
      See{' '}
      <a
        href={EXTERNAL_LINKS.githubRepo}
        className={styles.link}
        target="_blank"
        rel="noreferrer"
      >
        our repository
      </a>
      {' '}for the list of supported key types.
    </EuiText>
  </TextDetailsWrapper>
)

export default UnsupportedTypeDetails
