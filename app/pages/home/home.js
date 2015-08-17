//Step 1: name the new module.
var newModule='myApp.home';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/home',
        ctrlName='HomeCtrl',
        templateUrl='pages/home/home.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, ['fbutil', 'localFb','user', '$firebaseObject', 'FBURL','snippet','$filter','ngNotify', function (fbutil,localFb, user, $firebaseObject, FBURL, snippet,$filter, ngNotify) {
        this.user = user;
    }]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            resolve: {
                user: ['Auth', function (Auth) {
                    return Auth.$waitForAuth();
                }]
            }
        }).otherwise({
            redirectTo: 'home'
        });
    }]);

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
        }).otherwise({
            redirectTo: 'home'
        });
    }]);

})(angular);
appDI.push(newModule);