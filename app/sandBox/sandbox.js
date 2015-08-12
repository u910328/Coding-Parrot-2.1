//Step 1: name the new module.
var newModule='myApp.pageSeed';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/pageSeed',
        ctrlName='PageSeedCtrl',
        templateUrl='pageSeed/pageSeed.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, viewLogic, model) {
        $scope.test=function(){
            var ref=new Firebase('https://cpmain.firebaseio.com/binderTest/123/456');
            ref.orderByKey().limitToFirst(2).on('child_added', function(snap){
                console.log(snap.key(), snap.val());
            }, function(err){
                console.log(JSON.stringify(err))
            });
        }
    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
            //resolve: {
            //  // forces the page to wait for this promise to resolve before controller is loaded
            //  // the controller can then inject `user` as a dependency. This could also be done
            //  // in the controller, but this makes things cleaner (controller doesn't need to worry
            //  // about auth status or timing of accessing data or displaying elements)
            //  user: ['Auth', function (Auth) {
            //    return Auth.$waitForAuth();
            //  }]
            //}e
        });
    }]);

})(angular);
appDI.push(newModule);