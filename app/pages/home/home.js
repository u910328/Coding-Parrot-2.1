//Step 1: name the new module.
var newModule='myApp.home';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/home',
        ctrlName='HomeCtrl',
        templateUrl='pages/home/home.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, $firebaseObject, $firebaseArray, $location, viewLogic, model, snippet, localFb, fbutil) {
        var fbObj=new localFb.FbObj('products');
        $scope.productList=$firebaseObject(fbObj.ref());
        $scope.about = $firebaseObject(fbutil.ref('about'));

        //home-image
        $scope.homeImage = $firebaseObject(fbutil.ref('config/home'));

        //carousel
        $scope.myInterval = 2500;
        $scope.noWrapSlides = false;
        var slides = $scope.slides = $firebaseArray(localFb.ref('config/home-slides'));
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
        }).otherwise({
            redirectTo: 'home'
        });
    }]);

})(angular);
appDI.push(newModule);