//Step 1: name the new module.
var newModule='myApp.stripeTest';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/stripeTest',
        ctrlName='StripeTestCtrl',
        templateUrl='pages/stripeTest/stripeTest.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, viewLogic, model, stripe) {
        //create your own controller here
        $scope.payment={card:{}};
        $scope.charge = function () {
            return stripe.card.createToken($scope.payment.card)
                .then(function (token) {
                    console.log('token created for card ending in ', token.card.last4);
                    var payment = angular.copy($scope.payment);
                    payment.card = void 0;
                    payment.token = token.id;
                    //return $http.post('https://yourserver.com/payments', payment);
                    console.log(token);
                })
                .then(function (payment) {
                    console.log('successfully submitted payment for $', payment.amount);
                })
                .catch(function (err) {
                    if (err.type && /^Stripe/.test(err.type)) {
                        console.log('Stripe error: ', err.message);
                    }
                    else {
                        console.log('Other error occurred, possibly with your API', err.message);
                    }
                });
        };
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, { // user whenAuthenticated instead of when if you need this page can only be seen by logged in user. user who did not log in will be redirected to the default route. (loginRedirectPath in config.js)
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