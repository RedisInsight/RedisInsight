import React from 'react'
import { EuiLink } from '@elastic/eui'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'

export interface Props {
  url: string
  text: string
  source: OAuthSocialSource
}

const CloudLink = (props: Props) => {
  const { url, text, source = OAuthSocialSource.Tutorials } = props
  return (
    <OAuthSsoHandlerDialog>
      {(ssoCloudHandlerClick) => (
        <EuiLink
          color="text"
          onClick={(e) => {
            ssoCloudHandlerClick(e, {
              source,
              action: OAuthSocialAction.Create,
            })
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
