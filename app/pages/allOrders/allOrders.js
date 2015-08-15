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
    app.controller(ctrlName, function ($scope, $firebaseArray, $firebaseObject, model, localFb, snippet, $location, $filter) {

        var fbObj=new localFb.FbObj('orders');

        $scope.loadOrders=function(n){
            var nDaysAgo=(new Date).getTime()-n*24*60*60*1000;
            var ref=fbObj.ref().orderByChild('createdTime').startAt(nDaysAgo);

            $scope.allOrdersSrc=$firebaseArray(ref);
        };

        $scope.loadOrders(1);

        var delayedFilter=new snippet.DelayedFilter($scope, 'allOrdersSrc', 'allOrders', 'filterKeys',500);
        $scope.filterKeys='';
        $scope.allOrders=$scope.allOrdersSrc;
        $scope.setFilter=delayedFilter.setFilter;

        $scope.checkFilter=function(isChecked, filterValue){
            if(isChecked) {$scope.setFilter(filterValue)}
            else {$scope.setFilter()}
        };



        $scope.statusOptions=['received','preparing','ready', 'delivered'];
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
        $scope.calcSubTotal=model.calcSubTotal;


        $scope.selectOrder=function(orderId, order){
            $scope.selectedOrder=order;
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