import { chunk, fromPairs, isArray, isEmpty, last } from 'lodash'
import { Buffer } from 'buffer'

import {
  CommandArgument,
  ResultFieldNameView,
  ResultInfoField,
  InfoAttributesBoolean
} from '../constants'

const parseSearchRawResponse = (command: string, initResult: any[]) => {
  const chunkCount = getChunkCountSearch(command)

  return chunk(initResult, chunkCount).map(([key, ...initValues]: string[]) => {
    let values: any = last(initValues)
    let fields: any = {}

    if (isEmpty(initValues)) {
      return { Doc: key }
    }

    if (command.includes(CommandArgument.WithScores)) {
      const [score, scoreValues, others] = initValues
      values = [ResultFieldNameView.Score, score, ...(scoreValues || []), ...(others || [])]

      if (command.includes(CommandArgument.WithPayloads)) {
        const [payload] = scoreValues || []
        values = [ResultFieldNameView.Payloads, payload, ...values]
      }
    } else if (command.includes(CommandArgument.WithPayloads)) {
      const [payload, payloadValues = [], ...other] = initValues
      values = [ResultFieldNameView.Payloads, payload, ...(payloadValues || []), ...other]
    }

    values = chunk(values, 2)
    fields = fromPairs(values)

    return { Doc: key, ...fields }
  })
}

const parseAggregateRawResponse = (initResult: any[]) => {
  const result: any[] = initResult?.map((values: any) => {
    if (isArray(values) && values?.length > 1) {
      return { ...fromPairsChunk(values, 2) }
    }
    if (isArray(values)) {
      return []
    }

    return values.toString()
  })

  return result
}

const parseInfoRawResponse = (initResult: any[]) => {
  const result: any[] = chunk(initResult, 2).map(([field, value]: any) => {
    if (isArray(value) && (field === ResultInfoField.Fields || field === ResultInfoField.Attributes)) {
      const values = field === ResultInfoField.Fields ? value.map((field) =>
        [ResultFieldNameView.Name.toLowerCase(), ...field]) : value
      return [field, values.map((attrs: any[]) => {
        const newAttrs = attrs.reduce((prev, current) =>
          (InfoAttributesBoolean.indexOf(current) !== -1
            ? [...prev, current, true]
            : [...prev, current]), [])

        return fromPairsChunk(newAttrs, 2)
      })]
    }
    if (isArray(value) && field !== ResultInfoField.Options) {
      return [field, fromPairsChunk(value, 2)]
    }

    return [field, value]
  })

  return fromPairs(result)
}

const fromPairsChunk = (arr: any[] = [], count: number = 2) => fromPairs(chunk(arr, count))

const getChunkCountSearch = (command: string = '') => {
  let count = 2
  const onlyKeysChunkCount = 1
  const specialArgs = [CommandArgument.WithSortKeys, CommandArgument.WithScores, CommandArgument.WithPayloads]

  if (getIsKeysOnly(command)) count = onlyKeysChunkCount

  specialArgs.forEach((arg) => command.toUpperCase().includes(arg) && ++count)

  return count
}

const getIsKeysOnly = (command: string = '') => (
  command.toUpperCase().includes(CommandArgument.NoContent)
  || command.toUpperCase().includes(`${CommandArgument.Return} 0`)
)

export const getBufferFromSafeASCIIString = (str: string): Buffer => {
  const bytes = []

  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === '\\') {
      if (str[i + 1] === 'x') {
        const hexString = str.substr(i + 2, 2)
        if (isHex(hexString)) {
          bytes.push(Buffer.from(hexString, 'hex'))
          i += 3
          // eslint-disable-next-line no-continue
          continue
        }
      }

      if (['a', '"', '\\', 'b', 't', 'n', 'r'].includes(str[i + 1])) {
        switch (str[i + 1]) {
          case 'a':
            bytes.push(Buffer.from('\u0007'))
            break
          case 'b':
            bytes.push(Buffer.from('\b'))
            break
          case 't':
            bytes.push(Buffer.from('\t'))
            break
          case 'n':
            bytes.push(Buffer.from('\n'))
            break
          case 'r':
            bytes.push(Buffer.from('\r'))
            break
          default:
            bytes.push(Buffer.from(str[i + 1]))
        }

        i += 1
        // eslint-disable-next-line no-continue
        continue
      }
    }

    bytes.push(Buffer.from(str[i]))
  }

  return Buffer.concat(bytes)
}

function isHex(str: string) {
  return /^[A-F0-9]{1,2}$/i.test(str)
}

export const isJson = (item: any): boolean => {
  let value = typeof item !== 'string' ? JSON.stringify(item) : item
  try {
    value = JSON.parse(value)
  } catch (e) {
    return false
  }

  return typeof value === 'object' && value !== null
}

export const parseJSONASCIIResponse = (response: string):string =>
  getBufferFromSafeASCIIString(response).toString()

export const parseClientListResponse = (response: string) => response.split(/\r?\n/).filter((r: string) => r).map((row: string) => {
  const value = row.split(' ')
  const obj: any = {}
  value.forEach((v: string) => {
    const pair = v.split('=')
    // eslint-disable-next-line prefer-destructuring
    obj[pair[0]] = pair[1]
  })
  return obj
})

export {
  parseInfoRawResponse,
  parseSearchRawResponse,
  parseAggregateRawResponse,
}
