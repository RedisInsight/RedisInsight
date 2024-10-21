export enum AiWsEvents {
  ERROR = 'error',
  CONNECT = 'connect',
  CONNECT_ERROR = 'connect_error',
  TOOL_CALL = 'tool_call', // non-ackable, signals a tool invocation by the agent, client should record in history
  TOOL_REPLY = 'tool', // non-ackable, signals a tool's reply, client should record in history
  REPLY_CHUNK = 'chunk', // non-ackable, signals a chunk of of the final reply, client should append it
  REPLY_FINAL = 'reply', // non-ackable, signals the final (non-streaming) reply, client should display it
  GET_INDEX = 'get_index', // ackable, signals a request to the client for an index context
  RUN_QUERY = 'run_query', // ackable, signals a request to the client to run a query
  // TODO: return the right event names when new copilot events are ready
  // STREAM = 'v2/stream',
  // GENERAL = 'general',
  STREAM = 'stream',
  GENERAL = 'stream',
}

export enum AiMessageRole {
  HUMAN = 'human',
  AI = 'ai',
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}

export enum AiServerErrors {
  RateLimitRequest = 'RateLimitRequest',
  RateLimitToken = 'RateLimitToken',
  MaxTokens = 'MaxTokens',
}
