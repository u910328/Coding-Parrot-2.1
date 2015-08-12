//Step 1: name the new module.
var newModule='myApp.productDetail';
(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/productDetail/:pid',
        ctrlName='ProductDetailCtrl',
        templateUrl='pages/productDetail/productDetail.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, localFb, $location, $routeParams, model, snippet) {

        var productId=$routeParams.pid;
        $scope.productInfo=model.products[$routeParams.pid];
        $scope.quantity=1;
        //$scope.productInfo.selectedOption = $scope.productInfo.options[1];


        $scope.addToCart=function(){
            //shape the data
            var productInfo=angular.extend({},$scope.productInfo);
            productInfo.quantity=productInfo.quantity||1;
            //assign the data to the model, so that it can be reached by other controller
            model.cart=model.cart||{products:{}};
            model.cart.products[productId]=productInfo;

            $location.path('/products')
        };
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