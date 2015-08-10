//Step 1: name the new module.
var newModule='myApp.order';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/order',
        ctrlName='OrderCtrl',
        templateUrl='order/order.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function (user, $scope, model, localFb, snippet, $location) {
        if(user) localFb.params={
            '$uid':user.uid
        };


        $scope.order=model.order;

        var orderStructure=[
            {
                refUrl:'orders/$orderId',
                valueArr:[
                    'clientName',
                    'clientId',
                    'itemId',
                    'itemName',
                    'quantity',
                    'price',
                    'createdTime',
                    'payment',
                    'shipment',
                    'orderStatus',
                    'selectedOption',
                    'schedule'
                ],
                value:{}
            },
            {
                refUrl:'users/$uid/orderHistory/$orderId',
                valueArr:[
                    'itemId',
                    'itemName',
                    'quantity',
                    'price',
                    'createdTime',
                    'payment',
                    'shipment',
                    'orderStatus',
                    'selectedOption',
                    'schedule'
                ],
                value:{}
            }
        ];

        $scope.checkout=function(){

            $scope.order.clientId=user.uid;
            $scope.order.clientName=user[user.provider].displayName||user[user.provider].email;
            $scope.order.orderStatus='received';
            $scope.order.createdTime=Firebase.ServerValue.TIMESTAMP;

            var values=snippet.createBatchUpdateValues($scope.order, orderStructure);
            localFb.batchUpdate(values, true).then(function(){
                $location.path('/invoice');
            }, function(err){
                console.log(JSON.stringify(err));
            });
        }
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
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