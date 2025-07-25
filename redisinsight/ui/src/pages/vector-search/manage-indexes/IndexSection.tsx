import React, { useEffect, useState } from 'react'
import { CategoryValueList, Section, SectionProps } from '@redis-ui/components'
import { useDispatch } from 'react-redux'
import { CategoryValueListItem } from '@redis-ui/components/dist/Section/components/Header/components/CategoryValueList'
import { RedisString } from 'uiSrc/slices/interfaces'
import { bufferToString, formatLongName } from 'uiSrc/utils'
import { fetchRedisearchInfoAction } from 'uiSrc/slices/browser/redisearch'
import { IndexInfoDto } from 'apiSrc/modules/browser/redisearch/dto'
import { IndexAttributesList, IndexInfoTableData } from './IndexAttributesList'

export interface IndexSectionProps extends Omit<SectionProps, 'label'> {
  index: RedisString
}

export const IndexSection = ({ index, ...rest }: IndexSectionProps) => {
  const dispatch = useDispatch()
  const indexName = bufferToString(index)

  const [tableData, setTableData] = useState<IndexInfoTableData[]>([])
  const [indexSummaryInfo, setIndexSummaryInfo] = useState<
    CategoryValueListItem[]
  >(parseIndexSummaryInfo({} as IndexInfoDto))

  useEffect(() => {
    dispatch(
      fetchRedisearchInfoAction(indexName, (data) => {
        const indexInfo = data as unknown as IndexInfoDto

        setTableData(parseIndexAttributes(indexInfo))
        setIndexSummaryInfo(parseIndexSummaryInfo(indexInfo))
      }),
    )
  }, [indexName, dispatch])

  return (
    <Section
      collapsible
      collapsedInfo={<CategoryValueList categoryValueList={indexSummaryInfo} />}
      content={<IndexAttributesList data={tableData} />}
      // TODO: Add FieldTag component to list the types of the different fields
      label={formatLongName(indexName)}
      defaultOpen={false}
      actionButtonText="Delete" // TODO: Replace with an icon of a trash can
      // onAction={handleDelete} // TODO: Implement delete functionality
      data-testid={`manage-indexes-list--item--${indexName}`}
      {...rest}
    />
  )
}

const parseIndexSummaryInfo = (
  indexInfo: IndexInfoDto,
): CategoryValueListItem[] => [
  {
    category: 'Records',
    value: indexInfo?.num_records?.toString() || '',
    key: 'num_records',
  },
  {
    category: 'Terms',
    value: indexInfo?.num_terms?.toString() || '',
    key: 'num_terms',
  },
  {
    category: 'Fields',
    value: indexInfo?.attributes?.length.toString() || '',
    key: 'num_fields',
  },
  // TODO: Date info not available in IndexInfoDto
  // {
  //   category: 'Date',
  //   value: '',
  //   key: 'date',
  // },
]

const parseIndexAttributes = (indexInfo: IndexInfoDto): IndexInfoTableData[] =>
  indexInfo.attributes.map((field) => ({
    attribute: field.attribute,
    type: field.type,
    weight: field.WEIGHT,
    separator: field.SEPARATOR,
  }))
