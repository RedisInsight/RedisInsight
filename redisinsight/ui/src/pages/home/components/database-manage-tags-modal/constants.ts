export const presetTagSuggestions: {
  key: string
  value: string
}[] = [
  {
    key: 'environment',
    value: 'production',
  },
  {
    key: 'environment',
    value: 'staging',
  },
  {
    key: 'environment',
    value: 'qa',
  },
  {
    key: 'application',
    value: '',
  },
  {
    key: 'product',
    value: '',
  },
  {
    key: 'team',
    value: '',
  },
  {
    key: 'owner',
    value: '',
  },
]

export const VALID_TAG_KEY_REGEX = /^[a-zA-Z0-9\-_.@:+ ]{1,64}$/
export const VALID_TAG_VALUE_REGEX = /^[a-zA-Z0-9\-_.@:+ ]{1,128}$/
export const INVALID_FIELD_MESSAGE =
  'Tag should have unique keys and can only have letters, numbers, spaces, and these special characters: “- _ . + @ :”. Max characters length is 64 for keys and 128 for values.'
