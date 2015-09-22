//Step 1: name the new module.
var newModule = 'myApp.test2';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state = 'test2',
        url='/test2',
        ctrlName = 'Test2Ctrl',
        templateUrl = 'pages/test2/test2.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, ['$scope','$state','$timeout', 'fbutil', 'localFb', 'snippet', 'elasticSearch', function ($scope, $state, $timeout, fbutil, localFb, authData, snippet, elasticSearch) {

    }]);

//Step 5: config providers.
    app.config(function($stateProvider){
            $stateProvider.state(state, {
                templateUrl: templateUrl,
                controller: ctrlName,
                url: url
            });
        });

})(angular);
appDI.push(newModule);