angular.module('firebase.auth', ['firebase', 'firebase.utils'])
    .factory('Auth', ['$firebaseAuth', 'fbutil', '$q', 'FBURL', 'snippet', 'localFb', function ($firebaseAuth, fbutil, $q, FBURL, snippet, localFb) {

        var Auth = $firebaseAuth(fbutil.ref());

        Auth.checkIfAccountExistOnFb = function (authData) {
            var def = $q.defer();
            if (!authData) def.reject('AUTH_NEEDED');
            var ref = fbutil.ref('users', authData.uid, 'createdTime');
            ref.once('value', function (snap) {
                if (snap.val() === null) {
                    def.resolve(authData);
                }
            }, function (err) {
                def.reject(err)
            });
            return def.promise
        };

        Auth.createAccount = function (authData, opt) {
            if (!authData) return;
            if (opt === undefined || (typeof opt !== 'object')) {
                var ref = fbutil.ref('users', authData.uid);
                return fbutil.handler(function (cb) {
                    ref.set(Auth.basicAccountUserData(authData, opt), cb);
                })
            } else {
                var def = $q.defer();
                if (!!opt.structure) {
                    var rawData = snippet.flatten(authData, opt.flattenConfig);
                    rawData.authData = authData;
                    var values = snippet.createBatchUpdateValues(rawData, opt.structure);
                    console.log(JSON.stringify(values));
                    localFb.batchUpdate(values, opt.isConsecutive).then(function () {
                        def.resolve();
                    }, opt.errorHandler);
                } else {
                    def.reject('USERDATA_STRUCTURE_NEEDED')
                }
                return def.promise
            }
        };
        //Example
        //var opt={
        //    structure:[
        //        {
        //            refUrl:'users/$uid',
        //            value:'authData' //主要user acc, 將全部authData update 到此refUrl
        //        },
        //        {
        //            refUrl:'userList/$uid', //產生一個只有 name和email 的list item
        //            value:{
        //                name:'password.name', //此string 代表authData.password.name
        //                email:'password.email'
        //            }
        //        }
        //    ]
        //};

        /*Auth.checkThenCreateAccount=function(authData){
         var def=$q.defer();
         Auth.checkIfAccountExistOnFb(authData).then(

         function(snap){
         if(snap===null) Auth.createAccount(authData).then(
         function(authData){def.resolve(authData);},
         function(err){def.reject(err)}
         )},
         function(err){
         def.reject(err)
         });
         return def.promise
         };*/

        Auth.basicAccountUserData = function (authData) {
            var provider = authData.provider,
                name = authData[provider].displayName || authData.uid,
                email = authData[provider].email || null,
                profileImageURL = authData[provider].profileImageURL || null;
            if (provider === 'password') name = snippet.firstPartOfEmail(authData.password.email);
            var basicUserInfo = {
                createdTime: Firebase.ServerValue.TIMESTAMP,
                name: name,
                email: email,
                profileImageURL: profileImageURL
            };
            basicUserInfo[provider] = {
                id: authData[provider].id || null
            };
            return basicUserInfo
        };


        Auth.loginWithProvider = function (provider, opt) {
            switch (provider) {
                case 'password':
                    return Auth.$authWithPassword({email: opt.email, password: opt.password}, opt);
                    break;
                case 'custom':
                    return Auth.$authWithCustomToken(opt.customToken, opt);
                    break;
                case 'anonymous':
                    opt.rememberMe = 'none';
                    return Auth.$authAnonymously(opt);
                    break;
                default:
                    if (opt && opt.popup === false) {
                        return Auth.$authWithOAuthRedirect(provider, opt);
                    } else {
                        return Auth.$authWithOAuthPopup(provider, opt);
                    }
                    break;
            }
        };

        Auth.removeUserData = function (authData, extraCallBack) {
            var ref = new Firebase((FBURL + 'users/' + authData.uid));   //TODO: 𩄍惩撠滚𩄍firebase𩄍𣈲𩄍

            ref.remove(function (err) {
                if (err) {
                    console.log(err.code);
                } else {
                    if (extraCallBack) extraCallBack(authData);

                }
            });
        };

        return Auth;
    }])
