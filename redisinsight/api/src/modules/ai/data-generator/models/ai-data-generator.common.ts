export enum AiDataGeneratorWsEvents {
  ERROR = 'error',
  CONNECT = 'connect',
  CONNECT_ERROR = 'connect_error',
  TOOL_CALL = 'tool_call', // non-ackable, signals a tool invocation by the agent, client should record in history
  TOOL_REPLY = 'tool', // non-ackable, signals a tool's reply, client should record in history
  REPLY_CHUNK = 'chunk', // non-ackable, signals a chunk of of the final reply, client should append it
  REPLY_FINAL = 'reply', // non-ackable, signals the final (non-streaming) reply, client should display it
  STREAM = 'data_stream',
  EXECUTE_SNIPPET = 'data_execute_snippet',
}

export enum AiDataGeneratorMessageRole {
  HUMAN = 'human',
  AI = 'ai',
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}
