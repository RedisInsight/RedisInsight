import React from 'react'
import { EuiTextColor } from '@elastic/eui'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <EuiTextColor color="danger">{text}</EuiTextColor>
)

export default DefaultErrorContent
