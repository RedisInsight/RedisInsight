import React from 'react'
import { EuiButton } from '@elastic/eui'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { CustomErrorCodes } from 'uiSrc/constants'
import { AiChatErrors } from 'uiSrc/constants/apiErrors'
import ApiStatusCode from 'uiSrc/constants/apiStatusCode'

import RestartChat from '../restart-chat'

import styles from './styles.module.scss'

export interface Props {
  error?: { statusCode: number, errorCode?: number }
  onRestart: () => void
}

const ErrorMessage = (props: Props) => {
  const { error, onRestart } = props

  const getErrorMessage = (error?: { statusCode: number, errorCode?: number }): string => {
    if (error?.statusCode === ApiStatusCode.Timeout) return AiChatErrors.Timeout
    if (error?.errorCode === CustomErrorCodes.GeneralAiUnexpectedError) return AiChatErrors.DefaultUnexpected
    if (error?.errorCode === CustomErrorCodes.CloudApiUnauthorized) return AiChatErrors.CloudAuthorization

    return AiChatErrors.Default
  }

  if (!error) return null

  const isShowRestart = error.errorCode !== CustomErrorCodes.CloudApiUnauthorized
    && error.errorCode !== CustomErrorCodes.GeneralAiUnexpectedError
    && error.statusCode !== ApiStatusCode.Timeout

  return (
    <>
      <div className={styles.errorMessage} data-testid="ai-chat-error-message">
        {getErrorMessage(error)}
        {' '}
        <a
          className="link-underline"
          href={EXTERNAL_LINKS.githubIssues}
          data-testid="ai-chat-error-report-link"
          target="_blank"
          rel="noreferrer"
        >
          report the issue
        </a>
      </div>
      {isShowRestart && (
        <RestartChat
          anchorClassName={styles.restartSessionWrapper}
          button={(
            <EuiButton
              size="s"
              color="secondary"
              iconType="eraser"
              className={styles.restartSessionBtn}
              data-testid="ai-chat-error-restart-session-btn"
            >
              Restart session
            </EuiButton>
          )}
          onConfirm={onRestart}
        />
      )}
    </>
  )
}

export default ErrorMessage
