(function (angular) {
    "use strict";

    var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('HomeCtrl', ['$scope', 'fbutil', 'localFb','user', '$firebaseObject', 'FBURL','snippet','$filter','ngNotify', function ($scope, fbutil,localFb, user, $firebaseObject, FBURL, snippet,$filter, ngNotify) {
        $scope.user = user;
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

})(angular);

