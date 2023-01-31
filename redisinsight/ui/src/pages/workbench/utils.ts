import { ProfileQueryType, SEARCH_COMMANDS, GRAPH_COMMANDS } from './constants'

function generateGraphProfileQuery(query: string, type: ProfileQueryType) {
  return [`graph.${type}`, ...query.split(' ').slice(1)].join(' ')
}

function generateSearchProfileQuery(query: string, type: ProfileQueryType) {
  const commandSplit = query.split(' ')
  const key = commandSplit[0].toLowerCase()

  if (type === ProfileQueryType.Explain) {
    return [`ft.${type}`, ...commandSplit.slice(1)].join(' ')
  } else {
    const index = commandSplit[1]
    const queryType = key.split('.')[1] // SEARCH / AGGREGATE
    return [`ft.${type}`, index, queryType, 'QUERY', ...commandSplit.slice(2)].join(' ')
  }
}

export function generateProfileQueryForCommand(query: string, type: ProfileQueryType) {
  const cmd = query.split(' ')[0].toLowerCase()

  if (GRAPH_COMMANDS.includes(cmd)) {
    return generateGraphProfileQuery(query, type)
  } else if (SEARCH_COMMANDS.includes(cmd)) {
    return generateSearchProfileQuery(query, type)
  }

  return null
}
