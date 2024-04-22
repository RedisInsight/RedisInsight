import AzureIcon from 'uiSrc/assets/img/oauth/azure_provider.svg?react'
import AWSIcon from 'uiSrc/assets/img/oauth/aws_provider.svg?react'
import GoogleIcon from 'uiSrc/assets/img/oauth/google_provider.svg?react'

import styles from './styles.module.scss'

export enum OAuthProvider {
  AWS = 'AWS',
  Azure = 'Azure',
  Google = 'GCP',
}

export const OAuthProviders = [{
  id: OAuthProvider.AWS,
  icon: AWSIcon,
  label: 'Amazon Web Services',
  className: styles.awsIcon
}, {
  id: OAuthProvider.Google,
  icon: GoogleIcon,
  label: 'Google Cloud',
}, {
  id: OAuthProvider.Azure,
  icon: AzureIcon,
  label: 'Microsoft Azure',
}]
