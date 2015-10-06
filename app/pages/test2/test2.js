//Step 1: name the new module or use a random id.
window.newModule = window.randomString(8);

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state = 'test2',
        url = '/test2',
        ctrlName = 'Test2Ctrl',
        templateUrl = 'pages/test2/test2.html',
        directiveName = '';

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function ($scope, $firebase) {
        var loadList = [
            {
                refUrl: 'products/bd_001'
            },
            {
                refUrl: 'products/bd_002'
            },
            {
                refUrl: 'products',
                opt:{
                    orderBy:'Key',
                    limitToFirst:2
                }
            }
        ];
        $firebase.load(loadList).then(function(res){
            console.log(res);
        })
    });

//Step 5: config providers.
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state(state, {
            templateUrl: templateUrl,
            controller: ctrlName,
            url: url
        });
    }]);

    if (directiveName) {
        app.directive(directiveName, ['$controller', function ($controller) {
            return {
                restrict: 'E',
                templateUrl: templateUrl,
                scope: {
                    stateParams: '@'
                },
                link: function (scope, iElement, iAttrs) {
                    scope.$watch('initparams', function () {
                        $controller(ctrlName, {$scope: scope});
                    })
                }
            };
        }]);
    }


})(angular);

if (window.appDI) window.appDI.push(window.newModule);