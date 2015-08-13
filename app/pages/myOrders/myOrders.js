//Step 1: name the new module.
var newModule='myApp.myOrders';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/myOrders',
        ctrlName='MyOrdersCtrl',
        templateUrl='pages/myOrders/myOrders.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function (user, $scope, $firebaseObject, model, localFb, snippet, $location) {

        var fbObj=new localFb.FbObj('users/'+user.uid+'/orderHistory');
        $firebaseObject(fbObj.ref()).$bindTo($scope, 'myOrders');

        $scope.subTotal={};
        $scope.renewSubTotal=model.calcSubTotal;
        $scope.selectOrder=function(orderId){
            $scope.selectedOrder=$scope.myOrders[orderId];
            $scope.selectedOrder.orderId=orderId;
        }
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.whenAuthenticated(route, {
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