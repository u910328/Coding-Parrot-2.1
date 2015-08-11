(function (angular) {
    "use strict";

    var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL','snippet', function ($scope, fbutil, user, $firebaseObject, FBURL, snippet) {
        $scope.user = user;
        var testraw={
            '123':'123',
            '345':'345',
            'obj':{
                a:1,
                sub:{
                    sub1:1,
                    sub2:{
                        a:'a'
                    }
                }
            },
            arr:[
                'a',
                'b',
                {
                    a:'1'
                }
            ]
        };
        var testfilter={
            '$uid':'',
            'obj':{
                a:'',
                sub:{
                    sub2:''
                }
            },
            'arr':['#','#',
                {a:''}
            ]
        };
        $scope.test=function(){
            var res=snippet.filterRawData(testraw,testfilter,{});
            console.log(JSON.stringify(res))
        }
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
        });
    }]);

})(angular);

