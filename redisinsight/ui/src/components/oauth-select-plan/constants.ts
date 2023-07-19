import { ReactComponent as AzureIcon } from 'uiSrc/assets/img/oauth/azure_provider.svg'
import { ReactComponent as AWSIcon } from 'uiSrc/assets/img/oauth/aws_provider.svg'
import { ReactComponent as GoogleIcon } from 'uiSrc/assets/img/oauth/google_provider.svg'

export enum OAuthProvider {
  AWS = 'AWS',
  Azure = 'Azure',
  Google = 'GCP',
}

export const OAuthProviders = [{
  id: OAuthProvider.AWS,
  icon: AWSIcon,
  label: 'Amazon Web Services',
}, {
  id: OAuthProvider.Google,
  icon: GoogleIcon,
  label: 'Google Cloud',
}, {
  id: OAuthProvider.Azure,
  icon: AzureIcon,
  label: 'Microsoft Azure',
}]
