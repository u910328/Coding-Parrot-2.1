window.newModule = 'core.init';
(function (angular) {
    angular.module(window.newModule, ['firebase', 'myApp.config'])
        .factory('init', ['Auth', '$q', 'model', function (Auth, $q, model) {
            //function logInMain(){}
            //function getDbName(){}
            //function getIdentity(){}
            //function logInOthersAnonymously(){}
            ////compile viewLogic

            return {}
        }])
        .run(function ($rootScope, $http, $state, $mdSidenav, $q, Auth, $firebase, model, init, snippet, config, ngCart, $mdDialog) {
            //get geoip
            $http.jsonp('http://www.telize.com/geoip?callback=JSON_CALLBACK').then(function (response) {
                console.log(response)
            });

            $rootScope.debug = config.debug;
            if (config.debug) console.log('debug mode');

            $rootScope.toggleSidenav = function (menuId) {
                $mdSidenav(menuId).toggle();
            };

            $rootScope.sideNavLogout = function (menuId) {
                Auth.$unauth();
                $mdSidenav(menuId).toggle();
                $state.go('home');
            };

            //template


            ngCart.setShipping(config.shipping);
            ngCart.setTaxRate(config.taxRate);


            function refreshTotalItems() {
                $rootScope.cartTotalItems = ngCart.getTotalItems()
            }

            $rootScope.$on('ngCart:change', refreshTotalItems);
            refreshTotalItems();

            Auth.$onAuth(function (user) { //app.js也有同樣的用法
                if (user) {
                    console.log('user', user);
                    $firebase.params = {
                        '$uid': user.uid
                    };
                    $rootScope.user = user;

                    var preLoadList={
                        profileImageURL:{
                            refUrl:'users/' + user.uid+'/profileImageURL'
                        },
                        stripeKey:{
                            refUrl:'config/payment/stripe/publishable_key'
                        }
                    };

                    $firebase.load(preLoadList).then(function(res){
                        user.profileImageURL = res.profileImageURL;
                        $rootScope.user = user;
                        if(res.stripeKey&&Stripe) Stripe.setPublishableKey(res.stripeKey);
                    });
                    //Notification
                    //_ref=$firebase.ref('users/'+user.uid+'/notification').orderByChild('unread').equalTo(true).limitToLast(10);
                    //$rootScope.notification=$firebaseArray(_ref);
                    //
                    //$rootScope.$watch('notification',function(obj){
                    //    var newNoti=$rootScope.notification.$getRecord(obj.key)||{};
                    //    var orderStatus='your order('+obj.key+') is '+newNoti.orderStatus;
                    //    ngNotify(orderStatus);
                    //});
                } else {
                    console.log('no user', user);
                    $rootScope.user={};
                    $firebase.params = {};
                }
            });
        });
})(angular);

if (window.appDI) window.appDI.push(window.newModule);