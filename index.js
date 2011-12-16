var objects = require("ringo/utils/objects");
var {indexDir} = require("./config");
var {IndexManager} = require("indexmanager");
var {Document, Field} = org.apache.lucene.document;
var {MultiFieldQueryParser} = org.apache.lucene.queryParser;
var {Version} = org.apache.lucene.util;
var {PerFieldAnalyzerWrapper} = org.apache.lucene.analysis;
var {StandardAnalyzer} = org.apache.lucene.analysis.standard;
var {MatchAllDocsQuery} = org.apache.lucene.search;


var manager = exports.manager = module.singleton("index", function() {
    return IndexManager.createIndex(indexDir, "index");
});

exports.createDocument = function(pkg) {
    var doc = new Document();
    var descriptor = JSON.parse(pkg.latestVersion.descriptor);
    doc.add(new Field("id", pkg._id, Field.Store.YES, Field.Index.NOT_ANALYZED, Field.TermVector.NO));
    doc.add(new Field("name", pkg.name, Field.Store.NO, Field.Index.ANALYZED, Field.TermVector.NO));
    doc.add(new Field("description", descriptor.description, Field.Store.NO, Field.Index.ANALYZED, Field.TermVector.NO));
    for each (var keyword in descriptor.keywords) {
        doc.add(new Field("keyword", keyword, Field.Store.NO, Field.Index.ANALYZED, Field.TermVector.NO));
    }
    doc.add(new Field("author", pkg.author.name, Field.Store.NO, Field.Index.ANALYZED, Field.TermVector.NO));
    for each (var maintainer in pkg.maintainers) {
        doc.add(new Field("maintainer", maintainer.name, Field.Store.NO, Field.Index.ANALYZED, Field.TermVector.NO));
    }
    for each (var contributor in pkg.contributors) {
        doc.add(new Field("contributor", contributor.name, Field.Store.NO, Field.Index.ANALYZED, Field.TermVector.NO));
    }
    return doc;
};

exports.search = function(q) {
    var query = null;
    if (typeof(q) === "string" && q.length > 0) {
        var analyzer = new StandardAnalyzer(Version.LUCENE_35);
        var parser = new MultiFieldQueryParser(Version.LUCENE_35,
                 ["name", "description", "keyword", "author", "maintainer", "contributor"], analyzer);
        query = parser.parse(q || "");
    } else {
        query = new MatchAllDocsQuery();
    }
    console.log("Query:", query);
    var topDocs = manager.searcher.search(query, null, 50);
    var result = new Array(topDocs.totalHits);
    for (var i=0; i<topDocs.totalHits; i+=1) {
        var doc = manager.reader.document(topDocs.scoreDocs[i].doc);
        result[i] = doc.getField("id").stringValue();
    }
    return result;
};