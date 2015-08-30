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
    app.controller(ctrlName, function ($scope, $firebaseObject, $location, viewLogic, model, snippet, localFb) {
        var fbObj=new localFb.FbObj('products');
        $scope.productList=$firebaseObject(fbObj.ref());

        $scope.checkDetail=function(itemId){
            $location.path('/productDetail/'+itemId);
        };

        //carousel
        $scope.myInterval = 2500;
        $scope.noWrapSlides = false;
        var slides = $scope.slides = [];
        $scope.addSlide = function() {
            var newWidth = 1200;
            slides.push({
                image: '//placehold.it/' + newWidth + 'X525',
                text: ['雞腿 Chicken','豬腿 Pork','羊腿 Lamb'][slides.length % 10] + ' ' +
                ['便當 Bento','便當 Bento','便當 Bento'][slides.length % 10]
            });
        };
        for (var i=0; i<3; i++) {
            $scope.addSlide();
        }
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