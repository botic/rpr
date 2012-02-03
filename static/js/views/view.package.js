define(function(require, exports, module) {

    var hogan = require("lib/hogan");

    var dates = require("lib/utils/dates");
    var numbers = require("lib/utils/numbers");

    var convertDependencies = function(descriptor) {
        if (!descriptor.dependencies) {
            return;
        }
        descriptor.dependencies = _.map(_.keys(descriptor.dependencies), function(key) {
            return {
                "name": key,
                "version": descriptor.dependencies[key]
            };
        });
    };

    // lambdas needed for rendering the template
    var lambdas = {
        "formatDate": function() {
            return function(str, render) {
                return dates.format(dates.parse(render(str)), "dd.MM.yyyy HH:mm");
            }
        },
        "formatFileSize": function() {
            return function(bytes, render) {
                return numbers.formatFileSize(render(bytes));
            }
        }
    };

    var PackageView = exports.PackageView = Backbone.View.extend({
        "tagName": "li",
        "events": {
            "click .menu li": "toggle",
            "click .checksums": "toggleChecksums",
            "click": "toggleTabs"
        },
        "initialize": function() {
            this.model.bind("change", this.render, this);
            this.template = hogan.compile(document.getElementById("tmpl-package").innerHTML);
        }

    });

    PackageView.prototype.render = function() {
        var ctx = _.extend(this.model.toJSON(), lambdas);
        convertDependencies(ctx);
        for (var i=0; i<ctx.versions.length; i+=1) {
            convertDependencies(ctx.versions[i]);
        }
        if (ctx.engines != null && ctx.engines.ringojs != null) {
            ctx.ringoVersion = ctx.engines.ringojs;
        }
        $(this.el).append(this.template.render(ctx));
        return this;
    };

    PackageView.prototype.toggleTabs = function(event) {
        if ($(event.target).is("a")) {
            return true;
        }
        var $expanded = $(".menu li.expanded", this.el);
        if ($expanded.length > 0) {
            $expanded.trigger("click");
        } else {
            $(".menu li:first", this.el).trigger("click");
        }
        return false;
    };

    PackageView.prototype.toggleChecksums = function(event) {
        var $toggler = $(event.target).toggleClass("expanded");
        $toggler.next("dd.checksums").fadeToggle();
        return false;
    };

    PackageView.prototype.toggle = function(event) {
        var $item = $(event.target);
        $item.toggleClass("expanded").siblings().removeClass("expanded");
        $(this.el).toggleClass("selected", $item.hasClass("expanded"));
        var $lists = $item.parent().nextAll("dl").removeClass("expanded");
        if ($item.hasClass("expanded")) {
            $lists.filter($item.data("display")).addClass("expanded");
        }
        return false;
    };

});