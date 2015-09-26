var newModule='myApp.security';

(function (angular) {
    "use strict";

    // when $routeProvider.whenAuthenticated() is called, the path is stored in this list
    // to be used by authRequired() in the services below
    var securedStates = [];

    angular.module(newModule, ['ui.router', 'firebase.auth', 'myApp.config'])

        .config(['$urlRouterProvider', function ($urlRouterProvider) {
            // routes which are not in our map are redirected to 'home'
            $urlRouterProvider.otherwise('/index');
        }])

    /**
     * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
     * when called, waits for auth status to be resolved asynchronously, and then fails/redirects
     * if the user is not properly authenticated.
     *
     * The promise either resolves to the authenticated user object and makes it available to
     * dependency injection (see AuthCtrl), or rejects the promise if user is not logged in,
     * forcing a redirect to the /login page
     */
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.stateAuthenticated = function (name, stateObject) {
                securedStates.push(name);
                stateObject.resolve = stateObject.resolve || {};
                stateObject.resolve.authData = ['Auth', function (Auth) {
                    return Auth.$requireAuth();
                }];
                $stateProvider.state(name, stateObject);
                return this;
            }
        }])

    /**
     * Apply some route security. Any route's resolve method can reject the promise with
     * { authRequired: true } to force a redirect. This method enforces that and also watches
     * for changes in auth status which might require us to navigate away from a path
     * that we can no longer view.
     */
        .run(['$rootScope', '$location', '$state', 'Auth','loginRedirectState',
            function ($rootScope, $location, $state, Auth, loginRedirectState) {
                Auth.$onAuth(checkState);

                function checkState(user) {
                    if (!user && authStateRequired($state.current.name)) {
                        console.log('check failed', user, $location.path()); //debug
                        $state.transitionTo(loginRedirectState);
                    }
                }

                $rootScope.$on('$stateChangeError',
                    function (event, toState, toParams, fromState, fromParams, error) {
                        if (error === "AUTH_REQUIRED") {
                            event.preventDefault();
                            $state.transitionTo(loginRedirectState);
                        }
                    });

                function authStateRequired(name) {
                    console.log('authRequired?', name, securedStates.indexOf(name)); //debug
                    return securedStates.indexOf(name) !== -1;
                }
            }
        ]);

})(angular);

if(appDI) appDI.push(newModule);