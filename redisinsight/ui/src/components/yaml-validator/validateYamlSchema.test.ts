import yaml from 'js-yaml'
import { validateYamlSchema } from './validateYamlSchema'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string', pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$' },
  },
  required: ['name', 'version'],
}

describe('validateYamlSchema', () => {
  it('should return valid for correctly formatted YAML', () => {
    const yamlContent = `
      name: my-app
      version: 1.0.0
    `
    expect(validateYamlSchema(yamlContent, schema)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('should return error for missing required fields', () => {
    const yamlContent = `
      name: my-app
    `
    expect(validateYamlSchema(yamlContent, schema)).toEqual({
      valid: false,
      errors: expect.arrayContaining([
        expect.stringContaining("must have required property 'version'"),
      ]),
    })
  })

  it('should return error for invalid version format', () => {
    const yamlContent = `
      name: my-app
      version: abc
    `
    expect(validateYamlSchema(yamlContent, schema)).toEqual({
      valid: false,
      errors: expect.arrayContaining([
        expect.stringContaining('must match pattern'),
      ]),
    })
  })

  it('should return empty errors when schema is empty (accept all YAML)', () => {
    const yamlContent = `
      anyKey: anyValue
    `
    const emptySchema = {}
    expect(validateYamlSchema(yamlContent, emptySchema)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('should return YAML syntax error for invalid YAML format', () => {
    const yamlContent = `
      name: my-app
      version
    ` // Missing colon (:) for "version"
    const result = validateYamlSchema(yamlContent, schema)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Error:')
  })

  it('should handle YAML parsing errors gracefully', () => {
    jest.spyOn(yaml, 'load').mockImplementation(() => {
      throw new yaml.YAMLException('Simulated parsing error')
    })

    const result = validateYamlSchema('invalid yaml content', schema)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Error:')

    jest.restoreAllMocks()
  })

  it('should handle unknown errors gracefully', () => {
    jest.spyOn(yaml, 'load').mockImplementation(() => {
      throw new Error('Unexpected failure')
    })

    expect(validateYamlSchema('name: test', schema)).toEqual({
      valid: false,
      errors: ['Error: unknown error'],
    })

    jest.restoreAllMocks()
  })
})
