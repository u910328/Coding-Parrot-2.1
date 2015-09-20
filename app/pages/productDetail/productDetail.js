var newModule = 'myApp.productDetail';
(function (angular) {
    "use strict";

    var state = 'productDetail',
        url = '/productDetail/:pid',
        ctrlName = 'ProductDetailCtrl',
        templateUrl = 'pages/productDetail/productDetail.html';

    var app = angular.module(newModule, []);

    app.controller(ctrlName, function ($scope, user, $firebaseObject, localFb, $location, $stateParams, model) {
        var productId = $stateParams.pid;
        $scope.id = productId;
        $scope.user = user;
        $scope.loaded = function (value) {
            angular.extend(value, {
                quantity: 1,
                itemId: productId
            })
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