import { orderBy } from 'lodash'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import { getDbIndex } from '../longNames'

export const filterAndSort = (
  arr: Instance[] | RdiInstance[],
  search: string,
  sort: { field: string, direction: 'asc' | 'desc' }
): (Instance | RdiInstance
  )[] => {
  if (!arr?.length) return arr
  const filtered = arr.filter((instance) => {
    const label = `${instance.name} ${getDbIndex(instance.db)}`
    return label.toLowerCase?.().includes(search.toLowerCase())
  })

  const sortingFunc = (ins) => {
    if (sort.field === 'lastConnection') {
      return ins.lastConnection ? -new Date(`${ins.lastConnection}`) : -Infinity
    }
    if (sort.field === 'host') {
      return `${ins.host}:${ins.port}`
    }
    return sort.field
  }

  return orderBy(
    filtered,
    sortingFunc,
    sort.direction
  )
}
