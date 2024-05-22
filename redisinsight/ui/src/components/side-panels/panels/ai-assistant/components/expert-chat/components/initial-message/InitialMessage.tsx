import React from 'react'
import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui'

export interface Props {
  onClickTutorial: () => void
}

const InitialMessage = (props: Props) => {
  const { onClickTutorial } = props

  return (
    <>
      <EuiText size="xs">Welcome!</EuiText>
      <EuiText size="xs">I am here to help you get started with data querying.</EuiText>
      <EuiText size="xs">Type <b>/help</b> to get more info on what questions I can answer.</EuiText>
      <EuiSpacer />
      <EuiText size="xs">With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!</EuiText>
      <EuiSpacer />
      <EuiText size="xs">
        Explore several common Redis use cases with our
        {' '}
        <EuiLink
          color="subdued"
          external={false}
          className="defaultLink"
          onClick={onClickTutorial}
          data-testid="tutorial-initial-message-link"
        >
          tutorial
        </EuiLink>
        , utilizing the provided sample data.
      </EuiText>
    </>
  )
}

export default InitialMessage
