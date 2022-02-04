interface Props {
  items: any[]
  nodes: any
  separator: string
  openStatus: any
  previousKey: string
}

export const constructKeysToTree = (props: Props): any[] => {
  const { nodes, items: keys, separator = ':' } = props
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
      // key leaf
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
    // const candidateId = Math.round(Math.random() * 100_000_000)
    const candidateId = Math.random().toString(36)

    if (ids[candidateId]) {
      return getUniqueId()
    }

    ids[candidateId] = true

    return candidateId
  }

  // FormatTreeData

  // let treeTest:any = {}

  const formatTreeData = (tree: any, previousKey = '', separator = ':') =>
    Reflect.ownKeys(tree).map((key) => {
    // Object.keys(tree).map((key) => {
      const name = key?.toString()
      const node: any = { name }

      // if (!tree[key].isLeaf && Object.keys(tree[key]).length > 0) {
      if (key !== keysSymbol && Reflect.ownKeys(tree[key]).length > 0) {
      // if (Object.keys(tree[key]).length > 0) {
        const tillNowKeyName = previousKey + name + separator
        // node.open = !!openStatus[tillNowKeyName]
        node.children = formatTreeData(tree[key], tillNowKeyName, separator)
        // keep folder node in bottom of the tree(not include the outest list)
        // sortNodes(node.children)
        node.keyCount = node.children.reduce((a, b) => a + (b.keyCount || 0), 0)
        node.fullName = tillNowKeyName
      } else {
        node.children = []
        node.keys = tree[keysSymbol] ?? []
        node.keyCount = Object.keys(node.keys ?? [])?.length ?? 1
      }

      node.id = getUniqueId()
      return node
    })

  const treeData = formatTreeData(tree, '', separator)

  return treeData

  // Update the size of n1 to that of n2
  function updateKeyCount(n1, n2) {
    if (n2.keyCount) {
      n1.keyCount += n2.keyCount
    } else {
      delete n1.keyCount
    }
  }

  // Check if n1 and n2 have the same id
  function idEq(n1:any) {
    return function (n2) {
      return n1.name === n2.name
    }
  }

  // Check if n1 contains the given n2 child
  function hasChild(n1:any) {
    return function (n2Child:any) {
      return n1.children.some(idEq(n2Child))
    }
  }

  function mergeNodes(n1:any, n2:any) {
    let n1HasN2Child: any
    let i
    let n2Child: any

    // Update the sizes
    updateKeyCount(n1, n2)

    // Check which n2 children are present in n1
    n1HasN2Child = n2.children.map(hasChild(n1))

    // Iterate over n2 children
    for (i = 0; i < n1HasN2Child.length; i++) {
      n2Child = n2.children[i]
      if (n1HasN2Child[i]) {
        // n1 already has this n2 child, so lets merge them

        // const n1Child = n1.children.find(({ id }) => id === n2Child.id)
        const n1Child = n1.children.find(({ name }) => name === n2Child.name)
        mergeNodes(n1Child, n2Child)
      } else {
        // n1 does not have this n2 child, so add it
        // n1.addChild(n2Child);
        // n1.children = [...n1.children, n2Child]
        n1.children = n1.children.concat(n2Child)
      }
    }
  }

  if (nodes.children.length === 0) {
    return treeTest
  }

  mergeNodes(nodes, treeTest)
  return nodes
}
