import React from 'react'
import { EuiTextColor } from '@elastic/eui'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  EmptyButton,
} from 'uiSrc/components/base/forms/buttons'

export interface Props {
  onClose?: () => void
  instanceId?: string
}

// TODO: use i18n file for texts
const EncryptionErrorContent = (props: Props) => {
  const { onClose, instanceId } = props
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
    const iId = instanceId || getInstanceIdFromUrl()
    dispatch(
      updateUserConfigSettingsAction({ agreements: { encryption: false } }),
    )
    if (instanceId) {
      history.push(Pages.homeEditInstance(iId))
    }
    if (onClose) {
      onClose()
    }
  }
  return (
    <>
      <EuiTextColor color="danger">
        <b>Check the system keychain or disable encryption to proceed.</b>
      </EuiTextColor>
      <Spacer />
      <EuiTextColor color="danger" style={{ fontWeight: 300 }}>
        Disabling encryption will result in storing sensitive information
        locally in plain text. Re-enter database connection information to work
        with databases.
      </EuiTextColor>
      <Spacer />
      <Row justify="end" gap="m">
        <FlexItem>
          <div>
            <DestructiveButton
              onClick={disableEncryption}
              className="toast-danger-btn euiBorderWidthThick"
              data-testid="toast-action-btn"
            >
              Disable Encryption
            </DestructiveButton>
          </div>
        </FlexItem>
        <FlexItem>
          <EmptyButton
            variant="destructive"
            onClick={onClose}
            data-testid="toast-cancel-btn"
            className="toast-danger-btn"
          >
            Cancel
          </EmptyButton>
        </FlexItem>
      </Row>
    </>
  )
}
export default EncryptionErrorContent
