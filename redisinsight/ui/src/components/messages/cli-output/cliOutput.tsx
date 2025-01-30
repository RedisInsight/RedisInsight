import { EuiLink, EuiTextColor } from '@elastic/eui'
import React, { Fragment } from 'react'
import { getRouterLinkProps } from 'uiSrc/services'
import { getDbIndex } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'

export const InitOutputText = (
  host: string = '',
  port: number = 0,
  dbIndex: number = 0,
  emptyOutput: boolean,
  onClick: () => void,
) => [
  <Fragment key={Math.random()}>
    { emptyOutput && (
      <span className="color-green" key={Math.random()}>
        {'Try '}
        <EuiLink
          onClick={onClick}
          className="color-green"
          style={{ fontSize: 'inherit', fontFamily: 'inherit' }}
          data-test-subj="cli-workbench-page-btn"
        >
          Workbench
        </EuiLink>
        , our advanced CLI. Check out our Quick Guides to learn more about Redis capabilities.
      </span>
    )}
  </Fragment>,
  '\n\n',
  'Connecting...',
  '\n\n',
  'Pinging Redis server on ',
  <EuiTextColor color="default" key={Math.random()}>
    {`${host}:${port}${getDbIndex(dbIndex)}`}
  </EuiTextColor>,
]

export const ConnectionSuccessOutputText = [
  '\n',
  'Connected.',
  '\n',
  'Ready to execute commands.',
  '\n\n',
]

const unsupportedCommandTextCli = ' is not supported by the Redis Insight CLI. The list of all unsupported commands: '
const unsupportedCommandTextWorkbench = ' is not supported by the Workbench. The list of all unsupported commands: '
export const cliTexts = {
  CLI_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextCli + commands,
  WORKBENCH_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextWorkbench + commands,
  REPEAT_COUNT_INVALID: 'Invalid repeat command option value',
  CONNECTION_CLOSED: 'Client connection previously closed. Run the command after the connection is re-created.',
  UNABLE_TO_DECRYPT: 'Unable to decrypt. Check the system keychain or re-run the command.',
  PUB_SUB_NOT_SUPPORTED_ENV: (
    <div className="cli-output-response-fail" data-testid="user-pub-sub-link-disabled">
      PubSub not supported in this environment.
    </div>
  ),
  USE_PSUBSCRIBE_COMMAND: (path: string = '') => (
    <EuiTextColor color="danger" key={Date.now()} data-testid="user-pub-sub-link">
      {'Use '}
      <EuiLink {...getRouterLinkProps(path)} color="text" data-test-subj="pubsub-page-btn">
        Pub/Sub
      </EuiLink>
      {' to see the messages published to all channels in your database.'}
    </EuiTextColor>
  ),
  PSUBSCRIBE_COMMAND: (path: string = '') => (
    <FeatureFlagComponent name={FeatureFlags.envDependent} otherwise={cliTexts.PUB_SUB_NOT_SUPPORTED_ENV}>
      {cliTexts.USE_PSUBSCRIBE_COMMAND(path)}
    </FeatureFlagComponent>
  ),
  PSUBSCRIBE_COMMAND_CLI: (path: string = '') => (
    [
      cliTexts.PSUBSCRIBE_COMMAND(path),
      '\n',
    ]
  ),
  MONITOR_NOT_SUPPORTED_ENV: (
    <div className="cli-output-response-fail" data-testid="user-profiler-link-disabled">
      Monitor not supported in this environment.
    </div>
  ),
  USE_PROFILER_TOOL: (onClick: () => void) => (
    <EuiTextColor color="danger" key={Date.now()}>
      {'Use '}
      <EuiLink onClick={onClick} className="btnLikeLink" color="text" data-testid="monitor-btn">
        Profiler
      </EuiLink>
      {' tool to see all the requests processed by the server.'}
    </EuiTextColor>
  ),
  MONITOR_COMMAND: (onClick: () => void) => (
    <FeatureFlagComponent
      name={FeatureFlags.envDependent}
      otherwise={cliTexts.MONITOR_NOT_SUPPORTED_ENV}
    >
      {cliTexts.USE_PROFILER_TOOL(onClick)}
    </FeatureFlagComponent>
  ),
  USE_PUB_SUB_TOOL: (path: string = '') => (
    <EuiTextColor color="danger" key={Date.now()} data-testid="user-pub-sub-link">
      {'Use '}
      <EuiLink {...getRouterLinkProps(path)} color="text" data-test-subj="pubsub-page-btn">
        Pub/Sub
      </EuiLink>
      {' tool to subscribe to channels.'}
    </EuiTextColor>
  ),
  SUBSCRIBE_COMMAND_CLI: (path: string = '') => (
    <FeatureFlagComponent name={FeatureFlags.envDependent} otherwise={cliTexts.PUB_SUB_NOT_SUPPORTED_ENV}>
      {cliTexts.USE_PUB_SUB_TOOL(path)}
    </FeatureFlagComponent>
  ),
  HELLO3_COMMAND: () => (
    <EuiTextColor color="danger" key={Date.now()}>
      {'Redis Insight does not support '}
      <EuiLink
        href="https://github.com/redis/redis-specifications/blob/master/protocol/RESP3.md"
        className="btnLikeLink"
        color="text"
        target="_blank"
        external={false}
        data-test-subj="hello3-btn"
      >
        RESP3
      </EuiLink>
      {' at the moment, but we are working on it.'}
    </EuiTextColor>
  ),
  HELLO3_COMMAND_CLI: () => (
    [
      cliTexts.HELLO3_COMMAND(),
      '\n',
    ]
  ),
  CLI_ERROR_MESSAGE: (message: string) => (
    [
      '\n',
      <EuiTextColor color="danger" key={Date.now()}>
        {message}
      </EuiTextColor>,
      '\n\n',
    ]
  )
}
