Click on the button, see the command and the comments in the Workbench editor, and then run it.

1. CRUD operations

    ```redis Create
    // Let's add four documents as JSON to the index. Note the format of the key names.
    // Each document represents a school.
    
    JSON.SET school:1 . '{"name":"Hall School", "description":"Independent primary school for boys aged 5 to 11","school_type":"single;boys","class":"independent", "address":{"city":"London", "street":"Manor Street"}, "pupils":342, "location":"51.445417, -0.258352", "status_log":["new", "operating"]}'
    
    JSON.SET school:2 . '{"name":"Garden School", "description":"State school for boys and girls aged 5 to 18","school_type":"mixed;boys;girls","class":"state", "address":{"city":"London", "street":"Gordon Street"}, "pupils":1452, "location":"51.402926, -0.321523", "status_log":["new", "operating"]}'
    
    JSON.SET school:3 . '{"name":"Gillford School", "description":"Independent school for girls aged 5 to 18","school_type":"single;girls","class":"private", "address":{"city":"Goudhurst", "street":"Goudhurst"}, "pupils":721, "location":"51.112685, 0.451076", "status_log":["new", "operating", "closed"]}'
    
    JSON.SET school:4 . '{"name":"Old Boys School", "description":"Independent school for boys aged 5 to 18","school_type":"single;boys","class":"independent", "address":{"city":"Oxford", "street":"Trident Street"}, "pupils":1200, "location":"51.781756, -1.123196", "status_log":["new", "operating"]}'
    
    ```
    ```redis Read
    JSON.GET school:1 // Read the whole document
    
    // RedisJSON supports JSONPath, so we can easily access nested properties using $.<field_name> construct
    
    JSON.GET school:1 $.description // Read only the field description
    
    ```
    ```redis Update
    JSON.GET school:1 $.pupils // Read the pupils field before the update
    
    JSON.SET school:1 $.pupils 430 // Update the pupils field
    
    JSON.GET school:1 $.pupils // Read the pupils field after the update
    
    ```
    ```redis Delete
    JSON.GET school:1 $.pupils // Read the pupils field before deletion
    
    JSON.DEL school:1 $.pupils // Delete only the pupils field from the document
    
    JSON.GET school:1  // Read the whole document to confirm the construction_value field has been deleted
    
    JSON.DEL school:1  // Delete the entire document
    
    JSON.GET school:1 // Confirm the entire document has been deleted
    
    ```

2. Secondary Index

    ```redis Create JSON index
    // It is possible to index either every hash or every JSON document in the keyspace or configure indexing only for a subset of the same data type documents described by a prefix.
    
    // RedisJSON supports JSONPath, so we can easily access and index nested properties and array elements.
    // Note that you cannot index values that contain JSON objects. To be indexed, a JSONPath expression must return a single scalar value (string, number, or geo). If the JSONPath expression returns an object, it will be ignored. If the JSONPath expression returns multiple scalar values (string or boolean), or if it returns an array of string or boolean values, the values can be indexed only as TAG.
    
    // JSON Strings can only be indexed as TEXT, TAG and GEO (using the right syntax).
    // JSON numbers can only be indexed as NUMERIC.
    // JSON Boolean can only be indexed as TAG.    
    // NULL values are ignored.
    
    // Command to create an index on JSON keys that are prefixed with "school:"
    
    FT.CREATE schools           // Index name
     on JSON                   // Indicates the type of data to index
       PREFIX 1 "school:"      // Tells the index which keys it should index
     SCHEMA
       $.name AS name TEXT NOSTEM SORTABLE    // Will be indexed as a TEXT field. Will permit sorting during query. Stemming is disabled - which is ideal for proper names.
       $.description AS description TEXT
       $.school_type AS school_type TAG SEPARATOR ";"    // For tag fields, a separator indicates how the text contained in the field is to be split into individual tags
       $.class AS class TAG // Will be indexed as a tag. Will allow exact-match queries.
       $.address.street AS address TEXT NOSTEM    // '$.address.street' field will be indexed as TEXT and can be referred as 'street' due to the '... AS fieldname ...' construct.
       $.address.city AS city TAG
       $.pupils AS pupils NUMERIC SORTABLE   // Will be indexed as a numeric field. Will permit sorting during query
       $.location AS location GEO     // Will be indexed as GEO. Will allow geographic range queries
       $.status_log.[-1] as status TAG // Will index the last element of the array as "status"
    
    ```
    ```redis List all indexes
    // Command to return the list of all existing indexes
    
    FT._LIST
    
    ```
    ```redis Index info
    // Command to display information about a particular index.
    // In this case display the information about the newly created "schools" index
    
    FT.INFO "schools"
    
    ```

