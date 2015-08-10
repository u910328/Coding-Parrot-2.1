//Step 1: name the new module.
var newModule='myApp.allOrders';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/allOrders',
        ctrlName='AllOrdersCtrl',
        templateUrl='allOrders/allOrders.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, model, localFb, snippet, $location) {

        var fbObj=new localFb.FbObj('orders');
        $firebaseObject(fbObj.ref()).$bindTo($scope, 'allOrders');

        $scope.statusOptions=['received','preparing','ready'];

        $scope.orderStatus={};
        $scope.$watch('orderStatus', function(){

        });
        $scope.changeOrderStatus=function(orderId, userId, changedStatus){
            console.log(orderId,userId, changedStatus);
            var values=[
                {
                    refUrl:'orders/'+orderId+'/orderStatus',
                    value: changedStatus,
                    isSet:true
                },
                {
                    refUrl:'users/'+userId+'/orderHistory/'+orderId+'/orderStatus',
                    value: changedStatus,
                    isSet:true
                }];
            localFb.batchUpdate(values, true).then(function(){}, function(err){
                console.log(JSON.stringify(err));
            });
        };



        $scope.selectOrder=function(orderId){
            $scope.selectedOrder=$scope.allOrders[orderId];
            $scope.selectedOrder.orderId=orderId;
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