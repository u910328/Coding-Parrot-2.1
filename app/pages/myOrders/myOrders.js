//Step 1: name the new module.
window.newModule='pages.myOrders';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='myOrders',
        url='/myOrders',
        ctrlName='MyOrdersCtrl',
        templateUrl='pages/myOrders/myOrders.html';

//Step 3: write down dependency injection.
    var app = obsidian.module('pages.myOrders', ['myApp.security']);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function (user, $scope, $firebaseArray, $firebase, snippet) {

        $scope.loadOrders = function (startDay, endDay) {
            var now = (new Date).getTime(),
                day = 24 * 60 * 60 * 1000;
            var ref = $firebase.ref('users/'+user.uid+'/orderHistory').orderByChild('createdTime').startAt(now + startDay * day).endAt(now + endDay * day);

            $scope.myOrdersSrc = $firebaseArray(ref);
        };

        $scope.loadOrders(-65535, 65535); //today's order

        new snippet.DelayedFilter($scope, 'myOrdersSrc', 'myOrders', 'filters', true, 500);

        $scope.filterOpt={};
        $scope.refreshFilter = function () {
            $scope.search=$scope.search? $scope.search:'';
            var searcKeyhArr=$scope.search.split(' ');
            $scope.filters=angular.extend({}, $scope.filterOpt, searcKeyhArr);
        };

        $scope.$watch('filterOpt', function(){
            $scope.refreshFilter();
        }, true);


    });

//Step 5: config providers.
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.stateAuthenticated(state, {
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