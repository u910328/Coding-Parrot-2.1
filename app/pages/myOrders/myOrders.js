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
    app.controller(ctrlName, function (user, $scope, $firebaseArray, model, localFb, snippet, $location) {

        //var fbObj=new localFb.FbObj('users/'+user.uid+'/orderHistory');

        //$scope.loadOrders=function(n){
        //    var nDaysAgo=(new Date).getTime()-n*24*60*60*1000;
        //    var ref=fbObj.ref().orderByChild('createdTime').startAt(nDaysAgo);
        //
        //    $scope.myOrdersSrc=$firebaseArray(ref);
        //};
        //
        //$scope.loadOrders(65535);

        $scope.loadOrders = function (startDay, endDay) {
            var now = (new Date).getTime(),
                day = 24 * 60 * 60 * 1000;
            var ref = localFb.ref('users/'+user.uid+'/orderHistory').orderByChild('createdTime').startAt(now + startDay * day).endAt(now + endDay * day);

            $scope.myOrdersSrc = $firebaseArray(ref);
        };

        $scope.loadOrders(-65535, 65535); //today's order

        var delayedFilter=new snippet.DelayedFilter($scope, 'myOrdersSrc', 'myOrders', 'filterKeys',500);
        $scope.filterKeys='';
        $scope.setFilter=delayedFilter.setFilter;

        $scope.checkFilter=function(isChecked, filterValue){
            if(isChecked) {$scope.setFilter(filterValue)}
            else {$scope.setFilter()}
        };

        $scope.orderStatus={};
        $scope.subTotal={};

        $scope.calcSubTotal=model.calcSubTotal;


        $scope.selectOrder=function(orderId, order){
            $scope.selectedOrder=order;
            $scope.selectedOrder.orderId=orderId;
        };
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