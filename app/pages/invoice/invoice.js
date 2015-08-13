//Step 1: name the new module.
var newModule='myApp.invoice';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/invoice',
        ctrlName='InvoiceCtrl',
        templateUrl='pages/invoice/invoice.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, model, localFb, snippet, $location) {

        $scope.invoice=model.invoice;
        $scope.subTotal=model.calcSubTotal('', model.invoice.products);
        $scope.date=new Date();
        $scope.OK=function(){
            $location.path('/home')
        }

    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);
appDI.push(newModule);