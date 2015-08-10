"use strict";
angular.module('myApp.login', ['firebase.utils', 'firebase.auth', 'ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html'
    });
  }])

  .controller('LoginCtrl', ['$scope', 'Auth', '$location', 'fbutil', 'snippet', 'localFb', function($scope, Auth, $location, fbutil, snippet, localFb) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

      function showError(err) {
        $scope.err = snippet.errMessage(err);
      }

    $scope.login = function(email, pass) {
      $scope.err = null;
      Auth.$authWithPassword({ email: email, password: pass }, {rememberMe: true})
        .then(function(/* user */) {
          $location.path('/account');
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
            // redirect to the account page
            $location.path('/home');
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
              $location.path('/home');
              return Auth.checkIfAccountExistOnFb(user)
            }, showError)
            .then(function(user){return Auth.createAccount(user)}, showError)
            .then(function(){}, showError)
      }
  }]);