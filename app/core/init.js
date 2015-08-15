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
        .run(function($rootScope, $q, Auth, localFb, model, init, snippet, config, ngCart){
            //custom code
            model.calcSubTotal=function(orderId, productsInfo, scope){
                var subTotal=0;
                for(var productId in productsInfo){
                    subTotal+=productsInfo[productId].price*productsInfo[productId].quantity
                }
                if(scope) {
                    scope.subTotal=scope.subTotal||{};
                    scope.subTotal[orderId]=subTotal;
                }
                return subTotal;
            };

            //template
            if(config.debug) console.log('debug mode');




            function refreshTotalItems(){
                $rootScope.cartTotalItems=ngCart.getTotalItems()
            }

            $rootScope.$on('ngCart:change', refreshTotalItems);
            refreshTotalItems();
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
