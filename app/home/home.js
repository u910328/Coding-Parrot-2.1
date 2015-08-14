(function (angular) {
    "use strict";

    var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL','snippet','$filter', function ($scope, fbutil, user, $firebaseObject, FBURL, snippet,$filter) {
        $scope.user = user;
        $scope.source=[
            {
                name:'boss',
                email:'uuuu',
                gender:'male'
            },
            {
                name:'boss',
                email:'bbbb',
                gender:'female'
            },
            {
                name:'cat',
                email:'uuuu',
                gender:'female'
            }
        ];
        var delayedFilter=new snippet.DelayedFilter($scope, 'source', 'updatedView', 'filterKeys',500);
        $scope.filterKeys='';
        $scope.updatedView=$scope.source;
        $scope.reset=delayedFilter.reset;

        $scope.test=function(obj){
            $scope.filterKeys=[obj];
        };
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

