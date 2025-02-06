import yaml from 'js-yaml'
import Ajv from 'ajv'

export const isValidYaml = (content: string, schema: any): boolean => {
  try {
    const parsed = yaml.load(content)
    const ajv = new Ajv({ strict: false, unicodeRegExp: false })
    const validate = ajv.compile(schema)

    return validate(parsed)
  } catch (e) {
    return false
  }
}
