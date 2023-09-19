import React, { useCallback, useContext, useEffect, useState } from 'react'
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
  EuiToolTip,
} from '@elastic/eui'
import { toNumber, filter, get, find, first } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import {
  createFreeDbJob,
  oauthCloudPlanSelector,
  oauthCloudSelector,
  setIsOpenSelectPlanDialog,
  setSocialDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags, Theme } from 'uiSrc/constants'
import { OAuthSocialSource, Region } from 'uiSrc/slices/interfaces'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import TriggeredFunctionsDarkSVG from 'uiSrc/assets/img/sidebar/gears.svg'
import TriggeredFunctionsLightSVG from 'uiSrc/assets/img/sidebar/gears_active.svg'

import { CloudSubscriptionPlanResponse } from 'apiSrc/modules/cloud/subscription/dto'
import { OAuthProvider, OAuthProviders } from './constants'
import styles from './styles.module.scss'

export const DEFAULT_REGIONS = ['us-east-2', 'asia-northeast1']
export const DEFAULT_PROVIDER = OAuthProvider.AWS

const getProviderRegions = (regions: Region[], provider: OAuthProvider) =>
  (find(regions, { provider }) || {}).regions || []

const OAuthSelectPlan = () => {
  const { theme } = useContext(ThemeContext)
  const { isOpenDialog, data: plansInit = [], loading } = useSelector(oauthCloudPlanSelector)
  const { source } = useSelector(oauthCloudSelector)
  const { [FeatureFlags.cloudSso]: cloudSsoFeature = {} } = useSelector(appFeatureFlagsFeaturesSelector)

  const tfRegions: Region[] = get(cloudSsoFeature, 'data.selectPlan.components.triggersAndFunctions', [])
  const rsRegions: Region[] = get(cloudSsoFeature, 'data.selectPlan.components.redisStackPreview', [])

  const [plans, setPlans] = useState(plansInit || [])
  const [planIdSelected, setPlanIdSelected] = useState('')
  const [providerSelected, setProviderSelected] = useState<OAuthProvider>(DEFAULT_PROVIDER)
  const [tfProviderRegions, setTfProviderRegions] = useState(getProviderRegions(tfRegions, providerSelected))
  const [rsProviderRegions, setRsProviderRegions] = useState(getProviderRegions(rsRegions, providerSelected))

  const dispatch = useDispatch()

  const isTFSource = source?.endsWith(OAuthSocialSource.TriggersAndFunctions)

  useEffect(() => {
    setTfProviderRegions(getProviderRegions(tfRegions, providerSelected))
    setRsProviderRegions(getProviderRegions(rsRegions, providerSelected))
  }, [providerSelected, plansInit])

  useEffect(() => {
    if (!plansInit.length) {
      return
    }

    const defaultRegions = isTFSource
      ? [tfProviderRegions, DEFAULT_REGIONS].find((arr) => arr?.length)
      : DEFAULT_REGIONS

    const filteredPlans = filter(plansInit, { provider: providerSelected })
      .sort((a, b) => (a?.details?.displayOrder || 0) - (b?.details?.displayOrder || 0))

    const defaultPlan = filteredPlans.find(({ region = '' }) => defaultRegions?.includes(region))
    const rsPreviewPlan = filteredPlans.find(({ region = '' }) => rsProviderRegions?.includes(region))
    const planId = (defaultPlan || rsPreviewPlan || first(filteredPlans) || {}).id?.toString() || ''

    setPlans(filteredPlans)
    setPlanIdSelected(planId)
  }, [isTFSource, plansInit, providerSelected, tfProviderRegions, rsProviderRegions])

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED,
    })
    setPlanIdSelected('')
    setProviderSelected(DEFAULT_PROVIDER)
    dispatch(setIsOpenSelectPlanDialog(false))
    dispatch(setSocialDialogState(null))
  }, [])

  if (!isOpenDialog) return null

  const getOptionDisplay = (item: CloudSubscriptionPlanResponse) => {
    const { region = '', details: { countryName = '', cityName = '' }, provider } = item
    const tfProviderRegions: string[] = find(tfRegions, { provider })?.regions || []
    const rsProviderRegions: string[] = find(rsRegions, { provider })?.regions || []

    return (
      <EuiText color="subdued" size="s" data-testid={`option-${region}`}>
        {`${countryName} (${cityName})`}
        <EuiTextColor className={styles.regionName}>{region}</EuiTextColor>
        {rsProviderRegions?.includes(region) && (
          <EuiTextColor className={styles.rspreview} data-testid={`rs-text-${region}`}>(Redis 7.2)</EuiTextColor>
        )}
        { tfProviderRegions?.includes(region) && (
          <EuiToolTip
            content="Triggers and functions are available in this region"
            anchorClassName={styles.tfOptionIconTooltip}
          >
            <EuiIcon
              type={theme === Theme.Dark ? TriggeredFunctionsDarkSVG : TriggeredFunctionsLightSVG}
              className={styles.tfOptionIcon}
              data-testid={`tf-icon-${region}`}
            />
          </EuiToolTip>
        )}
      </EuiText>
    )
  }

  const regionOptions: EuiSuperSelectOption<string>[] = plans.map(
    (item) => {
      const { id, region = '' } = item
      return {
        value: `${id}`,
        inputDisplay: getOptionDisplay(item),
        dropdownDisplay: getOptionDisplay(item),
        'data-test-subj': `oauth-region-${region}`,
      }
    }
  )

  const isVendorWithTFRegions = !!regionOptions.length
    && !plans.some(({ region = '' }) => tfProviderRegions?.includes(region))

  const onChangeRegion = (region: string) => {
    setPlanIdSelected(region)
  }

  const handleSubmit = () => {
    dispatch(createFreeDbJob({
      name: CloudJobName.CreateFreeSubscriptionAndDatabase,
      resources: { planId: toNumber(planIdSelected) },
      onSuccessAction: () => {
        dispatch(setIsOpenSelectPlanDialog(false))
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)))
      }
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
            { OAuthProviders.map(({ icon, id, label }) => (
              <div className={styles.provider} key={id}>
                {id === providerSelected
                  && <div className={cx(styles.providerActiveIcon)}><EuiIcon type="check" /></div>}
                <EuiButton
                  iconType={icon}
                  onClick={() => setProviderSelected(id)}
                  className={cx(styles.providerBtn, { [styles.activeProvider]: id === providerSelected })}
                />
                <EuiText className={styles.providerLabel}>{label}</EuiText>
              </div>
            )) }
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
            {isVendorWithTFRegions && (
              <EuiText className={styles.selectDescription} data-testid="select-region-select-description">
                This vendor does not support triggers and functions capability.
              </EuiText>
            )}
            {!regionOptions.length && (
              <EuiText className={styles.selectDescription} data-testid="select-region-select-description">
                No regions available, try another vendor.
              </EuiText>
            )}
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
              Create database
            </EuiButton>
          </footer>
        </section>
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSelectPlan
