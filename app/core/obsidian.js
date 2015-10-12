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
        appDependencies = JSON.parse(JSON.stringify(dependencies));
    };

    this.getAppDependencies = function () {
        return appDependencies;
    };

    this.bootstrap = function (name) {
        var _name=name||'myApp';
        angular.module(_name, appDependencies)

            .run(function ($rootScope, Auth, init) {
                // track status of authentication
                init.then(function(res){
                });
                //Auth.$onAuth(function (user) {
                //    $rootScope.user=user;
                //    $rootScope.loggedIn = !!user;
                //});
            });

        angular.bootstrap(document, [_name]);
    };


    //for (var key in sourceMap) {
    //    if (sourceMap.hasOwnProperty(key)) addResource(sourceMap[key]);
    //}
})();

