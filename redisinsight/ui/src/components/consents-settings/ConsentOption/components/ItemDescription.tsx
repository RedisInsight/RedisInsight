import { EuiLink } from '@elastic/eui'
import parse from 'html-react-parser'
import React from 'react'

interface ItemDescriptionProps {
  description: string;
  withLink: boolean;
}

export const ItemDescription = ({ description, withLink }: ItemDescriptionProps) => (
    <>
      {description && parse(description)}
      {withLink && (
        <>
          <EuiLink
            external={false}
            target="_blank"
            href="https://redis.io/legal/privacy-policy/?utm_source=redisinsight&utm_medium=app&utm_campaign=telemetry"
          >
            Privacy Policy
          </EuiLink>
          .
        </>
      )}
    </>
)