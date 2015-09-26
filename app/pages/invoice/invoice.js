//Step 1: name the new module.
var newModule='myApp.invoice';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='invoice',
        url='/invoice',
        ctrlName='InvoiceCtrl',
        templateUrl='pages/invoice/invoice.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, model, $firebase, snippet, $location) {

        $scope.invoice=model.invoice;
        $scope.subTotal=model.calcSubTotal('', model.invoice.products);
        $scope.date=new Date();
        $scope.OK=function(){
            $location.path('/home')
        }

    });

//Step 5: config providers.
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: {
                user: ['Auth', function (Auth) {
                    return Auth.$waitForAuth();
                }]
            }
        });
    }]);

})(angular);
appDI.push(newModule);