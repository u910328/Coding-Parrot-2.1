(function(angular) {
  "use strict";

  var app = angular.module('myApp.test', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

  app.controller('TestCtrl', function ($scope, viewLogic) {
    var rule=[
      ["path.path5", "path.path6", "path.path7", "path.path8", "result"],
      [">1", ">3", "==2", "==1", "view.class1=success1|"],
      ["", "", "", "==3", "view.class2=success2|"],
      ["", "", "==2", "", "view.class3=success3|"],
      ["==2", "", "", "", "view.class4=success4|"]
    ];
    viewLogic.addPartialRule(rule)
  });

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/test', {
      templateUrl: 'test/test.html',
      controller: 'TestCtrl'
      //resolve: {
      //  // forces the page to wait for this promise to resolve before controller is loaded
      //  // the controller can then inject `user` as a dependency. This could also be done
      //  // in the controller, but this makes things cleaner (controller doesn't need to worry
      //  // about auth status or timing of accessing data or displaying elements)
      //  user: ['Auth', function (Auth) {
      //    return Auth.$waitForAuth();
      //  }]
      //}
    });
  }]);

})(angular);
