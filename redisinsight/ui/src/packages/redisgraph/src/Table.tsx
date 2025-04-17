import { EuiInMemoryTable } from '@elastic/eui'

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function Table(props: { data: { [key: string]: any }; columns: any }) {
  if (props.data.length === 0) {
    return null
  }

  if (Object.keys(props.data[0]).length === 0) {
    return null
  }

  return (
    <EuiInMemoryTable
      columns={props.columns}
      items={props.data as any}
      pagination
    />
  )
}
