import yaml, { YAMLException } from 'js-yaml'
import Ajv from 'ajv'

export const validateYamlSchema = (
  content: string,
  schema: any,
): { valid: boolean; errors: string[] } => {
  try {
    const parsed = yaml.load(content)
    const ajv = new Ajv({
      strict: false,
      unicodeRegExp: false,
      allErrors: true,
    })

    const validate = ajv.compile(schema)
    const valid = validate(parsed)

    if (!valid) {
      const errors = validate.errors?.map(
        (err) => `Error: ${err.message} (at ${err.instancePath || 'root'})`,
      )
      return { valid: false, errors: errors || [] }
    }

    return { valid: true, errors: [] }
  } catch (e) {
    if (e instanceof YAMLException) {
      return { valid: false, errors: [`Error: ${e.reason}`] }
    }
    return { valid: false, errors: ['Error: unknown error'] }
  }
}
