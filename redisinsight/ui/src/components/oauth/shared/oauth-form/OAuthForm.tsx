import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { signIn } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialAction, OAuthStrategy } from 'uiSrc/slices/interfaces'
import { ipcAuth } from 'uiSrc/electron/utils'
import OAuthSsoForm from './components/oauth-sso-form'
import OAuthSocialButtons from '../oauth-social-buttons'
import { Props as OAuthSocialButtonsProps } from '../oauth-social-buttons/OAuthSocialButtons'

export interface Props extends OAuthSocialButtonsProps {
  action: OAuthSocialAction
  children: (
    form: React.ReactNode,
  ) => JSX.Element
}

const OAuthForm = ({
  children,
  action,
  onClick,
  ...rest
}: Props) => {
  const dispatch = useDispatch()

  const [authStrategy, setAuthStrategy] = useState('')

  useEffect(() => () => {
    setAuthStrategy('')
  }, [])

  const initOAuthProcess = (strategy: OAuthStrategy, action: string, data?: {}) => {
    dispatch(signIn())
    onClick?.(strategy)
    ipcAuth(strategy, action, data)
  }

  const onSocialButtonClick = (authStrategy: OAuthStrategy) => {
    setAuthStrategy(authStrategy)

    switch (authStrategy) {
      case OAuthStrategy.Google:
      case OAuthStrategy.GitHub:
        initOAuthProcess(authStrategy, action)
        break
      case OAuthStrategy.SSO:
        // ignore. sso email form will be shown
        break
      default:
        break
    }
  }

  if (authStrategy === OAuthStrategy.SSO) {
    return (
      <OAuthSsoForm
        onBack={() => setAuthStrategy('')}
        onSubmit={(data: {}) => initOAuthProcess(OAuthStrategy.SSO, action, data)}
      />
    )
  }

  return (
    children(
      <OAuthSocialButtons
        onClick={onSocialButtonClick}
        {...rest}
      />
    )
  )
}

export default OAuthForm
