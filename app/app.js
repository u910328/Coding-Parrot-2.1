'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', appDI)

  .run(['$rootScope', 'Auth', function($rootScope, Auth) {
    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
    });
  }]);
