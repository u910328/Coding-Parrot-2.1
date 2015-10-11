angular.module('obsidian', ['firebase', 'ui.router'])
    .factory('obsidian', /*@ngInject*/ function (/*injections*/) {
        //start here
    });

var obsidian = new (function () {
    console.log('obsidian');
    var appDependencies = [];

    this.addResource = function (resource) {
        var script = document.createElement("script");
        script.src = resource.src;
        document.getElementsByTagName("body")[0].appendChild(script);

        if (resource.css) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = resource.css;
            document.getElementsByTagName("head")[0].appendChild(link);
        }
    };

    this.module = function (name, dependencies, addToAppDependencies) {
        var _dep = dependencies || [];
        if(addToAppDependencies||addToAppDependencies===undefined) appDependencies.push(name);
        return angular.module(name, _dep)
    };

    this.setAppDependencies = function (dependencies) {
        appDependencies=JSON.parse(JSON.stringify(dependencies));
    };

    this.getAppDependencies= function () {
        return appDependencies;
    };


    //for (var key in sourceMap) {
    //    if (sourceMap.hasOwnProperty(key)) addResource(sourceMap[key]);
    //}
})();

