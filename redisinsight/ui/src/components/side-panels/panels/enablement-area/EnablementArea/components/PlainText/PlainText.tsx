import React from 'react'
import { EuiText } from '@elastic/eui'

export interface Props {
  children: React.ReactElement | string;
  style?: any;
}
const PlainText = ({ children, ...rest }: Props) => (
  <EuiText
    style={{ whiteSpace: 'nowrap', width: 'auto', ...rest.style }}
    color="subdued"
    size="m"
  >
    {children}
  </EuiText>
)

export default PlainText
