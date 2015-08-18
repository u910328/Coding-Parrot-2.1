'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', appDI)

    .run(['$rootScope', 'Auth', 'localFb', function ($rootScope, Auth, localFb) {
        // track status of authentication

        Auth.$onAuth(function (user) {
            $rootScope.loggedIn = !!user;
        });
    }]);
