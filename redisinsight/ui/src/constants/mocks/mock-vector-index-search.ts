import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

// TODO: Maybe transform this to a factory function, so it can be reused more easily
// TODO: Maybe make the values more dynamic with faker, so we can test more cases
export const MOCK_VECTOR_SEARCH_BOX: VectorSearchBox = {
  value: 'field_mock',
  label: 'Field Label Mock',
  text: 'Field description mock',
  tag: FieldTypes.TEXT,
  disabled: false,
}
