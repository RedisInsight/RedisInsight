import React from 'react'
import { EuiText } from '@elastic/eui'

import { Title } from 'uiSrc/components/base/text/Title'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const TooLongKeyNameDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="too-long-key-name">
    <Title size="M">The key name is too long</Title>
    <EuiText size="s">Details cannot be displayed.</EuiText>
  </TextDetailsWrapper>
)

export default TooLongKeyNameDetails
