var obsidian = new (function () {
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

    this.module = function (name, dependencies) {
        if (appDependencies.indexOf(name) === -1) {
            appDependencies.push(name);
        }
        return dependencies? angular.module(name, dependencies): angular.module(name)
    };

    this.setAppDependencies = function (dependencies) {
        for(var key in appDependencies){
            dependencies.push(appDependencies[key])
        }
        appDependencies=dependencies;
    };

    this.getAppDependencies = function () {
        return appDependencies;
    };


    this.init = function (appDI, modulePaths) {
        obsidian.setAppDependencies(appDI);
        for (var key in modulePaths) {
            if(modulePaths.hasOwnProperty(key)) obsidian.addResource(modulePaths[key]);
        }
    };
})();
