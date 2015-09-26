//Step 1: name the new module or use a random id.
var newModule = randomString(8);

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state = 'test2',
        url='/test2',
        ctrlName = 'Test2Ctrl',
        templateUrl = 'pages/test2/test2.html',
        directiveName = '';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, ['$scope', '$state','$timeout', 'fbutil', '$firebase', 'snippet', function ($scope, $state, $timeout, fbutil, $firebase, authData, snippet) {
    }]);

//Step 5: config providers.
    app.config(function($stateProvider){
            $stateProvider.state(state, {
                templateUrl: templateUrl,
                controller: ctrlName,
                url: url
            });
        });

    if(directiveName){
        app.directive(directiveName, ['$controller', function($controller){
            return {
                    restrict: 'E',
                    templateUrl: templateUrl,
                    scope:{
                        initparams:'@'
                    },
                link: function (scope, iElement, iAttrs) {
                    scope.$watch('initparams', function(){
                        $controller(ctrlName, {$scope: scope});
                    })
                }
            };
        }]);
    }


})(angular);
appDI.push(newModule);