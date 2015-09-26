//Step 1: name the new module or use a random id.
var newModule = randomString(8);

(function (angular) {
    "use strict";

//Step 2: set state, url, ctrlName and templateUrl.
    var state='pageSeed',
        url='/pageSeed',
        ctrlName='PageSeedCtrl',
        templateUrl='pages/pageSeed/pageSeed.html',
        directiveName='';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller. Notice that $scope is required, don't delete it.
    app.controller(ctrlName, function ($scope) {
        //create your own controller here
    });

//Step 5: config providers.
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state(state, {
            url: url,
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

    if (directiveName) {
        app.directive(directiveName, ['linkFn', function (linkFn) {
            return {
                restrict: 'E',
                templateUrl: templateUrl,
                scope: {
                    initparams: '@'
                },
                link: function(scope){
                    linkFn.pagePlusDirective(scope, ctrlName, resolve);
                }
            };
        }]);
    }

})(angular);
appDI.push(newModule);