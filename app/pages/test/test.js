//Step 1: name the new module.
var newModule = 'myApp.test';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route = '/test',
        ctrlName = 'TestCtrl',
        templateUrl = 'pages/test/test.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ui.router', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, ['$scope', 'fbutil', 'localFb', 'authData', 'snippet', 'elasticSearch', function ($scope, fbutil, localFb, authData, snippet, elasticSearch) {
        $scope.authData=authData;
    }]);

//Step 5: config providers.
    app.config(function($stateProvider){
            $stateProvider.stateAuthenticated('test', {
                templateUrl: templateUrl,
                controller: ctrlName
            });
        });

})(angular);
appDI.push(newModule);