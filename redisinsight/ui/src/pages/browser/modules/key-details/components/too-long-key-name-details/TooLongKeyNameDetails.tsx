import React from 'react'
import { EuiText, EuiTitle } from '@elastic/eui'

import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const TooLongKeyNameDetails = ({ onClose }: { onClose: () => void}) => (
  <TextDetailsWrapper onClose={onClose} testid="too-long-key-name">
    <EuiTitle>
      <h4>The key name is too long</h4>
    </EuiTitle>
    <EuiText size="s">
      Details cannot be displayed.
    </EuiText>
  </TextDetailsWrapper>
)

export default TooLongKeyNameDetails
