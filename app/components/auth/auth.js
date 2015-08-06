angular.module('firebase.auth', ['firebase', 'firebase.utils'])
    .factory('Auth', ['$firebaseAuth', 'fbutil', '$q', 'FBURL', function ($firebaseAuth, fbutil, $q, FBURL) {
        var Auth = {
            auth: auth
        };
        var def = $q.defer();
        function checkThenRecordUserData(authData) {
            //註冊登入時間到 mainDb 裡的user/uid
            // security 限制未創帳號不能寫入
            var ref = new Firebase((FBURL + 'users/'+authData.uid));   //TODO: 加入對多firebase的支援;

            ref.update({lastTimeLoggedIn: Firebase.ServerValue.TIMESTAMP}, function (error) {
                if (error) {
                    if (error.code==='PERMISSION_DENIED') {
                        var updateVal=recordUserData(authData);
                        ref.update(updateVal, function(error){
                            if(error){
                                def.reject(error)
                            } else {
                                def.resolve(authData)
                            }
                        })
                    } else {
                        def.reject(error)
                    }
                } else {
                    def.resolve(authData);
                }
            })
        }

        function recordUserData(authData){
            var name, email;
            switch(authData.provider){
                case 'password':
                    name=authData.password.email.replace(/@.*/, '');
                    email=authData.password.email;
                    break;
                case 'facebook':
                    name=authData.facebook.displayName;
                    email=authData.facebook.email;
                    break;
                case 'twitter':
                    name=authData.twitter.displayName;
                    email=null;
                    break;
                case 'github':
                    name=authData.github.displayName;
                    email=authData.github.email;
                    break;
                case 'google':
                    name=authData.google.displayName;
                    email=authData.google.email;
                    break;
                case 'custom':
                    name=authData.uid;
                    email=null;
                    break;
                case 'anonymous':
                    name=authData.uid;
                    email=null;
                    break;
            }
            return {
                createdTime:Firebase.ServerValue.TIMESTAMP,
                name:name,
                email:email,
                lastTimeLoggedIn:Firebase.ServerValue.TIMESTAMP
            };
        }


        function logIn(config) {
            var ref = new Firebase(FBURL);   //TODO: 加入對多firebase的支援;

            function authOnComplete(err, authData){
                if(err){
                    def.reject(err);
                } else {
                    checkThenRecordUserData(authData);
                }
            }

            switch(config.provider){
                case 'password':
                    ref.authWithPassword(authOnComplete, config);
                    break;
                case 'custom':
                    ref.authWithCustomToken(config.customToken, authOnComplete, config);
                    break;
                case 'anonymous':
                    config.rememberMe='none';
                    ref.authAnonymously(authOnComplete, config);
                    break;
                default:
                    if (config.popup) {              //OAuth popup
                        ref.authWithOAuthPopup(config.provider, authOnComplete, config);
                    } else {                       //OAuth redirect
                        ref.authWithOAuthRedirect(config.provider, authOnComplete, config);
                    }
                    break;
            }
            return def.promise
        }

        function removeUserData(authData, extraCallBack){
            var ref = new Firebase((FBURL + 'users/'+authData.uid));   //TODO: 加入對多firebase的支援;

            ref.remove(function(err){
                if(err){
                    console.log(err.code);
                } else {
                    if(extraCallBack) extraCallBack(authData);

                }
            });
        }

        function auth(config, onAuthCB, offAuthCB){
            var def=$q.defer();
            logIn(config).then(function(authData){

                ref.onAuth(function(){
                    if(onAuthCB) onAuthCB(authData);
                });

                ref.offAuth(function(){
                    if(config.provider==='anonymous'){
                        removeUserData(authData, offAuthCB);
                    } else {
                        if(!offAuthCB) offAuthCB(authData);
                    }
                });

                def.resolve(authData);
            }, function(err){
                def.reject(err);
            });
            return def.promise
        }

        return $firebaseAuth(fbutil.ref());
    }]);
