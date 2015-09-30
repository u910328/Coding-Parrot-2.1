////Step 1: name the new module.
//window.newModule = 'pages.home';
//
//(function (angular) {
//    "use strict";
//
////Step 2: set route, ctrlName and templateUrl.
//    var state = 'home',
//        url = '/home',
//        ctrlName = 'HomeCtrl',
//        templateUrl = 'pages/home/home.html';
//
////Step 3: write down dependency injection.
//    var app = angular.module(window.newModule, []);
//
////Step 4: construct a controller.
//    app.controller(ctrlName, /*@ngInject*/
//        function ($scope, $mdDialog, user) {
//            var productId;
//            $scope.showDetails = function (ev, pid) {
//                productId = pid;
//                $mdDialog.show({
//                    controller: productDetailCtrl,
//                    templateUrl: 'pages/productDetail/productDetail.html',
//                    parent: angular.element(document.body),
//                    targetEvent: ev,
//                    clickOutsideToClose: true
//                })
//            };
//            var productDetailCtrl = function ($scope, $rootScope) {
//                $scope.loggedIn = function () {
//                    return $rootScope.loggedIn
//                };
//                $scope.id = productId;
//                $scope.user = user;
//                $scope.loaded = function (value) {
//                    angular.extend(value, {
//                        quantity: 1,
//                        itemId: productId
//                    })
//                };
//                $scope.cancel = function() {
//                    $mdDialog.cancel();
//                };
//            }
//
//        });
//
//
////Step 5: config providers.
//    app.config(['$stateProvider', function ($stateProvider) {
//        $stateProvider.state(state, {
//            url: url,
//            templateUrl: templateUrl,
//            controller: ctrlName,
//            resolve: {
//                user: ['Auth', function (Auth) {
//                    return Auth.$waitForAuth();
//                }]
//            }
//        });
//    }]);
//
//})(angular);
//
//if (window.appDI) window.appDI.push(window.newModule);

//Step 1: name the new module.
window.newModule='pages.home';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='home',
        url='/home',
        ctrlName='HomeCtrl',
        templateUrl='pages/home/home.html';

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function ($rootScope, $scope, $mdDialog) {
        $scope.showDetail= function($event, pid) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl:'pages/productDetail/productDetail.html',
                locals: {
                    $stateParams: {pid:pid},
                    user: $rootScope.user
                },
                clickOutsideToClose: true,
                controller: 'ProductDetailCtrl'
            });
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