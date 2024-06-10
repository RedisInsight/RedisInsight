import React from 'react'
import { useHistory } from 'react-router-dom'
import { EuiButton } from '@elastic/eui'

export interface Props {
  path: string
  text: string
  dataTestid?: string
  onClick?: () => void
}

const InternalLink = (props: Props) => {
  const { path, text, onClick, dataTestid } = props

  const history = useHistory()

  const handleClick = () => {
    // can replace parameters here if needed (instanceId or rdiInstanceId)
    history.push(path)
    onClick?.()
  }
  return (
    <EuiButton
      fill
      color="secondary"
      size="s"
      onClick={handleClick}
      data-testid={dataTestid || 'internal-link'}
    >
      {text}
    </EuiButton>
  )
}

export default InternalLink
