import { useMemo, useId } from 'react'

export const useGenerateId = (prefix = '', suffix = '') => {
  const id = useId()

  return useMemo(() => `${prefix}${id}${suffix}`, [id, prefix, suffix])
}
