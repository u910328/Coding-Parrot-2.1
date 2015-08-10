angular.module('firebase.auth', ['firebase', 'firebase.utils'])
    .factory('Auth', ['$firebaseAuth', 'fbutil', '$q', 'FBURL', 'snippet', function ($firebaseAuth, fbutil, $q, FBURL, snippet) {

        var Auth= $firebaseAuth(fbutil.ref());

        Auth.checkIfAccountExistOnFb=function(authData){
            var def=$q.defer();
            var ref= fbutil.ref('users', authData.uid, 'createdTime');
            ref.once('value', function(snap){
                if(snap.val()===null){
                    def.resolve(authData);
                }
            }, function(err){
                def.reject(err)
            });
            return def.promise
        };

        Auth.createAccount=function(authData){
            var ref=fbutil.ref('users', authData.uid);
            return fbutil.handler(function(cb){
                ref.set(Auth.basicAccountUserData(authData), cb);
            })
        };

        Auth.checkThenCreateAccount=function(authData){
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
        };

        Auth.basicAccountUserData=function(authData){
            var name, email;
            switch(authData.provider){
                case 'password':
                    name=snippet.firstPartOfEmail(authData.password.email);
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
                email:email||null
            };
        };


        Auth.loginWithProvider=function(provider, opt) {
            switch(provider){
                case 'password':
                    return Auth.$authWithPassword({ email: opt.email, password: opt.password }, opt);
                    break;
                case 'custom':
                    return Auth.$authWithCustomToken(opt.customToken, opt);
                    break;
                case 'anonymous':
                    opt.rememberMe='none';
                    return Auth.$authAnonymously(opt);
                    break;
                default:
                    if (opt&&opt.popup===false) {
                        return Auth.$authWithOAuthRedirect(provider, opt);
                    } else {
                        return Auth.$authWithOAuthPopup(provider, opt);
                    }
                    break;
            }
        };

        Auth.removeUserData=function(authData, extraCallBack){
            var ref = new Firebase((FBURL + 'users/'+authData.uid));   //TODO: 𩄍惩撠滚𩄍firebase𩄍𣈲𩄍

            ref.remove(function(err){
                if(err){
                    console.log(err.code);
                } else {
                    if(extraCallBack) extraCallBack(authData);

                }
            });
        };

        //TODO:重寫下面的CODE

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

        return Auth;
    }]);
