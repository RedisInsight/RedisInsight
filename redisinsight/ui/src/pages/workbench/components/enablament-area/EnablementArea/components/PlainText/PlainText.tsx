import React from 'react'
import { EuiText } from '@elastic/eui'

export interface Props {
  children: React.ReactElement | string;
}
const PlainText = ({ children }: Props) => (
  <EuiText
    style={{ whiteSpace: 'nowrap', width: 'auto' }}
    color="subdued"
    size="m"
  >
    {children}
  </EuiText>
)

export default PlainText
