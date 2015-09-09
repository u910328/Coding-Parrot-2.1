//Step 1: name the new module.
var newModule = 'myApp.error';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state = 'error',
        url = '/error/:errorId',
        ctrlName = 'errorCtrl',
        templateUrl = 'pages/error/error.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $routeParams, model) {
        //create your own controller here
        $scope.error = model.error[$routeParams.errorId];
    });

//Step 5: config providers.
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: {
                user: ['Auth', function (Auth) {
                    return Auth.$waitForAuth();
                }]
            }
        });
    }]);

})(angular);
appDI.push(newModule);