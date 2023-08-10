import { Nullable } from 'uiSrc/utils'
import { Instance } from 'uiSrc/slices/interfaces/instances'

import { CloudJobInfo, CloudJobStatus } from 'apiSrc/modules/cloud/job/models'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import { CloudSubscriptionPlanResponse } from 'apiSrc/modules/cloud/subscription/dto'

export interface CloudJobInfoState extends Omit<CloudJobInfo, 'status'> {
  status: '' | CloudJobStatus
}

export interface StateAppOAuth {
  loading: boolean
  error: string
  message: string
  source: Nullable<OAuthSocialSource>
  job: Nullable<CloudJobInfoState>
  user: {
    error: string
    loading: boolean
    data: Nullable<CloudUser>
    freeDb: CloudUserFreeDbState
  }
  plan: {
    isOpenDialog: boolean
    data: CloudSubscriptionPlanResponse[]
    loading: boolean
  }
  isOpenSocialDialog: boolean
  isOpenSignInDialog: boolean
  isOpenSelectAccountDialog: boolean
  showProgress: boolean
  capiKeys: {
    loading: boolean
    data: Nullable<CloudCapiKey[]>
  }
  agreement: boolean
}

export interface CloudCapiKey {
  id: string
  name: string
  valid: boolean
  createdAt: string
  lastUsed?: string
}

export interface CloudUserFreeDbState {
  loading: boolean
  error: string
  data: Nullable<Instance>
}

export enum OAuthSocialSource {
  ListOfDatabases = 'list of databases',
  WelcomeScreen = 'welcome screen',
  BrowserContentMenu = 'browser content menu',
  BrowserFiltering = 'browser filtering',
  BrowserSearch = 'browser search',
  RediSearch = 'workbench RediSearch',
  RedisJSON = 'workbench RedisJSON',
  RedisTimeSeries = 'workbench RedisTimeSeries',
  RedisGraph = 'workbench RedisGraph',
  RedisBloom = 'workbench RedisBloom',
  Autodiscovery = 'autodiscovery',
  SettingsPage = 'settings',
  ConfirmationMessage = 'confirmation message'
}
