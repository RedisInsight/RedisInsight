Click on the button, see the command and the comments in the Workbench editor, and then run it.

1. CRUD operations

    ```redis Create
    // Let's add three documents as Hashes.
    // Each document represents a building permit.
    
    HSET permit:1 "description" "To reconstruct a single detached house with a front covered veranda." "construction_value" 42000 "building_type" "single detached house" "address_city" "Lisbon" "work_type" "demolition,reconstruction" "permit_timestamp" "1602156878" "address_street" "R. Da Palma" "location" "38.717746, -9.135839"
    
    HSET permit:2 "description" "To construct a loft" "construction_value" 53000 "building_type" "apartment" "address_city" "Porto" "work_type" "construction" "permit_timestamp" "1556546400" "address_street" "Rua da Boavista" "location" "41.155854, -8.616721"
    
    HSET permit:3 "description" "New house build" "construction_value" 260000 "building_type" "house" "address_city" "Lagos" "work_type" "construction;design" "permit_timestamp" "1612947600" "address_street" "R. Antonio Gedeao" "location" "37.114864, -8.668521"
    
    ```
    ```redis Read
    HGETALL permit:1  // Read the whole document
    
    HGET permit:1 description // Read only the field description

    ```
    ```redis Update
    HGET permit:1 construction_value // Read the construction_value field before the update
    
    HSET permit:1 "construction_value"  36000 // Update the construction_value field
    
    HGET permit:1 construction_value // Read the construction_value field after the update

    ```
    ```redis Delete
    HGET permit:2  construction_value // Read the construction_value field before deletion
    
    HDEL permit:2  construction_value // Delete only the construction_value field from the document
    
    HGETALL permit:2  // Read the whole document to confirm the construction_value field has been deleted
    
    DEL permit:2  // Delete the entire document
    
    HGETALL permit:2 // Confirm the entire document has been deleted

    ```

2. Secondary Index
    ```redis Create hash index
    // Command to create an index on hash keys that are prefixed with "permit:"
    // Note that it is possible to index either every hash or every JSON document in the keyspace or configure indexing only for a subset of the same data type documents described by a prefix.
    FT.CREATE "permits"  // Index name
     ON HASH                // Indicates the type of data to index
        PREFIX 1 "permit:"     // Tells the index which keys it should index
     SCHEMA
        "permit_timestamp" NUMERIC SORTABLE    // Will be indexed as a numeric field. Will permit sorting during query.
        "address_street" AS street TEXT NOSTEM // 'address_street' field will be indexed as TEXT and can be referred as 'street' due to the '... AS fieldname ...' construct. Stemming is disabled - which is ideal for proper names.
        "address_city" AS city TAG SORTABLE    // Will be indexed as a tag. Will allow exact-match queries.
        "description" TEXT
        "building_type" TEXT NOSTEM SORTABLE
        "work_type" TAG SEPARATOR ";"          // For TAG fields, a separator indicates how the text contained in the field is to be split into individual tags
        "construction_value" NUMERIC SORTABLE
        "location" GEO                         // Will be indexed as GEO. Will allow geographic range queries

    ```
    ```redis List all indexes
    // Command to return the list of all existing indexes
    
    FT._LIST

    ```
    ```redis Index info
    // Command to display information about a particular index.
    // In this case display the information about the newly created "permits" index
    
    FT.INFO "permits"

    ```
3. Search and Querying Basics
    ```redis Exact text search
    // Perform a text search on all text fields: query for documents inside which the word 'veranda' occurs
    
    FT.SEARCH "permits" "veranda"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Fuzzy text search
    // Perform a Fuzzy text search on all text fields: query for documents with words similar to 'haus'. The number of % indicates the allowed Levenshtein distance. So the query would also match on 'house' because 'haus' and 'house' have a distance of two.
    
    FT.SEARCH "permits" "%%haus%%"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Field specific text search
    // Perform a text search on a specific field: query for documents which have a field 'building_type' inside which the word 'detached' occurs
    
    FT.SEARCH "permits" "@building_type:detached"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Numeric range query
    // Perform a numeric range query: query for every document that has a construction value between 20000 and 36000
    // To reference a field, use @<field_name> construct
    // For numerical ranges, square brackets are inclusive of the listed values
    
    FT.SEARCH "permits" "@construction_value:[20000,36000]"
    
    // See the "permits" index schema for reference
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Tag search
    // Perform a tag search: query for documents which have the address_city field set to "Lisbon". Note that we use curly braces around the tag. Also note that even though the field is called address_city in the hash, we can query it as city. That's because in the schema definition we used the ... AS fieldname ... construct, which allowed us to index address_city as city.
    
    FT.SEARCH "permits" "@city:{Lisbon}"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Multiple tags (OR) search
    // Perform a search for documents that have one of multiple tags (OR condition)
    
    FT.SEARCH "permits" "@work_type:{construction|design}"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Multiple tags (AND) search
    // Perform a search for documents that all of the tags (AND condition)
    
    FT.SEARCH "permits" "@work_type:{construction} @work_type:{design}"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Combined search on two fields (AND)
    // Perform a combined search on two fields (AND): query for intersection of both search terms.
    
    FT.SEARCH "permits" "@building_type:house @description:new"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Combined search on two fields (OR)
    // Perform a combined search on two fields (OR): query for union of both search terms. The brackets are important.
    
    FT.SEARCH "permits" "(@city:{Lagos})|(@description:detached)"
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Combined search and geo filter
    // Perform a fuzzy text search and filter on location in a radius distance of 10 miles
    
    FT.SEARCH "permits" "%%hous%%" GEOFILTER location 37.11 -8.6 10 mi
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Group by & sort by aggregation
    // Aggregations are a way to process the results of a search query, group, sort and transform them - and extract analytic insights from them.
    // Aggregations are represented as the following data processing pipeline:
    // Filter -> Group (Reduce) -> Apply -> Sort -> Apply
    
    // Perform a Group By & Sort By aggregation of your documents: display the number of permits by city and then sort the city alphabetically
    
    FT.AGGREGATE "permits" "*"
     GROUPBY 1 @city REDUCE COUNT 0 AS nb_of_permits
     SORTBY 2 @city Asc
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
    ```redis Aggregation with apply
    // Perform an aggregation of your documents with an apply function: for each document construct an ID out of construction_value and building_type fields
    // Note that you need to enclose the apply function within double quotes
    
    FT.AGGREGATE "permits" "*"
       APPLY "format(\"%s-%s\", @construction_value, @building_type)" as ID
    
    // See the "permits" index schema for reference
    
    // FT.CREATE "permits"
    //  ON HASH
    //     PREFIX 1 "permit:"
    //  SCHEMA
    //     "permit_timestamp" NUMERIC SORTABLE
    //     "address_street" AS street TEXT NOSTEM
    //     "address_city" AS city TAG SORTABLE
    //     "description" TEXT
    //     "building_type" TEXT NOSTEM SORTABLE
    //     "work_type" TAG SEPARATOR ";"
    //     "construction_value" NUMERIC SORTABLE
    //     "location" GEO
    
    ```