3. Search and Querying Basics

    ```redis Exact text search
    // Perform a text search on all text fields: query for documents inside which the word 'girls' occurs
    
    FT.SEARCH "schools" "girls"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Fuzzy text search
    // Perform a Fuzzy text search on all text fields: query for documents with words similar to 'gill'. The number of % indicates the allowed Levenshtein distance. So the query would also match on 'girl' because 'gill' and 'girl' have a distance of two.
    
    FT.SEARCH "schools" "%%gill%%"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Field specific text search
    // Perform a text search on a specific field: query for documents which have a field 'name' inside which the word 'old' occurs
    // To reference a field, use @<field_name> construct
    
    FT.SEARCH "schools" "@name:old"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Numeric range query
    // Perform a numeric range query: query for every document that has a 'pupils' value between 0 and 1000
    // For numerical ranges, square brackets are inclusive of the listed values
    
    FT.SEARCH "schools" "@pupils:[0,1000]"
    
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Tag search
    // Perform a tag search: query for documents which have the city field set to "London". Note that we use curly braces around the tag.
    
    FT.SEARCH "schools" "@city:{Oxford}"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //
    
    ```
    ```redis Multiple tags (OR) search
    // Perform a search for documents that have one of multiple tags (OR condition)
    
    FT.SEARCH "schools" "@school_type:{single|girls}"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Multiple tags (AND) search
    // Perform a search for documents that all of the tags (AND condition)
    
    FT.SEARCH "schools" "@school_type:{single} @school_type:{girls}"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Combined search on two fields (AND)
    // Perform a combined search on two fields (AND): query for intersection of both search terms, a text search and a tag match
    
    FT.SEARCH "schools" "@description:girls @status:{closed}"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Combined search on two fields (OR)
    // Perform a combined search on two fields (OR): query for union of both search terms. The brackets are important.
    
    FT.SEARCH "schools" "(@city:{Oxford})|(@description:girls)"
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Combined search and geo filter
    // Perform a fuzzy text search and filter on location in a radius distance of 10 miles
    
    FT.SEARCH "schools" "%%gill%%" GEOFILTER location 51.11 0.45 10 mi
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
    ```redis Group by & sort by aggregation
    // Aggregations are a way to process the results of a search query, group, sort and transform them - and extract analytic insights from them.
    // Aggregations are represented as the following data processing pipeline:
    // Filter -> Group (Reduce) -> Apply -> Sort -> Apply
    
    // Perform a Group By & Sort By aggregation of your documents: display the number of permits by city and then sort the city alphabetically
    
    FT.AGGREGATE "schools" "*"
        GROUPBY 1 @city REDUCE COUNT 0 AS nb_of_schools
        SORTBY 2 @city Asc
    
    // See the "schools" index schema for reference
    
    // FT.CREATE schools
    // on JSON
    //   PREFIX 1 "school:"
    // SCHEMA
    //   $.name AS name TEXT NOSTEM SORTABLE
    //   $.description AS description TEXT
    //   $.school_type AS school_type TAG SEPARATOR ";"
    //   $.class AS class TAG
    //   $.address.street AS address TEXT NOSTEM
    //   $.address.city AS city TAG
    //   $.pupils AS pupils NUMERIC SORTABLE
    //   $.location AS location GEO
    //   $.status_log.[-1] as status TAG
    
    ```
