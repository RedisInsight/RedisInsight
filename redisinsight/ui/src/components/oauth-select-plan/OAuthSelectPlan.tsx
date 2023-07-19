import React, { useCallback, useEffect, useState } from 'react'
import {
  EuiButton,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui'
import { toNumber, filter } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import {
  createFreeDbJob,
  oauthCloudPlanSelector,
  setIsOpenSelectPlanDialog,
} from 'uiSrc/slices/oauth/cloud'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'

import { OAuthProvider, OAuthProviders } from './constants'
import { INFINITE_MESSAGES } from '../notifications/components'
import styles from './styles.module.scss'

export const DEFAULT_REGION = 'us-east-1'
export const DEFAULT_PROVIDER = OAuthProvider.AWS

const OAuthSelectPlan = () => {
  const { isOpenDialog, data: plansInit = [], loading } = useSelector(oauthCloudPlanSelector)

  const [plans, setPlans] = useState(plansInit || [])
  const [planIdSelected, setPlanIdSelected] = useState('')
  const [providerSelected, setProviderSelected] = useState<OAuthProvider>(DEFAULT_PROVIDER)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!plansInit.length) {
      return
    }

    const newPlans = filter(plansInit, { provider: providerSelected })
      .sort((a, b) => a?.details?.displayOrder - b?.details?.displayOrder)
    const planId = newPlans?.find(({ region }) => region === DEFAULT_REGION)?.id?.toString()
      || newPlans[0]?.id?.toString()
      || ''

    setPlans(newPlans)
    setPlanIdSelected(planId)
  }, [plansInit, providerSelected])

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED,
    })
    setPlanIdSelected('')
    setProviderSelected(DEFAULT_PROVIDER)
    dispatch(setIsOpenSelectPlanDialog(false))
  }, [])

  if (!isOpenDialog) return null

  const regionOptions: EuiSuperSelectOption<string>[] = plans.map(
    (item) => {
      const { id, region, details: { countryName = '', cityName = '' } } = item
      return {
        value: `${id}`,
        inputDisplay: (
          <EuiText color="subdued" size="s">
            {`${countryName} (${cityName})`}
            <EuiTextColor className={styles.regionName}>{region}</EuiTextColor>
          </EuiText>
        ),
        dropdownDisplay: (
          <EuiText color="subdued" size="s">
            {`${countryName} (${cityName})`}
            <EuiTextColor className={styles.regionName}>{region}</EuiTextColor>
          </EuiText>
        ),
        'data-test-subj': `oauth-region-${region}`,
      }
    }
  )

  const onChangeRegion = (region: string) => {
    setPlanIdSelected(region)
  }

  const handleSubmit = () => {
    dispatch(createFreeDbJob(toNumber(planIdSelected),
      () => {
        dispatch(setIsOpenSelectPlanDialog(false))
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB))
      }))
  }

  return (
    <EuiModal className={styles.container} onClose={handleOnClose} data-testid="oauth-select-plan-dialog">
      <EuiModalBody className={styles.modalBody}>
        <section className={styles.content}>
          <EuiText className={styles.subTitle}>
            Redis Enterprise Cloud
          </EuiText>
          <EuiTitle size="s">
            <h2 className={styles.title}>Select cloud vendor</h2>
          </EuiTitle>
          <section className={styles.providers}>
            {OAuthProviders.map(({ icon, id, label, className = '' }) => (
              <div className={styles.provider}>
                {id === providerSelected
                  && <div className={cx(styles.providerActiveIcon, className)}><EuiIcon type="check" /></div>}
                <EuiButton
                  iconType={icon}
                  onClick={() => setProviderSelected(id)}
                  className={cx(styles.providerBtn, { [styles.activeProvider]: id === providerSelected })}
                />
                <EuiText className={styles.providerLabel}>{label}</EuiText>
              </div>
            ))}
          </section>
          <section className={styles.region}>
            <EuiText className={styles.regionLabel}>Region</EuiText>
            <EuiSuperSelect
              fullWidth
              itemClassName={styles.regionSelectItem}
              className={styles.regionSelect}
              disabled={loading || !regionOptions.length}
              isLoading={loading}
              options={regionOptions}
              valueOfSelected={planIdSelected}
              onChange={onChangeRegion}
              data-testid="select-oauth-region"
            />
          </section>
          <footer className={styles.footer}>
            <EuiButton
              className={styles.button}
              onClick={handleOnClose}
              data-testid="close-oauth-select-plan-dialog"
              aria-labelledby="close oauth select plan dialog"
            >
              Cancel
            </EuiButton>
            <EuiButton
              fill
              isDisabled={loading || !planIdSelected}
              isLoading={loading}
              color="secondary"
              className={styles.button}
              onClick={handleSubmit}
              data-testid="submit-oauth-select-plan-dialog"
              aria-labelledby="submit oauth select plan dialog"
            >
              Create subscription
            </EuiButton>
          </footer>
        </section>
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSelectPlan
