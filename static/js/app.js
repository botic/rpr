define(function(require, exports, module) {

    var MainView = require("views/view.main").MainView;
    var Packages = require("collections/collection.packages").Packages;

    var App = exports.App = Backbone.Router.extend({

        "routes": {
           "!/search/*q": "search",
            "": "index"
        },

        "init": function(settings) {
            this.mainView = new MainView({
                "collection": new Packages()
            }).render();
            Backbone.history.start();
        }

    });

    App.prototype.index = function() {
        this.mainView.search();
    };

    App.prototype.search = function(q) {
        this.mainView.search(q);
    };

});
