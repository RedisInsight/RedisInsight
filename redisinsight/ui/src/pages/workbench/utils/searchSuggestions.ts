import { monaco as monacoEditor } from 'react-monaco-editor'
import { isNumber } from 'lodash'
import { IMonacoQuery, Nullable } from 'uiSrc/utils'
import { CursorContext, FoundCommandArgument } from 'uiSrc/pages/workbench/types'
import { findCurrentArgument, splitQueryByArgs } from 'uiSrc/pages/workbench/utils/query'
import { IRedisCommand } from 'uiSrc/constants'
import {
  asSuggestionsRef,
  getFieldsSuggestions,
  getFunctionsSuggestions,
  getGeneralSuggestions,
  getIndexesSuggestions,
  getNoIndexesSuggestion
} from 'uiSrc/pages/workbench/utils/suggestions'
import { DefinedArgumentName, FIELD_START_SYMBOL } from 'uiSrc/pages/workbench/constants'

export const findSuggestionsByArg = (
  listOfCommands: IRedisCommand[],
  command: IMonacoQuery,
  cursorContext: CursorContext,
  additionData: {
    indexes?: any[]
    fields?: any[],
  }
): {
  suggestions: any,
  helpWidget?: any
} => {
  const { allArgs, args, cursor } = command
  const { prevCursorChar } = cursor
  const [beforeOffsetArgs, [currentOffsetArg]] = args

  const foundArg = findCurrentArgument(listOfCommands, beforeOffsetArgs)

  console.log(foundArg)

  if (!command.name.startsWith('FT.')) {
    return {
      helpWidget: { isOpen: !!foundArg, parent: foundArg?.parent, currentArg: foundArg?.stopArg },
      suggestions: asSuggestionsRef([])
    }
  }

  if (prevCursorChar === FIELD_START_SYMBOL) {
    return handleFieldSuggestions(additionData.fields || [], foundArg, cursorContext.range)
  }

  switch (foundArg?.stopArg?.name) {
    case DefinedArgumentName.index: {
      return handleIndexSuggestions(
        additionData.indexes || [],
        command.info as IRedisCommand,
        foundArg,
        currentOffsetArg,
        cursorContext.range
      )
    }
    case DefinedArgumentName.query: {
      console.log('handle query')
      return handleQuerySuggestions(foundArg)
    }
    default: {
      return handleCommonSuggestions(
        command.fullQuery,
        foundArg,
        allArgs,
        additionData.fields || [],
        cursorContext
      )
    }
  }
}

const handleFieldSuggestions = (
  fields: any[],
  foundArg: Nullable<FoundCommandArgument>,
  range: monacoEditor.IRange
) => {
  const isInQuery = foundArg?.stopArg?.name === DefinedArgumentName.query
  const fieldSuggestions = getFieldsSuggestions(fields, range, true, isInQuery)
  return {
    suggestions: asSuggestionsRef(fieldSuggestions, true)
  }
}

const handleIndexSuggestions = (
  indexes: any[],
  command: IRedisCommand,
  foundArg: FoundCommandArgument,
  currentOffsetArg: Nullable<string>,
  range: monacoEditor.IRange
) => {
  const isIndex = indexes.length > 0
  const helpWidget = { isOpen: isIndex, parent: command, currentArg: foundArg?.stopArg }

  if (!isIndex) {
    helpWidget.isOpen = !!currentOffsetArg

    return {
      suggestions: asSuggestionsRef(!currentOffsetArg ? getNoIndexesSuggestion(range) : [], true),
      helpWidget
    }
  }

  if (!isIndex || currentOffsetArg) {
    return {
      suggestions: asSuggestionsRef([], !currentOffsetArg),
      helpWidget
    }
  }

  const argumentIndex = command?.arguments
    ?.findIndex(({ name }) => foundArg?.stopArg?.name === name)
  const isNextArgQuery = isNumber(argumentIndex)
    && command?.arguments?.[argumentIndex + 1]?.name === DefinedArgumentName.query

  return {
    suggestions: asSuggestionsRef(getIndexesSuggestions(indexes, range, isNextArgQuery)),
    helpWidget
  }
}

const handleQuerySuggestions = (foundArg: FoundCommandArgument) => ({
  helpWidget: { isOpen: true, parent: foundArg?.parent, currentArg: foundArg?.stopArg },
  suggestions: asSuggestionsRef([], false)
})

const handleExpressionSuggestions = (
  value: string,
  foundArg: FoundCommandArgument,
  cursorContext: CursorContext,
) => {
  const helpWidget = { isOpen: true, parent: foundArg?.parent, currentArg: foundArg?.stopArg }

  const { isCursorInQuotes, offset, argLeftOffset } = cursorContext
  if (!isCursorInQuotes) {
    return {
      suggestions: asSuggestionsRef([]),
      helpWidget
    }
  }

  const stringBeforeCursor = value.substring(argLeftOffset, offset) || ''
  const expression = stringBeforeCursor.replace(/^["']|["']$/g, '')
  const { args } = splitQueryByArgs(expression, offset - argLeftOffset)
  const [, [currentArg]] = args

  const functions = foundArg?.stopArg?.arguments ?? []
  const suggestions = getFunctionsSuggestions(functions, cursorContext.range)
  const isStartsWithFunction = functions.some(({ token }) => token?.startsWith(currentArg))

  return {
    suggestions: asSuggestionsRef(suggestions, true, isStartsWithFunction),
    helpWidget
  }
}

const handleCommonSuggestions = (
  value: string,
  foundArg: Nullable<FoundCommandArgument>,
  allArgs: string[],
  fields: any[],
  cursorContext: CursorContext,
) => {
  if (foundArg?.stopArg?.expression) return handleExpressionSuggestions(value, foundArg, cursorContext)

  const { prevCursorChar, nextCursorChar, isCursorInQuotes } = cursorContext
  const shouldHideSuggestions = isCursorInQuotes || nextCursorChar || (prevCursorChar)
  if (shouldHideSuggestions) {
    return {
      helpWidget: { isOpen: true, parent: foundArg?.parent, currentArg: foundArg?.stopArg },
      suggestions: asSuggestionsRef([])
    }
  }

  const {
    suggestions,
    forceHide,
    helpWidgetData
  } = getGeneralSuggestions(foundArg, allArgs, cursorContext.range, fields)

  return {
    suggestions: asSuggestionsRef(suggestions, forceHide),
    helpWidget: helpWidgetData
  }
}
