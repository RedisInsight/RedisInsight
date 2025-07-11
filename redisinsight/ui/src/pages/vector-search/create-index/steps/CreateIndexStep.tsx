import React from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { IStepComponent } from '../types'

export const CreateIndexStep: IStepComponent = ({ setParameters }) => (
  <>
    <FlexItem direction="column" $gap="m">
      <Text>Vector index</Text>
      <Text size="S">
        Indexes tell Redis how to search your data. Creating an index enables
        fast, accurate retrieval across your dataset.
      </Text>
    </FlexItem>
    <FlexItem direction="column" $gap="m">
      <Text>Index name</Text>
      <Text>Bikes</Text>
    </FlexItem>
    <FlexItem direction="column" $gap="m">
      <FlexItem direction="row" $gap="m">
        <div>Box1</div>
        <div>Box2</div>
        <div>Box3</div>
      </FlexItem>
    </FlexItem>
  </>
)
