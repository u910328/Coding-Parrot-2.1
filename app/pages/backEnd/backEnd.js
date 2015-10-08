//Step 1: name the new module.
window.newModule = 'pages.backEnd';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state = 'backEnd',
        url = '/backEnd',
        ctrlName = 'BackEndCtrl',
        templateUrl = 'pages/backEnd/backEnd.html';

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, ['pages.backEnd.productManager', 'pages.backEnd.orders']);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function ($scope, $firebase, snippet, $errorHandler) {
        this.test='1234'
    });


//Step 5: config providers.
    app.config(function ($stateProvider) {
        $stateProvider
            .state(state, {
                url: url,
                views: {
                    "": {
                        templateUrl: templateUrl,
                        controller: ctrlName,
                        controllerAs:'be'
                    }
                }
            })
            .state(state + '.orders', {
                url: '/orders',
                views: {
                    "content": {
                        templateUrl: 'pages/backEnd/orders/orders.html',
                        controller: 'Orders'
                    }
                }
            })
            .state(state + '.productManager', {
                url: '/productManager',
                views: {
                    "content": {
                        templateUrl: 'pages/backEnd/productManager/productManager.html',
                        controller: 'ProductManager'
                    }
                }
            });
    });


})(angular);

if (window.appDI) window.appDI.push(window.newModule);