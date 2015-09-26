var newModule='core.linkFn';
angular.module(newModule, ['firebase', 'myApp.config'])
    .factory('linkFn', ['$controller', '$injector', '$q', 'snippet', function ($controller, $injector, $q, snippet) {
        var linkFn={
            pagePlusDirective:pagePlusDirective
        };

        function pagePlusDirective(scope, ctrlName, resolveObj, initparams) { //TODO:讓不用$scope的controller也能用這個方法
            scope.$watch(initparams||'initparams', function () {
                var locals = {},
                    condition = 0,
                    resolve=resolveObj||{};
                locals['$scope'] = scope;

                for (var key in resolve) {
                    if (typeof $injector.invoke(resolve[key]).then !== 'function') {
                        locals[key] = $injector.invoke(resolve[key])
                    } else {
                        condition++;
                        $injector.invoke(resolve[key]).then(function (resolved) {
                            locals[key] = resolved;
                            waitUntil.resolve();
                        })
                    }
                }

                var waitUntil = new snippet.WaitUntil(condition, function () {
                    $controller(ctrlName, locals);
                });
            })
        }
        return linkFn
    }]);

if(appDI) appDI.push(newModule);