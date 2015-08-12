//Step 1: name the new module.
var newModule='myApp.allOrders';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/allOrders',
        ctrlName='AllOrdersCtrl',
        templateUrl='pages/allOrders/allOrders.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, model, localFb, snippet, $location) {

        var fbObj=new localFb.FbObj('orders');
        $firebaseObject(fbObj.ref()).$bindTo($scope, 'allOrders');

        $scope.statusOptions=['received','preparing','ready'];
        $scope.orderStatus={};
        $scope.subTotal={};

        $scope.changeOrderStatus=function(orderId, userId, changedStatus){
            console.log(orderId,userId, changedStatus);
            var values=[
                {
                    refUrl:'orders/'+orderId+'/orderStatus',
                    value: changedStatus,
                    set:true
                },
                {
                    refUrl:'users/'+userId+'/orderHistory/'+orderId+'/orderStatus',
                    value: changedStatus,
                    set:true
                }];
            localFb.batchUpdate(values, true).then(function(){}, function(err){
                console.log(JSON.stringify(err));
            });
        };
        $scope.renewSubTotal=function(orderId, productsInfo){
            var subTotal=0;
            for(var productId in productsInfo){
                subTotal+=productsInfo[productId].price*productsInfo[productId].quantity
            }
            $scope.subTotal[orderId]=subTotal
        };


        $scope.selectOrder=function(orderId){
            $scope.selectedOrder=$scope.allOrders[orderId];
            $scope.selectedOrder.orderId=orderId;
        };
        $scope.removeOrder=function(orderId, userId){
            var values=[
                {
                    refUrl:'users/'+userId+'/orderHistory/'+orderId,
                    value:null,
                    set:true
                },
                {
                    refUrl:'orders/'+orderId,
                    value:null,
                    set:true
                }
            ];
            localFb.batchUpdate(values, true)
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