//following belong to accountWindow
    .controller('AccountWindowCtrl', ['$rootScope', '$scope', 'Auth', 'fbutil', '$location', '$firebaseObject',
        function ($rootScope, $scope, Auth, fbutil, $location, $firebaseObject) {
            Auth.$onAuth(function (user) { //app.js也有同樣的用法
                if (user) {
                    init(user)
                }
            });

            function init(user) {
                var unbind;
                // create a 3-way binding with the user profile object in Firebase
                var profile = $firebaseObject(fbutil.ref('users', user.uid));
                profile.$bindTo($scope, 'profile').then(function (ub) {
                    unbind = ub;
                });

                $scope.user = user;
                // expose logout function to scope
                $scope.logout = function () {
                    if (unbind) {
                        unbind();
                    }
                    profile.$destroy();
                    Auth.$unauth();
                    $location.path('/login');
                };
                $rootScope.logout=$scope.logout; //TODO:用比較好的方法expose log out

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
        }
    ])
    .directive('accountWindow', [function () {
        return {
            restrict: 'E',
            controller: 'AccountWindowCtrl',
            scope: {},
            transclude: false,
            templateUrl: function (element, attrs) {
                if (typeof attrs.templateUrl == 'undefined') {
                    return 'components/auth/accountWindow.html';
                } else {
                    return attrs.templateUrl;
                }
            }
        };
    }])
//login window
    .controller('LogInWindowCtrl', ['$scope', 'Auth', '$location', 'fbutil', 'snippet', 'localFb', function ($scope, Auth, $location, fbutil, snippet, localFb) {
        Auth.$onAuth(function (user) { //app.js也有同樣的用法
            if (!user) {
                $scope.email = null;
                $scope.pass = null;
                $scope.confirm = null;
                $scope.createMode = false;
            }
        });

        function showError(err) {
            $scope.err = snippet.errMessage(err);
        }

        $scope.login = function (email, pass) {
            $scope.err = null;
            Auth.$authWithPassword({email: email, password: pass}, {rememberMe: true})
                .then(function (/* user */) {
                    $location.path('/account');
                }, showError);
        };

        $scope.createAccount = function () {
            $scope.err = null;
            if (assertValidAccountProps()) {
                var email = $scope.email;
                var pass = $scope.pass;
                // create user credentials in Firebase auth system
                Auth.$createUser({email: email, password: pass})
                    .then(function () {
                        // authenticate so we have permission to write to Firebase
                        return Auth.$authWithPassword({email: email, password: pass});
                    })
                    .then(Auth.createAccount)
                    .then(function (/* user */) {
                        // redirect to the account page
                        $location.path('/home');
                    }, showError);
            }
        };

        function assertValidAccountProps() {
            if (!$scope.email) {
                $scope.err = 'Please enter an email address';
            }
            else if (!$scope.pass || !$scope.confirm) {
                $scope.err = 'Please enter a password';
            }
            else if ($scope.createMode && $scope.pass !== $scope.confirm) {
                $scope.err = 'Passwords do not match';
            }
            return !$scope.err;
        }

        $scope.loginWithProvider = function (provider, opt) {
            Auth.loginWithProvider(provider, opt)
                .then(function (user) {
                    $location.path('/home');
                    return Auth.checkIfAccountExistOnFb(user)
                }, showError)
                .then(Auth.createAccount, showError)
                .then(function () {
                }, showError)
        }
    }])
    .directive('logInWindow', [function () {
        return {
            restrict: 'E',
            controller: 'LogInWindowCtrl',
            scope: {},
            transclude: false,
            templateUrl: function (element, attrs) {
                if (typeof attrs.templateUrl == 'undefined') {
                    return 'components/auth/logInWindow.html';
                } else {
                    return attrs.templateUrl;
                }
            }
        };
    }]);