'use strict';
console.log('app loaded');
console.log(window.appDI);
// Declare app level module which depends on filters, and services
angular.module('myApp', window.appDI)

    .run(function ($rootScope, Auth, init) {
        // track status of authentication
        init.then(function(res){
        });
        //Auth.$onAuth(function (user) {
        //    $rootScope.user=user;
        //    $rootScope.loggedIn = !!user;
        //});
    });

angular.bootstrap(document, ['myApp']);
