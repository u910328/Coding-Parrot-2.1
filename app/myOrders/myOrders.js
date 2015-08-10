//Step 1: name the new module.
var newModule='myApp.myOrders';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/myOrders',
        ctrlName='MyOrdersCtrl',
        templateUrl='myOrders/myOrders.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function (user, $scope, $firebaseObject, model, localFb, snippet, $location) {

        localFb.params={
            '$uid':user.uid
        };

        var fbObj=new localFb.FbObj('users/'+user.uid+'/orderHistory');
        $firebaseObject(fbObj.ref()).$bindTo($scope, 'myOrders');

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
              // forces the page to wait for this promise to resolve before controller is loaded
              // the controller can then inject `user` as a dependency. This could also be done
              // in the controller, but this makes things cleaner (controller doesn't need to worry
              // about auth status or timing of accessing data or displaying elements)
              user: ['Auth', function (Auth) {
                return Auth.$waitForAuth();
              }]
            }
        });
    }]);

})(angular);
appDI.push(newModule);