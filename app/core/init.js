(function (angular){
    angular.module('core.init', ['firebase', 'myApp.config', 'firebase.auth', 'core.localFb','core.model','core.snippet','ngCart','ui.bootstrap'])
        .factory('init', ['Auth','localFb','$q','model',function(Auth, localFb, $q, model) {
            //function logInMain(){}
            //function getDbName(){}
            //function getIdentity(){}
            //function logInOthersAnonymously(){}
            ////compile viewLogic

            return {}
        }])
        .config(function(stripeProvider){
            stripeProvider.setPublishableKey('pk_test_h8DUz8dP0QDdFpVQlKXYjks3');
        })
        .run(function($rootScope, $q, Auth, localFb, model, init, snippet, config, ngCart, ngNotify, $firebaseArray){
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

            //$rootScope.broadcasts={};
            //$rootScope.addBroadcast=function(broadcast){
            //    angular.extend($rootScope.broadcasts, broadcast);
            //};
            //$rootScope.closeBroadcast = function(index) {
            //    delete $rootScope.broadcasts[index];
            //};

            //template
            if(config.debug) console.log('debug mode');

            ngCart.setShipping(1);
            ngCart.setTaxRate(6);


            function refreshTotalItems(){
                $rootScope.cartTotalItems=ngCart.getTotalItems()
            }

            $rootScope.$on('ngCart:change', refreshTotalItems);
            refreshTotalItems();

            var _ref;
            Auth.$onAuth(function(user) { //app.js也有同樣的用法
                if(user) {
                    console.log('user', user);
                    localFb.params={
                        '$uid':user.uid
                    };

                    $rootScope.user=user;

                    _ref=localFb.ref('users/'+user.uid+'/notification').orderByChild('unread').equalTo(true).limitToLast(10);
                    $rootScope.notification=$firebaseArray(_ref);

                    $rootScope.notification.$watch(function(obj){
                        var newNoti=$rootScope.notification.$getRecord(obj.key);
                        var orderStatus='your order('+obj.key+') is '+newNoti.orderStatus;
                        ngNotify(orderStatus);
                    });
                } else {
                    if(_ref ) _ref.off();
                    console.log('no user', user);
                    localFb.params={};
                }
            });
        });
})(angular);
