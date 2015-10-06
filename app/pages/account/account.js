window.newModule = 'pages.account';

(function (angular) {
    "use strict";

    var state = 'account',
        url = '/account',
        ctrlName = 'AccountCtrl',
        templateUrl = 'pages/account/account.html',
        resolve = {
            user: ['Auth', function (Auth) {
                return Auth.$waitForAuth();
            }]
        },
        directiveName = 'obAccount';

    var app = angular.module(window.newModule, []);

    app.controller(ctrlName, /*@ngInject*/ function ($rootScope, $scope, Auth, fbutil, user, $state, $firebaseObject, $mdDialog) {
            var unbind;
            // create a 3-way binding with the user profile object in Firebase
            //$rootScope.showAcc=false;
            var profile = $firebaseObject(fbutil.ref('users', user.uid));
            profile.$bindTo($scope, 'profile').then(function (ub) {
                unbind = ub;
            });

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            // expose logout function to scope
            $scope.logout = function () {
                if (unbind) {
                    unbind();
                }
                profile.$destroy();
                Auth.$unauth();
                $mdDialog.cancel();
                $state.go('home');
            };
            //$rootScope.logout = $scope.logout;

            $scope.changePassword = function (pass, confirm, newPass) {
                resetMessages();
                if (!pass || !confirm || !newPass) {
                    $scope.err = 'Please fill in all password fields';
                }
                else if (newPass !== confirm) {
                    $scope.err = 'New pass and confirm do not match';
                }
                else {
                    Auth.$changePassword({email: profile.email, oldPassword: pass, newPassword: newPass})
                        .then(function () {
                            $scope.msg = 'Password changed';
                        }, function (err) {
                            $scope.err = err;
                        })
                }
            };

            $scope.clear = resetMessages;

            $scope.changeEmail = function (pass, newEmail) {
                resetMessages();
                var oldEmail = profile.email;
                Auth.$changeEmail({oldEmail: oldEmail, newEmail: newEmail, password: pass})
                    .then(function () {
                        // store the new email address in the user's profile
                        return fbutil.handler(function (done) {
                            fbutil.ref('users', user.uid, 'email').set(newEmail, done);
                        });
                    })
                    .then(function () {
                        $scope.emailmsg = 'Email changed';
                    }, function (err) {
                        $scope.emailerr = err;
                    });
            };

            function resetMessages() {
                $scope.err = null;
                $scope.msg = null;
                $scope.emailerr = null;
                $scope.emailmsg = null;
            }
        }
    );

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: resolve
        });
    }]);

    app.run(function ($rootScope, $mdDialog) {
        $rootScope.showAccount = function ($event) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'pages/account/accountDialog.html',
                locals: {
                    user: $rootScope.user
                },
                clickOutsideToClose: true,
                controller: 'AccountCtrl'
            });
        };
    });

    if (directiveName) {
        app.directive(directiveName, ['linkFn', function (linkFn) {
            return {
                restrict: 'E',
                templateUrl: templateUrl,
                scope: {
                    stateParams: '&'
                },
                link: function(scope){
                    linkFn.pagePlusDirective(scope, ctrlName, resolve);
                }
            };
        }]);
    }

})(angular);

if(window.appDI) window.appDI.push(window.newModule);