import React from 'react'
import { EuiLink } from '@elastic/eui'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'

export interface Props {
  url: string
  text: string
}

const CloudLink = (props: Props) => {
  const { url, text } = props
  return (
    <OAuthSsoHandlerDialog>
      {(ssoCloudHandlerClick) => (
        <EuiLink
          color="text"
          onClick={(e) => {
            ssoCloudHandlerClick(e, OAuthSocialSource.Tutorials)
          }}
          external={false}
          target="_blank"
          href={url}
          data-testid="guide-free-database-link"
        >
          {text}
        </EuiLink>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default CloudLink
