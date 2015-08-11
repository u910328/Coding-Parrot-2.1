(function (angular){
    angular.module('core.init', ['firebase', 'myApp.config'])
        .factory('init', ['Auth','localFb','$q','model',function(Auth, localFb, $q, model) {
            //function logInMain(){}
            //function getDbName(){}
            //function getIdentity(){}
            //function logInOthersAnonymously(){}
            ////compile viewLogic
            return {}
        }])
        .run(function($rootScope, $q, Auth, localFb, model, init, snippet, config){
            var def=$q.defer();
            var WaitUntil=new snippet.WaitUntil(5, function(){
                def.resolve();
            });
            if(config.debug) console.log('debug mode');
            Auth.$onAuth(function(user) { //app.js也有同樣的用法

                if(user) {
                    console.log('user', user);
                    localFb.params={
                        '$uid':user.uid
                    }
                } else {
                    console.log('no user', user);
                    localFb.params={};
                }
            });
        });
})(angular);
