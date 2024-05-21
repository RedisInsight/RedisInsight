import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

export const ASSISTANCE_CHAT_AGREEMENTS = (
  <>
    <EuiText size="xs">
      Redis Copilot is powered by OpenAI API and is designed for general information only.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      Please do not input any personal data or confidential information.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      By accessing and/or using Redis Copilot, you acknowledge that you agree to the
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://redis.io/legal/redis-copilot-terms-of-use/"
      >
        REDIS COPILOT TERMS
      </EuiLink>
      {' '}
      and
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://redis.com/legal/privacy-policy/"
      >
        Privacy Policy
      </EuiLink>
      .
    </EuiText>
  </>
)

export const EXPERT_CHAT_AGREEMENTS = (
  <>
    <EuiText size="xs">
      Redis Copilot is powered by OpenAI API.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      Please do not include any personal
      data (except as expressly required for the use of Redis Copilot) or confidential information.
    </EuiText>
    <EuiText size="xs">
      Redis Copilot needs access to the information in your database to provide you context-aware assistance.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      By accepting these terms, you consent to the processing of any information included in your database,
      and you agree to the
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://redis.io/legal/redis-copilot-terms-of-use/"
      >
        REDIS COPILOT TERMS
      </EuiLink>
      {' '}
      and
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://redis.com/legal/privacy-policy/"
      >
        Privacy Policy
      </EuiLink>
      .
    </EuiText>
  </>
)
