import React from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiTitle
} from '@elastic/eui'
import { find } from 'lodash'
import cx from 'classnames'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import ExternalLink from 'uiSrc/components/base/external-link'
import ChampagneIcon from 'uiSrc/assets/img/icons/champagne.svg'
import Divider from 'uiSrc/components/divider/Divider'
import { OAuthProviders } from 'uiSrc/components/oauth/oauth-select-plan/constants'

import { CloudSuccessResult } from 'uiSrc/slices/interfaces'

import { Maybe } from 'uiSrc/utils'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import styles from './styles.module.scss'

export enum InfiniteMessagesIds {
  oAuthProgress = 'oAuthProgress',
  oAuthSuccess = 'oAuthSuccess',
  autoCreateDb = 'autoCreateDb',
  databaseExists = 'databaseExists',
  subscriptionExists = 'subscriptionExists',
  appUpdateAvailable = 'appUpdateAvailable',
  pipelineDeploySuccess = 'pipelineDeploySuccess'
}

const MANAGE_DB_LINK = getUtmExternalLink(
  EXTERNAL_LINKS.cloudConsole,
  { campaign: UTM_CAMPAINGS.Main, medium: UTM_MEDIUMS.Main }
)

export const INFINITE_MESSAGES = {
  AUTHENTICATING: () => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div
        role="presentation"
        data-testid="authenticating-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner className={cx('infiniteMessage__icon', styles.loading)} />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                Authenticating…
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several seconds, but it is totally worth it!
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div
        role="presentation"
        data-testid="pending-create-db-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner className={cx('infiniteMessage__icon', styles.loading)} />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                { (step === CloudJobStep.Credentials || !step) && 'Processing Cloud API keys…'}
                { step === CloudJobStep.Subscription && 'Processing Cloud subscriptions…'}
                { step === CloudJobStep.Database && 'Creating a free trial Cloud database…'}
                { step === CloudJobStep.Import && 'Importing a free trial Cloud database…'}
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
            <EuiSpacer size="m" />
            <EuiText size="xs">
              You can continue working in Redis Insight, and we will notify you once done.
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  SUCCESS_CREATE_DB: (details: Omit<CloudSuccessResult, 'resourceId'>, onSuccess: () => void, jobName: Maybe<CloudJobName>) => {
    const vendor = find(OAuthProviders, ({ id }) => id === details.provider)
    const withFeed = jobName
      && [CloudJobName.CreateFreeDatabase, CloudJobName.CreateFreeSubscriptionAndDatabase].includes(jobName)
    const text = `You can now use your Redis Cloud database${withFeed ? ' with pre-loaded sample data' : ''}.`
    return ({
      id: InfiniteMessagesIds.oAuthSuccess,
      className: 'wide',
      Inner: (
        <div
          role="presentation"
          onMouseDown={(e) => { e.preventDefault() }}
          onMouseUp={(e) => { e.preventDefault() }}
          data-testid="success-create-db-notification"
        >
          <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
            <EuiFlexItem className="infiniteMessage__icon" grow={false}>
              <EuiIcon type={ChampagneIcon} size="original" />
            </EuiFlexItem>
            <EuiFlexItem grow>
              <EuiTitle className="infiniteMessage__title"><span>Congratulations!</span></EuiTitle>
              <EuiText size="xs">
                {text}
                <EuiSpacer size="s" />
                <b>Notice:</b> the database will be deleted after 15 days of inactivity.
              </EuiText>
              {!!details && (
                <>
                  <EuiSpacer size="m" />
                  <Divider variant="fullWidth" />
                  <EuiSpacer size="m" />
                  <EuiFlexGroup className={styles.detailsRow} justifyContent="spaceBetween" gutterSize="none">
                    <EuiFlexItem grow={false}><EuiText size="xs">Plan</EuiText></EuiFlexItem>
                    <EuiFlexItem grow={false} data-testid="notification-details-plan">
                      <EuiText size="xs">Free</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiFlexGroup className={styles.detailsRow} justifyContent="spaceBetween" gutterSize="none">
                    <EuiFlexItem grow={false}>
                      <EuiText size="xs">Cloud Vendor</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem className={styles.vendorLabel} grow={false} data-testid="notification-details-vendor">
                      {!!vendor?.icon && <EuiIcon type={vendor?.icon} />}
                      <EuiText size="xs">{vendor?.label}</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiFlexGroup className={styles.detailsRow} justifyContent="spaceBetween" gutterSize="none">
                    <EuiFlexItem grow={false}><EuiText size="xs">Region</EuiText></EuiFlexItem>
                    <EuiFlexItem grow={false} data-testid="notification-details-region">
                      <EuiText size="xs">{details.region}</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </>
              )}
              <EuiSpacer size="m" />
              <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="none">
                <EuiFlexItem grow={false}>
                  <ExternalLink
                    href={MANAGE_DB_LINK}
                  >
                    Manage DB
                  </ExternalLink>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    size="s"
                    color="secondary"
                    onClick={() => onSuccess()}
                    data-testid="notification-connect-db"
                  >
                    Connect
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      )
    })
  },
  DATABASE_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="database-exists-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>You already have a free trial Redis Cloud subscription.</span></EuiTitle>
        <EuiText size="xs">
          Do you want to import your existing database into Redis Insight?
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess?.()}
              data-testid="import-db-sso-btn"
            >
              Import
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-import-db-sso-btn"
            >
              Cancel
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  SUBSCRIPTION_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.subscriptionExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="subscription-exists-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>Your subscription does not have a free trial Redis Cloud database.</span></EuiTitle>
        <EuiText size="xs">
          Do you want to create a free trial database in your existing subscription?
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess?.()}
              data-testid="create-subscription-sso-btn"
            >
              Create
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-create-subscription-sso-btn"
            >
              Cancel
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    Inner: (
      <div
        role="presentation"
        data-testid="pending-create-db-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner className={cx('infiniteMessage__icon', styles.loading)} />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                Connecting to your database
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  APP_UPDATE_AVAILABLE: (version: string, onSuccess?: () => void) => ({
    id: InfiniteMessagesIds.appUpdateAvailable,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="app-update-available-notification"
      >
        <EuiTitle className="infiniteMessage__title">
          <span>
            New version is now available
          </span>
        </EuiTitle>
        <EuiText size="s">
          <>
            With Redis Insight
            {` ${version} `}
            you have access to new useful features and optimizations.
            <br />
            Restart Redis Insight to install updates.
          </>
        </EuiText>
        <br />
        <EuiButton
          fill
          size="s"
          color="secondary"
          onClick={() => onSuccess?.()}
          data-testid="app-restart-btn"
        >
          Restart
        </EuiButton>
      </div>
    )
  }),
  SUCCESS_DEPLOY_PIPELINE: () => ({
    id: InfiniteMessagesIds.pipelineDeploySuccess,
    className: 'wide',
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="success-deploy-pipeline-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem className="infiniteMessage__icon" grow={false}>
            <EuiIcon type={ChampagneIcon} size="original" />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title"><span>Congratulations!</span></EuiTitle>
            <EuiText size="xs">
              Deployment completed successfully!
              <br />
              Check out the pipeline statistics page.
            </EuiText>
            <EuiSpacer size="m" />
            {/* // TODO remove display none when statistics page will be available */}
            <EuiFlexGroup style={{ display: 'none' }} justifyContent="flexEnd" alignItems="center" gutterSize="none">
              <EuiFlexItem grow={false}>
                <EuiButton
                  fill
                  size="s"
                  color="secondary"
                  onClick={() => {}}
                  data-testid="notification-connect-db"
                >
                  Statistics
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  })
}
