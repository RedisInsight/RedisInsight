import React from 'react'

import { VectorSearchCreateIndex } from './create-index/VectorSearchCreateIndex'
import { VectorSearchQuery } from './query/VectorSearchQuery'

export const VectorSearchPage = () => {
  const hasIndexes = false

  if (!hasIndexes) {
    return <VectorSearchCreateIndex />
  }

  // TODO: QueryScreen

  return <VectorSearchQuery />
}
