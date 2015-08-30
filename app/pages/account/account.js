var newModule='myApp.account';

(function (angular) {
    "use strict";

    var route='/account',
        ctrlName='AccountCtrl',
        templateUrl='pages/account/account.html';

    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller(ctrlName, ['$scope', 'Auth', 'fbutil', 'user', '$location', '$firebaseObject',
        function($scope, Auth, fbutil, user, $location, $firebaseObject) {
            var unbind;
            // create a 3-way binding with the user profile object in Firebase
            var profile = $firebaseObject(fbutil.ref('users', user.uid));
            profile.$bindTo($scope, 'profile').then(function(ub) { unbind = ub; });

            // expose logout function to scope
            $scope.logout = function() {
                if( unbind ) { unbind(); }
                profile.$destroy();
                Auth.$unauth();
                $location.path('/login');
            };

            $scope.changePassword = function(pass, confirm, newPass) {
                resetMessages();
                if( !pass || !confirm || !newPass ) {
                    $scope.err = 'Please fill in all password fields';
                }
                else if( newPass !== confirm ) {
                    $scope.err = 'New password and confirm password do not match';
                }
                else {
                    Auth.$changePassword({email: profile.email, oldPassword: pass, newPassword: newPass})
                        .then(function() {
                            $scope.msg = 'Password changed';
                        }, function(err) {
                            $scope.err = err;
                        })
                }
            };

            $scope.clear = resetMessages;

            $scope.changeEmail = function(pass, newEmail) {
                resetMessages();
                var oldEmail = profile.email;
                Auth.$changeEmail({oldEmail: oldEmail, newEmail: newEmail, password: pass})
                    .then(function() {
                        // store the new email address in the user's profile
                        return fbutil.handler(function(done) {
                            fbutil.ref('users', user.uid, 'email').set(newEmail, done);
                        });
                    })
                    .then(function() {
                        $scope.emailmsg = 'Email changed';
                    }, function(err) {
                        $scope.emailerr = 'Non-valid email';
                    });
            };

            function resetMessages() {
                $scope.err = null;
                $scope.msg = null;
                $scope.emailerr = null;
                $scope.emailmsg = null;
            }
        }
    ]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.whenAuthenticated(route, { // user whenAuthenticated instead of when if you need this page can only be seen by logged in user. user who did not log in will be redirected to the default route. (loginRedirectPath in config.js)
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);
appDI.push(newModule);