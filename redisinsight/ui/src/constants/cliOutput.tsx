import { EuiLink, EuiTextColor } from '@elastic/eui'
import React, { Fragment } from 'react'
import { getRouterLinkProps } from 'uiSrc/services'
import { getDbIndex } from 'uiSrc/utils'
import UsePubSubLink from 'uiSrc/components/pub-sub/UsePubSubLink'

export const ClearCommand = 'clear'
export const SelectCommand = 'select'

export enum CliOutputFormatterType {
  Text = 'TEXT',
  Raw = 'RAW',
}

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
  PSUBSCRIBE_COMMAND: (path: string = '') => (
    <EuiTextColor color="danger" key={Date.now()}>
      {'Use '}
      <EuiLink {...getRouterLinkProps(path)} color="text" data-test-subj="pubsub-page-btn">
        Pub/Sub
      </EuiLink>
      {' to see the messages published to all channels in your database.'}
    </EuiTextColor>
  ),
  PSUBSCRIBE_COMMAND_CLI: (path: string = '') => (
    [
      cliTexts.PSUBSCRIBE_COMMAND(path),
      '\n',
    ]
  ),
  SUBSCRIBE_COMMAND_CLI: (path: string = '') => (
    [
      <UsePubSubLink path={path} />,
      '\n',
    ]
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
