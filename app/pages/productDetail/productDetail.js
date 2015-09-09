var newModule = 'myApp.productDetail';
(function (angular) {
    "use strict";

    var state='productDetail',
        url = '/productDetail/:pid',
        ctrlName = 'ProductDetailCtrl',
        templateUrl = 'pages/productDetail/productDetail.html';

    var app = angular.module(newModule, []);

    app.controller(ctrlName, function ($scope, user, $firebaseObject, localFb, $location, $stateParams, model) {
        var productId = $stateParams.pid;
        $scope.show = false;
        $scope.user = user;
        $scope.productInfo = {quantity: 1};
        localFb.load('products/' + productId, 'products.' + productId, {scope: $scope}, function () {
            $scope.productInfo = model.products[productId];
            angular.extend($scope.productInfo,
                {
                    quantity: 1,
                    itemId: productId
                }
            );
            $scope.show = true;
        });


        /*  $scope.setOption = function () {
         $scope.productInfo.selectedOption;
         };*/

        //$scope.productInfo.selectedOption = $scope.productInfo.options[1];


        $scope.keepShopping = function () {
            ////shape the data
            //var productInfo = angular.extend({}, $scope.productInfo);
            //productInfo.quantity = $scope.quantity || 1;
            ////assign the data to the model, so that it can be reached by other controller
            //model.cart = model.cart || {products: {}};
            //model.cart.products[productId] = productInfo;

            $location.path('/products')
        };
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