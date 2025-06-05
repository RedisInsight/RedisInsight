import React from 'react'
import { EuiTitle } from '@elastic/eui'

import { Text } from 'uiSrc/components/base/text'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const TooLongKeyNameDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="too-long-key-name">
    <EuiTitle>
      <h4>The key name is too long</h4>
    </EuiTitle>
    <Text size="s">Details cannot be displayed.</Text>
  </TextDetailsWrapper>
)

export default TooLongKeyNameDetails
