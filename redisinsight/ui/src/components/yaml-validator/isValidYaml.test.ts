import { isValidYaml } from '.'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string', pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$' },
  },
  required: ['name', 'version'],
}

describe('isValidYaml', () => {
  it('valid YAML with correct schema', () => {
    const yamlContent = `
      name: my-app
      version: 1.0.0
    `
    expect(isValidYaml(yamlContent, schema)).toBe(true)
  })

  it('invalid YAML format', () => {
    const invalidYaml = `
      name: my-app
      version: abc
    `
    expect(isValidYaml(invalidYaml, schema)).toBe(false)
  })

  it('missing required fields', () => {
    const missingFieldsYaml = `
      name: my-app
    `
    expect(isValidYaml(missingFieldsYaml, schema)).toBe(false)
  })

  it('invalid YAML syntax', () => {
    const invalidSyntax = `
      name: my-app
      version:
    `
    expect(isValidYaml(invalidSyntax, schema)).toBe(false)
  })

  it('extra fields should not cause failure', () => {
    const extraFields = `
      name: my-app
      version: 1.0.0
      extraField: shouldWork
    `
    expect(isValidYaml(extraFields, schema)).toBe(true)
  })
})
