/**
 * Created by ananyagoel on 22/07/17.
 */

var elasticsearch = require('elasticsearch');

var base64 = require('base64-url');

var elasticClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info'
});

var indexName = "textfilesearch";

function deleteIndex() {
    return elasticClient.indices.delete({
        index: indexName
    });
}


function initIndex() {
    return elasticClient.indices.create({
        index: indexName
    });
}


function indexExists() {
    return elasticClient.indices.exists({
        index: indexName
    });
}

function initMapping() {
    return elasticClient.indices.putMapping({
        index: indexName,
        type: 'attachment',
        body:{
            document:{
                properties:{
                    file:{
                        type:'attachment',
                        fields:{
                            content:{
                                type:'text',
                                term_vector:'with_positions_offsets',
                                store:true
                            }
                        }
                    },
                    uploaded_by_user:{
                        type:'string'
                    }
                }
            }
        }
    });
}

function addDocument(document) {
    return elasticClient.index({
        index: indexName,
        type: "document",
        body: {
            file:{
                content: document.base64string
            },
            uploaded_by_user:document.uploaded_by_user
        }
    });
}

function searchDocument(document) {
    console.log(document.search_query)
    return elasticClient.search({
        index:indexName,
        "stored_fields":[],
        "body":{
            "query":{
                "bool":{
                    "must":
                        {
                            "match":{
                                "file.content": document.search_query
                            }
                        },
                    "filter":{
                        "term":{
                            "uploaded_by_user":document.uploader_id
                        }
                    }
                }
            },

            "highlight":{
                "require_field_match": false,
                "fields":
                    {
                        "file.content":{

                        }
                    }
            }
        },

    })
}

module.exports={
    indexExists,
    initIndex,
    deleteIndex,
    initMapping,
    addDocument,
    searchDocument
}







