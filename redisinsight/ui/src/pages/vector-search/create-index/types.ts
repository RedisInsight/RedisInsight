export enum SearchIndexType {
  REDIS_QUERY_ENGINE = 'redis_query_engine',
  VECTOR_SET = 'vector_set',
}

export enum SampleDataType {
  PRESET_DATA = 'preset_data',
  CUSTOM_DATA = 'custom_data',
}

export type CreateSearchIndexParameters = {
  // Select a database step
  instanceId: string

  // Adding data step
  searchIndexType: SearchIndexType
  sampleDataType: SampleDataType
  dataContent: string

  // Create index step
  usePresetVectorIndex: boolean
  presetVectorIndexName: string
  tags: string[]
}

export type StepComponentProps = {
  setParameters: (params: Partial<CreateSearchIndexParameters>) => void
}

export interface IStepComponent {
  (props: StepComponentProps): JSX.Element | null
}
