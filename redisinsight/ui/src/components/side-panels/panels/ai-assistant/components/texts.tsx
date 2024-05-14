import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

export const ASSISTANCE_CHAT_AGREEMENTS = (
  <>
    <EuiText size="xs">
      Redis Copilot is powered by
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://chat.openai.com/"
      >
        OpenAI ChatGPT
      </EuiLink>
      {' '}
      and is designed for general information only.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      Please do not input any personal data or confidential information.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      By accessing and/or using Redis Copilot, you acknowledge that you agree to our
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://redis.com/legal/redis-website-terms-of-use/"
      >
        Terms of Use
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
      Redis Copilot is powered by
      {' '}
      <EuiLink
        color="subdued"
        external={false}
        target="_blank"
        href="https://chat.openai.com/"
      >
        OpenAI ChatGPT
      </EuiLink>
      .
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      Please do not include any personal data (except as expressly required for the use of Redis Copilot)
      or confidential information.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      By accepting these terms, you consent to the processing of any information included in your database,
      and you agree to the REDIS COPILOT TERMS and
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
