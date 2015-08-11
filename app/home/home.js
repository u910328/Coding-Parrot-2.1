(function (angular) {
    "use strict";

    var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL','snippet', function ($scope, fbutil, user, $firebaseObject, FBURL, snippet) {
        $scope.user = user;
        var testraw={
            '123':{
                'a':'a',
                'no':false
            },
            '345':{
                'a':'a',
                'no':false
            },
            'obj':{
                a:1,
                leave:'no',
                sub:{
                    sub1:1,
                    subleave:2,
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
            '$uid':{
                a:''
            },
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

