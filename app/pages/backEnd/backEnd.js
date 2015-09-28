//Step 1: name the new module.
window.newModule = 'pages.backEnd';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state = 'backEnd',
        url='/backEnd',
        ctrlName = 'BackEndCtrl',
        templateUrl = 'pages/backEnd/backEnd.html';

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function ($scope, $firebaseArray, $firebaseObject, customFn, $firebase, snippet) {
        //to show orders
        $scope.loadOrders = function (startDay, endDay) {
            var now = (new Date).getTime(),
                day = 24 * 60 * 60 * 1000;
            var ref = $firebase.ref('orders').orderByChild('schedule').startAt(now + startDay * day).endAt(now + endDay * day);

            $scope.allOrdersSrc = $firebaseArray(ref);
        };

        //$scope.loadOrders(-0.5, 1); //today's order

        var delayedFilter = new snippet.DelayedFilter($scope, 'allOrdersSrc', 'allOrders', 'filters', 500);


        $scope.filterOpt={};
        $scope.refreshFilter = function () {
            $scope.search=$scope.search? $scope.search:'';
            var searcKeyhArr=$scope.search.split(' ');
            $scope.filters=angular.extend({}, $scope.filterOpt, searcKeyhArr);
        };

        $scope.$watch('filterOpt', function(){
            $scope.refreshFilter();
        }, true);


        $scope.statusOptions = ['received', 'preparing', 'ready', 'picked-up'];
        $scope.orderStatus = {};

        $scope.changeOrderStatus = function (orderId, userId, changedStatus) {
            console.log(orderId, userId, changedStatus);
            var values = [
                {
                    refUrl: 'orders/' + orderId + '/orderStatus',
                    value: changedStatus,
                    set: true
                },
                {
                    refUrl: 'users/' + userId + '/orderHistory/' + orderId + '/orderStatus',
                    value: changedStatus,
                    set: true
                }
            ];
            $firebase.batchUpdate(values, true).then(function () {
            }, function (err) {
                console.log(JSON.stringify(err));
            });
        };
        $scope.calcSubTotal = customFn.calcSubTotal;


        $scope.removeOrder = function (orderId, userId, reason) {
            var values = [
                {
                    refUrl: 'users/' + userId + '/orderHistory/' + orderId,
                    value: null,
                    set: true
                },
                {
                    refUrl: 'orders/' + orderId,
                    value: null,
                    set: true
                }
            ];
            $firebase.batchUpdate(values, true).then(function(){
                $scope.refreshFilter();
            })
        };
        //to add/remove new products
        $scope.products=$firebaseObject($firebase.ref('products'));
        $scope.addOpt=function(){
            var arr=$scope.selectedProduct.options;
            $scope.selectedProduct.options[arr.length]=''
        };
        $scope.removeOpt=function(){
            var arr=$scope.selectedProduct.options;
            if(arr.length===0) return;
            $scope.selectedProduct.options.pop();
        };
        $scope.selectProduct=function(productId){
            $scope.selectedProduct={};
            $scope.selectedProduct=angular.extend({},$scope.products[productId]);
            $scope.selectedProduct.options=$scope.selectedProduct.options||[]
        };
        $scope.updateProduct=function(){
            $scope.products[$scope.selectedProduct.itemId]=$scope.selectedProduct;
            $scope.products.$save();
            $scope.selectedProduct={};
        };
        $scope.removeProduct=function(id){
            $scope.products[id]=null;
            $scope.products.$save();
        };
        $scope.createProduct=function(){
            var randomId=(new Date()).getTime().toString(36);
            $scope.selectedProduct={
                itemId:randomId,
                itemName:'',
                image:'',
                description:'',
                listPrice:'',
                price:'',
                options:['']
            }
        };
        $scope.clearProduct=function(){
            $scope.selectedProduct={}
        }
    });

//Step 5: config providers.
    app.config(['$stateProvider',function($stateProvider){
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);

if(window.appDI) window.appDI.push(window.newModule);