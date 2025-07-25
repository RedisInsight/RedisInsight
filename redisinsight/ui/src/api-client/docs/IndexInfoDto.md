# IndexInfoDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**index_name** | **string** | The index name that was defined when index was created | [default to undefined]
**index_options** | [**IndexOptionsDto**](IndexOptionsDto.md) | The index options selected during FT.CREATE such as FILTER {filter}, LANGUAGE {default_lang}, etc. | [default to undefined]
**index_definition** | [**IndexDefinitionDto**](IndexDefinitionDto.md) | Includes key_type, hash or JSON; prefixes, if any; and default_score. | [default to undefined]
**attributes** | [**Array&lt;IndexAttibuteDto&gt;**](IndexAttibuteDto.md) | The index schema field names, types, and attributes. | [default to undefined]
**num_docs** | **string** | The number of documents. | [default to undefined]
**max_doc_id** | **string** | The maximum document ID. | [default to undefined]
**num_terms** | **string** | The number of distinct terms. | [default to undefined]
**num_records** | **string** | The total number of records. | [default to undefined]
**inverted_sz_mb** | **string** | The memory used by the inverted index, which is the core data structure       used for searching in RediSearch. The size is given in megabytes. | [default to undefined]
**vector_index_sz_mb** | **string** | The memory used by the vector index,       which stores any vectors associated with each document. | [default to undefined]
**total_inverted_index_blocks** | **string** | The total number of blocks in the inverted index. | [default to undefined]
**offset_vectors_sz_mb** | **string** | The memory used by the offset vectors,       which store positional information for terms in documents. | [default to undefined]
**doc_table_size_mb** | **string** | The memory used by the document table,       which contains metadata about each document in the index. | [default to undefined]
**sortable_values_size_mb** | **string** | The memory used by sortable values,       which are values associated with documents and used for sorting purposes. | [default to undefined]
**tag_overhead_sz_mb** | **string** | Tag overhead memory usage in mb | [default to undefined]
**text_overhead_sz_mb** | **string** | Text overhead memory usage in mb | [default to undefined]
**total_index_memory_sz_mb** | **string** | Total index memory size in mb | [default to undefined]
**key_table_size_mb** | **string** | The memory used by the key table,       which stores the mapping between document IDs and Redis keys | [default to undefined]
**geoshapes_sz_mb** | **string** | The memory used by GEO-related fields. | [default to undefined]
**records_per_doc_avg** | **string** | The average number of records (including deletions) per document. | [default to undefined]
**bytes_per_record_avg** | **string** | The average size of each record in bytes. | [default to undefined]
**offsets_per_term_avg** | **string** | The average number of offsets (position information) per term. | [default to undefined]
**offset_bits_per_record_avg** | **string** | The average number of bits used for offsets per record. | [default to undefined]
**hash_indexing_failures** | **string** | The number of failures encountered during indexing. | [default to undefined]
**total_indexing_time** | **string** | The total time taken for indexing in seconds. | [default to undefined]
**indexing** | **string** | Indicates whether the index is currently being generated. | [default to undefined]
**percent_indexed** | **string** | The percentage of the index that has been successfully generated. | [default to undefined]
**number_of_uses** | **number** | The number of times the index has been used. | [default to undefined]
**cleaning** | **number** | The index deletion flag. A value of 1 indicates index deletion is in progress. | [default to undefined]
**gc_stats** | **object** | Garbage collection statistics | [default to undefined]
**cursor_stats** | **object** | Cursor statistics | [default to undefined]
**dialect_stats** | **object** | Dialect statistics: the number of times the index was searched using each DIALECT, 1 - 4. | [default to undefined]
**Index_Errors** | **object** | Index error statistics, including indexing failures, last indexing error,       and last indexing error key. | [default to undefined]
**field_statistics** | [**Array&lt;FieldStatisticsDto&gt;**](FieldStatisticsDto.md) | Dialect statistics: the number of times the index was searched using each DIALECT, 1 - 4. | [default to undefined]

## Example

```typescript
import { IndexInfoDto } from './api';

const instance: IndexInfoDto = {
    index_name,
    index_options,
    index_definition,
    attributes,
    num_docs,
    max_doc_id,
    num_terms,
    num_records,
    inverted_sz_mb,
    vector_index_sz_mb,
    total_inverted_index_blocks,
    offset_vectors_sz_mb,
    doc_table_size_mb,
    sortable_values_size_mb,
    tag_overhead_sz_mb,
    text_overhead_sz_mb,
    total_index_memory_sz_mb,
    key_table_size_mb,
    geoshapes_sz_mb,
    records_per_doc_avg,
    bytes_per_record_avg,
    offsets_per_term_avg,
    offset_bits_per_record_avg,
    hash_indexing_failures,
    total_indexing_time,
    indexing,
    percent_indexed,
    number_of_uses,
    cleaning,
    gc_stats,
    cursor_stats,
    dialect_stats,
    Index_Errors,
    field_statistics,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
