//Step 1: name the new module.
var newModule='myApp.myOrders';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='myOrders',
        url='/myOrders',
        ctrlName='MyOrdersCtrl',
        templateUrl='pages/myOrders/myOrders.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

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

        var delayedFilter = new snippet.DelayedFilter($scope, 'myOrdersSrc', 'myOrders', 'filters', true, 500);

        $scope.filterOpt={};
        $scope.refreshFilter = function () {
            $scope.search=$scope.search? $scope.search:'';
            var searcKeyhArr=$scope.search.split(' ');
            $scope.filters=angular.extend({}, $scope.filterOpt, searcKeyhArr);
        };

        $scope.$watch('filterOpt', function(){
            $scope.refreshFilter();
        }, true);

        $scope.orderStatus={};
        $scope.subTotal={};

        $scope.calcSubTotal=model.calcSubTotal;


        $scope.selectOrder=function(orderId, order){
            $scope.selectedOrder=order;
            $scope.selectedOrder.orderId=orderId;
        };
    });

//Step 5: config providers.
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.stateAuthenticated(state, {
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