import React from 'react'
import {
  EuiButton,
  EuiIcon,
  EuiLink,
  EuiLoadingSpinner,
  EuiText,
  EuiTitle,
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
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from './styles.module.scss'

export enum InfiniteMessagesIds {
  oAuthProgress = 'oAuthProgress',
  oAuthSuccess = 'oAuthSuccess',
  autoCreateDb = 'autoCreateDb',
  databaseExists = 'databaseExists',
  databaseImportForbidden = 'databaseImportForbidden',
  subscriptionExists = 'subscriptionExists',
  appUpdateAvailable = 'appUpdateAvailable',
  pipelineDeploySuccess = 'pipelineDeploySuccess',
}

const MANAGE_DB_LINK = getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
  campaign: UTM_CAMPAINGS.Main,
  medium: UTM_MEDIUMS.Main,
})

export const INFINITE_MESSAGES = {
  AUTHENTICATING: () => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div role="presentation" data-testid="authenticating-notification">
        <Row justify="end">
          <FlexItem>
            <EuiLoadingSpinner
              className={cx('infiniteMessage__icon', styles.loading)}
            />
          </FlexItem>
          <FlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>Authenticating…</span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several seconds, but it is totally worth it!
            </EuiText>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div role="presentation" data-testid="pending-create-db-notification">
        <Row justify="end">
          <FlexItem grow={false}>
            <EuiLoadingSpinner
              className={cx('infiniteMessage__icon', styles.loading)}
            />
          </FlexItem>
          <FlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                {(step === CloudJobStep.Credentials || !step) &&
                  'Processing Cloud API keys…'}
                {step === CloudJobStep.Subscription &&
                  'Processing Cloud subscriptions…'}
                {step === CloudJobStep.Database &&
                  'Creating a free trial Cloud database…'}
                {step === CloudJobStep.Import &&
                  'Importing a free trial Cloud database…'}
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
            <Spacer size="m" />
            <EuiText size="xs">
              You can continue working in Redis Insight, and we will notify you
              once done.
            </EuiText>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  SUCCESS_CREATE_DB: (
    details: Omit<CloudSuccessResult, 'resourceId'>,
    onSuccess: () => void,
    jobName: Maybe<CloudJobName>,
  ) => {
    const vendor = find(OAuthProviders, ({ id }) => id === details.provider)
    const withFeed =
      jobName &&
      [
        CloudJobName.CreateFreeDatabase,
        CloudJobName.CreateFreeSubscriptionAndDatabase,
      ].includes(jobName)
    const text = `You can now use your Redis Cloud database${withFeed ? ' with pre-loaded sample data' : ''}.`
    return {
      id: InfiniteMessagesIds.oAuthSuccess,
      className: 'wide',
      Inner: (
        <div
          role="presentation"
          onMouseDown={(e) => {
            e.preventDefault()
          }}
          onMouseUp={(e) => {
            e.preventDefault()
          }}
          data-testid="success-create-db-notification"
        >
          <Row justify="end">
            <FlexItem className="infiniteMessage__icon">
              <EuiIcon type={ChampagneIcon} size="original" />
            </FlexItem>
            <FlexItem grow>
              <EuiTitle className="infiniteMessage__title">
                <span>Congratulations!</span>
              </EuiTitle>
              <EuiText size="xs">
                {text}
                <Spacer size="s" />
                <b>Notice:</b> the database will be deleted after 15 days of
                inactivity.
              </EuiText>
              {!!details && (
                <>
                  <Spacer size="m" />
                  <Divider variant="fullWidth" />
                  <Spacer size="m" />
                  <Row className={styles.detailsRow} justify="between">
                    <FlexItem>
                      <EuiText size="xs">Plan</EuiText>
                    </FlexItem>
                    <FlexItem data-testid="notification-details-plan">
                      <EuiText size="xs">Free</EuiText>
                    </FlexItem>
                  </Row>
                  <Row className={styles.detailsRow} justify="between">
                    <FlexItem>
                      <EuiText size="xs">Cloud Vendor</EuiText>
                    </FlexItem>
                    <FlexItem
                      className={styles.vendorLabel}
                      data-testid="notification-details-vendor"
                    >
                      {!!vendor?.icon && <EuiIcon type={vendor?.icon} />}
                      <EuiText size="xs">{vendor?.label}</EuiText>
                    </FlexItem>
                  </Row>
                  <Row className={styles.detailsRow} justify="between">
                    <FlexItem>
                      <EuiText size="xs">Region</EuiText>
                    </FlexItem>
                    <FlexItem data-testid="notification-details-region">
                      <EuiText size="xs">{details.region}</EuiText>
                    </FlexItem>
                  </Row>
                </>
              )}
              <Spacer size="m" />
              <Row justify="between" align="center">
                <FlexItem>
                  <ExternalLink href={MANAGE_DB_LINK}>Manage DB</ExternalLink>
                </FlexItem>
                <FlexItem>
                  <EuiButton
                    fill
                    size="s"
                    color="secondary"
                    onClick={() => onSuccess()}
                    data-testid="notification-connect-db"
                  >
                    Connect
                  </EuiButton>
                </FlexItem>
              </Row>
            </FlexItem>
          </Row>
        </div>
      ),
    }
  },
  DATABASE_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="database-exists-notification"
      >
        <EuiTitle className="infiniteMessage__title">
          <span>You already have a free trial Redis Cloud subscription.</span>
        </EuiTitle>
        <EuiText size="xs">
          Do you want to import your existing database into Redis Insight?
        </EuiText>
        <Spacer size="m" />
        <Row justify="between">
          <FlexItem>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess?.()}
              data-testid="import-db-sso-btn"
            >
              Import
            </EuiButton>
          </FlexItem>
          <FlexItem>
            <EuiButton
              size="s"
              color="secondary"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-import-db-sso-btn"
            >
              Cancel
            </EuiButton>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  DATABASE_IMPORT_FORBIDDEN: (onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseImportForbidden,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="database-import-forbidden-notification"
      >
        <EuiTitle className="infiniteMessage__title">
          <span>Unable to import Cloud database.</span>
        </EuiTitle>
        <EuiText size="xs">
          Adding your Redis Cloud database to Redis Insight is disabled due to a
          setting restricting database connection management.
          <Spacer size="m" />
          Log in to{' '}
          <EuiLink
            target="_blank"
            color="text"
            external={false}
            tabIndex={-1}
            href="https://cloud.redis.io/#/databases?utm_source=redisinsight&utm_medium=main&utm_campaign=disabled_db_management"
          >
            Redis Cloud
          </EuiLink>{' '}
          to check your database.
        </EuiText>
        <Spacer size="m" />
        <Row justify="end">
          <FlexItem>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onClose?.()}
              data-testid="database-import-forbidden-notification-ok-btn"
            >
              Ok
            </EuiButton>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  SUBSCRIPTION_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.subscriptionExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="subscription-exists-notification"
      >
        <EuiTitle className="infiniteMessage__title">
          <span>
            Your subscription does not have a free trial Redis Cloud database.
          </span>
        </EuiTitle>
        <EuiText size="xs">
          Do you want to create a free trial database in your existing
          subscription?
        </EuiText>
        <Spacer size="m" />
        <Row justify="between">
          <FlexItem>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess?.()}
              data-testid="create-subscription-sso-btn"
            >
              Create
            </EuiButton>
          </FlexItem>
          <FlexItem>
            <EuiButton
              size="s"
              color="secondary"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-create-subscription-sso-btn"
            >
              Cancel
            </EuiButton>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    Inner: (
      <div role="presentation" data-testid="pending-create-db-notification">
        <Row justify="end">
          <FlexItem>
            <EuiLoadingSpinner
              className={cx('infiniteMessage__icon', styles.loading)}
            />
          </FlexItem>
          <FlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>Connecting to your database</span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  APP_UPDATE_AVAILABLE: (version: string, onSuccess?: () => void) => ({
    id: InfiniteMessagesIds.appUpdateAvailable,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="app-update-available-notification"
      >
        <EuiTitle className="infiniteMessage__title">
          <span>New version is now available</span>
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
    ),
  }),
  SUCCESS_DEPLOY_PIPELINE: () => ({
    id: InfiniteMessagesIds.pipelineDeploySuccess,
    className: 'wide',
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="success-deploy-pipeline-notification"
      >
        <Row justify="end">
          <FlexItem className="infiniteMessage__icon">
            <EuiIcon type={ChampagneIcon} size="original" />
          </FlexItem>
          <FlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>Congratulations!</span>
            </EuiTitle>
            <EuiText size="xs">
              Deployment completed successfully!
              <br />
              Check out the pipeline statistics page.
            </EuiText>
            <Spacer size="m" />
            {/* // TODO remove display none when statistics page will be available */}
            <Row style={{ display: 'none' }} justify="end" align="center">
              <FlexItem>
                <EuiButton
                  fill
                  size="s"
                  color="secondary"
                  onClick={() => {}}
                  data-testid="notification-connect-db"
                >
                  Statistics
                </EuiButton>
              </FlexItem>
            </Row>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
}
