import React from 'react'
import { EuiButton, EuiFlexGroup, EuiSpacer, EuiTextColor, EuiFlexItem } from '@elastic/eui'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'

export interface Props {
  onClose?: () => void;
  instanceId?: string;
}

// TODO: use i18n file for texts
const EncryptionErrorContent = (props: Props) => {
  const { onClose } = props
  const { pathname } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()

  // useParams() hook can't be used because the Notifications component is outside of the MainRouter
  const getInstanceIdFromUrl = (): string => {
    const path = '/:instanceId/(browser|workbench)/'
    const match: any = matchPath(pathname, { path })
    return match?.params?.instanceId
  }

  const disableEncryption = () => {
    const instanceId = props.instanceId || getInstanceIdFromUrl()
    dispatch(updateUserConfigSettingsAction({ agreements: { encryption: false } }))
    if (instanceId) {
      history.push(Pages.homeEditInstance(instanceId))
    }
    if (onClose) {
      onClose()
    }
  }
  return (
    <>
      <EuiTextColor color="ghost">
        <b>Check the system keychain or disable encryption to proceed.</b>
      </EuiTextColor>
      <EuiSpacer />
      <EuiTextColor color="ghost" style={{ fontWeight: 300 }}>
        Disabling encryption will result in storing sensitive information locally in plain text.
        Re-enter database connection information to work with databases.
      </EuiTextColor>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <div>
            <EuiButton
              size="s"
              color="warning"
              onClick={disableEncryption}
              className="toast-danger-btn euiBorderWidthThick"
              data-testid="toast-action-btn"
            >
              Disable Encryption
            </EuiButton>
          </div>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <div>
            <EuiButton
              fill
              size="s"
              color="warning"
              onClick={onClose}
              className="toast-danger-btn"
              data-testid="toast-cancel-btn"
            >
              Cancel
            </EuiButton>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}
export default EncryptionErrorContent
