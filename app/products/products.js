//Step 1: name the new module.
var newModule='myApp.products';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/products',
        ctrlName='ProductsCtrl',
        templateUrl='products/products.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, $location, viewLogic, model, snippet, localFb) {
        var fbObj=new localFb.FbObj('products');
        $scope.productList=$firebaseObject(fbObj.ref());

        $scope.checkDetail=function(itemId){
            $location.path('/productDetail/'+itemId);
            localFb.load('products/'+itemId, 'products.'+itemId);
        }
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName/*,
            resolve: {
              // forces the page to wait for this promise to resolve before controller is loaded
              // the controller can then inject `user` as a dependency. This could also be done
              // in the controller, but this makes things cleaner (controller doesn't need to worry
              // about auth status or timing of accessing data or displaying elements)
              user: ['Auth', function (Auth) {
                return Auth.$waitForAuth();
              }]
            }*/
        });
    }]);

})(angular);
appDI.push(newModule);