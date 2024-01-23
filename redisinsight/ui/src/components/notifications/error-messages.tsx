import React from 'react'
import { EuiTextColor } from '@elastic/eui'
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import RdiDeployErrorContent from './components/rdi-deploy-error-content'
import { EncryptionErrorContent, DefaultErrorContent } from './components'
import CloudCapiUnAuthorizedErrorContent from './components/cloud-capi-unauthorized'

const TOAST_LIFE_TIME = 1000 * 60 * 60 * 12 // 12hr

// TODO: use i18n file for texts
export default {
  DEFAULT: (id: string, text: any, onClose = () => {}, title: string = 'Error'): Toast => ({
    id,
    'data-test-subj': 'toast-error',
    color: 'danger',
    iconType: 'alert',
    onClose,
    title: (
      <EuiTextColor color="ghost">
        <b>{title}</b>
      </EuiTextColor>
    ),
    text: <DefaultErrorContent text={text} onClose={onClose} />,
  }),
  ENCRYPTION: (id: string, onClose = () => {}, instanceId = ''): Toast => ({
    id,
    'data-test-subj': 'toast-error-encryption',
    color: 'danger',
    iconType: 'iInCircle',
    onClose,
    toastLifeTimeMs: TOAST_LIFE_TIME,
    title: (
      <EuiTextColor color="ghost">
        <b>Unable to decrypt</b>
      </EuiTextColor>
    ),
    text: <EncryptionErrorContent instanceId={instanceId} onClose={onClose} />,
  }),
  CLOUD_CAPI_KEY_UNAUTHORIZED: (
    { id, message, title }: {
      id: string,
      message: string | JSX.Element,
      title?: string
    },
    additionalInfo: Record<string, any>,
    onClose?: () => void
  ): Toast => ({
    id,
    'data-test-subj': 'toast-error-cloud-capi-key-unauthorized',
    color: 'danger',
    iconType: 'alert',
    onClose,
    title: (
      <EuiTextColor color="ghost">
        <b>{title}</b>
      </EuiTextColor>
    ),
    text: (
      <CloudCapiUnAuthorizedErrorContent
        text={message}
        resourceId={additionalInfo.resourceId}
        onClose={onClose}
      />
    ),
  }),
  RDI_DEPLOY_PIPELINE: (
    { id, title, message }: { id: string, title?: string, message: string },
    onClose?: () => void
  ): Toast => ({
    id,
    'data-test-subj': 'toast-error-deploy',
    color: 'danger',
    iconType: 'alert',
    onClose,
    toastLifeTimeMs: TOAST_LIFE_TIME,
    title: (
      <EuiTextColor color="ghost">
        <b>{title}</b>
      </EuiTextColor>
    ),
    text: <RdiDeployErrorContent message={message} onClose={onClose} />,
  }),
}
