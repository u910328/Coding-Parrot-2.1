//Step 1: name the new module or use a random id.
window.newModule = window.randomString(8);

(function (angular) {
    "use strict";

//Step 2: set state, url, ctrlName and templateUrl.
    var state = 'pageSeed',
        url = '/pageSeed',
        ctrlName = 'PageSeedCtrl',
        templateUrl = 'pages/pageSeed/pageSeed.html',
        directiveName = '',
        resolve = {
            // forces the page to wait for this promise to resolve before controller is loaded
            // the controller can then inject `user` as a dependency. This could also be done
            // in the controller, but this makes things cleaner (controller doesn't need to worry
            // about auth status or timing of accessing data or displaying elements)
            user: ['Auth', function (Auth) {
                return Auth.$waitForAuth();
            }]
        };

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'core.model']);

//Step 4: construct a controller. Notice that $scope is required, don't delete it.
    app.controller(ctrlName, /*@ngInject*/ function ($scope) {
        //create your own controller here
    });

//Step 5: config providers.
    app.config(/*@ngInject*/ function ($stateProvider) {
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: resolve
        });
    });

    if (directiveName) {
        app.directive(directiveName, /*@ngInject*/ function (linkFn) {
            return {
                restrict: 'E',
                templateUrl: templateUrl,
                scope: {
                    stateParams: '@'
                },
                link: function (scope) {
                    linkFn.pagePlusDirective(scope, ctrlName, resolve);
                }
            };
        });
    }

})(angular);

if (window.appDI) window.appDI.push(window.newModule);