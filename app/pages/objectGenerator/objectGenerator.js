//Step 1: name the new module.
var newModule='myApp.objectGenerator';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/objectGenerator',
        ctrlName='ObjectGeneratorCtrl',
        templateUrl='pages/objectGenerator/objectGenerator.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, viewLogic, model) {
        //create your own controller here
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, { // user whenAuthenticated instead of when if you need this page can only be seen by logged in user. user who did not log in will be redirected to the default route. (loginRedirectPath in config.js)
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