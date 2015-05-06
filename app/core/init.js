(function (angular){
    angular.module('core.init', ['firebase', 'myApp.config'])
        .factory('init', function(Auth, localFb, $q, model) {
            function logInMain(){}
            function getDbName(){}
            function getIdentity(){}
            function logInOthersAnonymously(){}
            //compile viewLogic
            return {

            }
        })
        .run(function($rootScope, $q, Auth, localFb, model, init, snippet){
            var def=$q.defer();
            var WaitUntil=new snippet.WaitUntil(5, function(){
                def.resolve();
            });
            Auth.$onAuth(function(user) {
                if(!!user){
                    //get current db
                    console.log('user', user)
                }else{
                    console.log('no user', user)
                }
            });
        });
})(angular);
