//Step 1: name the new module.
window.newModule='pages.login';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='login',
        url='/login',
        ctrlName='LoginCtrl',
        templateUrl='pages/login/login.html',
        directiveName='obLogin',
        resolve={};

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ui.router', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function($rootScope, $scope, Auth, $state, fbutil, snippet, $mdDialog) {
        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $rootScope.showLogin=false;
        $scope.email = null;
        $scope.pass = null;
        $scope.confirm = null;
        $scope.createMode = false;

        function redirectTo(state){
            $state.transitionTo(state);
        }

        function showError(err) {
            $scope.err = snippet.errMessage(err);
        }

        $scope.login = function(email, pass) {
            $scope.err = null;
            Auth.$authWithPassword({ email: email, password: pass }, {rememberMe: true})
                .then(function(/* user */) {
                    $mdDialog.cancel();
                    redirectTo('home');
                }, showError);
        };

        $scope.createAccount = function() {
            $scope.err = null;
            if( assertValidAccountProps() ) {
                var email = $scope.email;
                var pass = $scope.pass;
                // create user credentials in Firebase auth system
                Auth.$createUser({email: email, password: pass})
                    .then(function() {
                        // authenticate so we have permission to write to Firebase
                        return Auth.$authWithPassword({ email: email, password: pass });
                    })
                    .then(Auth.createAccount)
                    .then(function(/* user */) {
                        // redirect to home
                        $mdDialog.cancel();
                        redirectTo('home');
                    }, showError);
            }
        };

        function assertValidAccountProps() {
            if( !$scope.email ) {
                $scope.err = 'Please enter an email address';
            }
            else if( !$scope.pass || !$scope.confirm ) {
                $scope.err = 'Please enter a password';
            }
            else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
                $scope.err = 'Passwords do not match';
            }
            return !$scope.err;
        }

        $scope.loginWithProvider=function(provider, opt){
            Auth.loginWithProvider(provider, opt)
                .then(function(user) {
                    $mdDialog.cancel();
                    redirectTo('home');
                    return Auth.checkIfAccountExistOnFb(user)
                }, showError)
                .then(Auth.createAccount, showError)
                .then(function(){}, showError)
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

    if (directiveName) {
        app.directive(directiveName, ['linkFn', function (linkFn) {
            return {
                restrict: 'E',
                templateUrl: templateUrl,
                scope: {
                    stateParams: '@'
                },
                link: function(scope){
                    linkFn.pagePlusDirective(scope, ctrlName, resolve);
                }
            };
        }]);
    }
})(angular);

if(window.appDI) window.appDI.push(window.newModule);