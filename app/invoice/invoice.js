//Step 1: name the new module.
var newModule='myApp.invoice';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/invoice',
        ctrlName='InvoiceCtrl',
        templateUrl='invoice/invoice.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, model, localFb, snippet, $location) {

        localFb.params={
            '$uid':'boss123'
        };
        $scope.order=model.order;

        $scope.OK=function(){
            delete model.order;
            $location.path('/home')
        }

    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
            //resolve: {
            //  // forces the page to wait for this promise to resolve before controller is loaded
            //  // the controller can then inject `user` as a dependency. This could also be done
            //  // in the controller, but this makes things cleaner (controller doesn't need to worry
            //  // about auth status or timing of accessing data or displaying elements)
            //  user: ['Auth', function (Auth) {
            //    return Auth.$waitForAuth();
            //  }]
            //}e
        });
    }]);

})(angular);
appDI.push(newModule);