import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'

interface Props {
  items: IKeyPropTypes[]
  separator?: string
}

export const constructKeysToTree = (props: Props): any[] => {
  const { items: keys, separator = ':' } = props
  // const keysSymbol = Symbol(`keys${separator}keys`)
  // const keysSymbol = Symbol('keys')
  const keysSymbol = `keys${separator}keys`
  const tree: any = {}

  keys.forEach((key: any) => {
    // eslint-disable-next-line prefer-object-spread
    let currentNode: any = tree
    const { name } = key
    const nameSplitted = name.split(separator)
    const lastIndex = nameSplitted.length - 1

    nameSplitted.forEach((value:any, index: number) => {
      // create a key leaf
      if (index === lastIndex) {
        if (currentNode[keysSymbol] === undefined) {
          currentNode[keysSymbol] = {}
        }

        currentNode[keysSymbol][name] = key
      } else if (currentNode[value] === undefined) {
        currentNode[value] = {}
      }

      currentNode = currentNode[value]
    })
  })

  const ids: any = {}

  // common functions
  const getUniqueId = ():number | string => {
    const candidateId = Math.random().toString(36)

    if (ids[candidateId]) {
      return getUniqueId()
    }

    ids[candidateId] = true
    return candidateId
  }

  // FormatTreeData
  const formatTreeData = (tree: any, previousKey = '', separator = ':') => {
    const treeNodes = Reflect.ownKeys(tree)

    // sort Ungrouped Keys group to top
    treeNodes.some((key, index) => {
      if (key === keysSymbol) {
        const temp = treeNodes[0]
        treeNodes[0] = key
        treeNodes[index] = temp
        return true
      }
      return false
    })

    return treeNodes.map((key) => {
      const name = key?.toString()
      const node: any = { name }
      const tillNowKeyName = previousKey + name + separator

      // populate node with children nodes
      if (key !== keysSymbol && Reflect.ownKeys(tree[key]).length > 0) {
        node.children = formatTreeData(tree[key], tillNowKeyName, separator)
        node.keyCount = node.children.reduce((a: any, b:any) => a + (b.keyCount || 0), 0)
      } else {
        // populate leaf with keys
        node.children = []
        node.keys = tree[keysSymbol] ?? []
        node.keyCount = Object.keys(node.keys ?? [])?.length ?? 1
      }

      node.fullName = tillNowKeyName
      node.keyApproximate = (node.keyCount / keys.length) * 100
      node.id = getUniqueId()
      return node
    })
  }

  return formatTreeData(tree, '', separator)
}
