//Step 1: name the new module.
var newModule = 'myApp.shoppingCart';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route = '/shoppingCart',
        ctrlName = 'ShoppingCartCtrl',
        templateUrl = 'pages/shoppingCart/shoppingCart.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model', 'core.localFb']);

//Step 4: construct a controller.
    app.controller(ctrlName, function (user, $scope, model, localFb, snippet, $location, ngCart, $firebaseObject) {

        $scope.ngCart=ngCart;
        var cart={products:{}};

        angular.forEach(ngCart.getItems(), function(item){
            cart.products[item._id]=item._data;
            cart.products[item._id].quantity=item._quantity;
        });

        angular.extend(cart,
            {
                clientName: user[user.provider].displayName || user[user.provider].email,
                clientId: user.uid,
                clientEmail: user[user.provider].email || null,
                createdTime: Firebase.ServerValue.TIMESTAMP,
                orderStatus: 'received',
                payment: {}, //未來可加入用戶選擇的payment 或 shipment的資訊
                shipment: {}//
            }
        );

        $scope.keepShopping=function(){
            $location.path('/products')
        };

        $scope.emptyCart=function(){
            ngCart.empty();
            ngCart.empty()
        };


        $scope.clientEmail=$firebaseObject(localFb.ref('users/'+user.uid+'/email'));
        $scope.saveEmail=function(){
            $scope.clientEmail.$save();
        };

        $scope.number='4242424242424242';
        $scope.expiry='11/16';
        $scope.cvc='123';

        $scope.checkOut = function (code, result) {
            setToken(code,result);

            //將payment provider取得的token加入其他資料一起上傳
            uploadOrder();
        };
        function setToken(code, result){
            if (result.error) {
                window.alert('it failed! error: ' + result.error.message);
            } else {
                console.log('success! token: ' + result.id);
                cart.payment={
                    token:result.id,
                    provider:'stripe'
                };

            }
        }

        function uploadOrder() {
            //整理order 資料
            cart.clientEmail=$scope.clientEmail.$value||null;
            cart.schedule=$scope.dt.getTime();
            //payeezy.getToke(data).then(function(res){
            // cart.payment=angular.extend({paymentProvider:'payeezy'},res)
            // }); 先取得token在繼續執行
            //
            //產生要存至主order資料庫的結構
            var mainOrderStructure = {
                clientName: '',
                clientId: '',
                clientEmail: '',
                createdTime: '',
                orderStatus: '',
                //subTotal:'',        由主機端計算，防止人為竄改。
                products: {
                    $productId: {
                        itemName: '',
                        quantity: '',
                        price: '',
                        selectedOption: ''
                    }
                },
                payment: '',
                shipment: '',
                schedule: ''
            };

            //產生要存至主order資料庫的資料

            var mainOrderData = {
                refUrl: 'orders/$orderId',
                value: snippet.filterRawData(cart, mainOrderStructure)
            };
            //產生要存至user的order資料庫的結構
            var userOderReceiptStructure = {
                createdTime: '',
                orderStatus: '',
                products: {
                    $productId: {
                        itemId: '',
                        itemName: '',
                        quantity: '',
                        price: '',
                        selectedOption: ''
                    }
                },
                payment: '',
                shipment: '',
                schedule: ''
            };

            //產生要存至user的order資料庫的資料
            var userReceiptData = {
                refUrl: 'users/$uid/orderHistory/$orderId',
                value: snippet.filterRawData(cart, userOderReceiptStructure)
            };

            //放到同一個array產生批次上傳資料
            var batchOrderData = [mainOrderData, userReceiptData];

            //先取得payment的token

            //產生收據
            model.invoice = angular.extend({}, cart);

            //批次上傳
            localFb.batchUpdate(batchOrderData, true).then(function (res) {
                var orderId=res.params['$orderId'];
                console.log('orderId is '+orderId);

                var errorId=(new Date()).getTime(),
                    timeout=setTimeout(function(){
                        model.error[errorId]={
                            type:'timeout',
                            message:'timeout'
                        };
                    },5000);

                var reportRef=localFb.ref('users/'+user.uid+'/orderHistory/'+orderId+'/payment/status');
                reportRef.on('value', function(snap){
                    if(snap.val()===null) return;

                    clearTimeout(timeout);

                    if(snap.val()==='succeeded') {
                        $location.path('/invoice'); //成功後轉換至invoice頁面
                        console.log('transaction '+snap.val());
                        ngCart.empty(); //清空購物車, ngCart 要清兩次才會清空
                        ngCart.empty();

                    } else {
                        model.error[errorId]={
                            type:'transaction failed',
                            message:snap.val().message
                        };
                        $location.path('/error/'+errorId);
                        console.log('payment failed:'+JSON.stringify(snap.val()))
                    }
                    if(!$scope.$$phase) $scope.$apply(); //確保成功轉換頁面
                });
            }, function (err) {
                console.log(JSON.stringify(err)); //上傳失敗產生警告
            });
        }

        //date picker
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        // Disable weekend selection
        $scope.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };

        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        $scope.open = function($event) {
            $scope.status.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.format = 'yyyy/MM/dd';

        $scope.status = {
            opened: false
        };

    });

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: {
                user: ['Auth', function (Auth) {
                    return Auth.$waitForAuth();
                }]
            }
        });
    }]);

})(angular);
appDI.push(newModule);