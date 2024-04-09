import React from 'react'

interface AiChatSuggestion {
  inner: React.ReactNode
  query: string
}

const SUGGESTIONS = [
  {
    inner: (<>What is <b>Redis Cloud?</b></>),
    query: 'What is Redis Cloud?'
  },
  {
    inner: (<>How to perform <b>real-time searching</b> in Redis</>),
    query: 'How to perform real-time searching in Redis'
  },
]

export {
  AiChatSuggestion,
  SUGGESTIONS
}
