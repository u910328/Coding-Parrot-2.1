'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.security',
    'myApp.home',
    'myApp.account',
    'myApp.chat',
    'myApp.login',
    'myApp.test',
    'myApp.test1',
    'myApp.test2',
    'myApp.pageSeed',
    'core.snippet',
    'core.viewLogic',
    'core.model',
    'core.localFb',
    'core.binder',
    'core.driver',
    'core.action',
    'core.init'
  ])

  .run(['$rootScope', 'Auth', function($rootScope, Auth) {
    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
    });
  }]);
