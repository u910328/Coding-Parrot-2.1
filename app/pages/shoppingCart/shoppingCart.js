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
    app.controller(ctrlName, function (config, user, $scope, model, localFb, snippet, $location, ngCart, $firebaseObject) {

        $scope.ngCart = ngCart;
        var cart = {products: {}};


        $scope.keepShopping = function () {
            $location.path('/products')
        };

        $scope.emptyCart = function () {
            ngCart.empty();  //清空購物車, ngCart 要清兩次才會清空
            ngCart.empty()
        };

        $scope.paymentMethod = 'uponPickup';


        $scope.clientEmail = $firebaseObject(localFb.ref('users/' + user.uid + '/email'));
        localFb.ref('users/' + user.uid + '/phone').on('value', function (snap) {
            $scope.clientPhone = snap.val();
        });

        var delayExe = new snippet.DelayExec(1000);
        $scope.saveEmail = function (isValid) {
            function onComplete() {
                if (isValid) $scope.clientEmail.$save();
                console.log($scope.clientEmail.$value)
            }

            delayExe.reset(onComplete)
        };
        $scope.savePhone = function () {
            function onComplete() {
                if ($scope.clientPhone) localFb.update('users/' + user.uid, false, {phone: $scope.clientPhone || null});
            }

            delayExe.reset(onComplete)
        };

        if (config.debug) {
            $scope.number = '4242424242424242';
            $scope.expiry = '11/16';
            $scope.cvc = '123';
        }

        function ensureEnoughTimeToPrepare() {
            if ($scope.dt.getTime() < (new Date()).getTime() + 30 * 60 * 1000) {
                alert('Please pick a time at least 30 minutes from now.');
                return false
            } else {
                return true
            }
        }

        $scope.checkOut = function () {
            //確保有足夠時間準備
            if (!ensureEnoughTimeToPrepare()) return;

            $scope.waiting = true; //進入waiting畫面,得到token後stripeCallback會執行
            if ($scope.paymentMethod === 'uponPickup') uploadOrder().then(function () {
                $location.path('/invoice'); //成功後轉換至invoice頁面
                $scope.emptyCart();
                if (!$scope.$$phase) $scope.$apply(); //確保成功轉換頁面
            });
        };

        function getPaymentData(code, result) {
            $scope.payment = {};
            if (result.error) {
                window.alert('it failed! error: ' + result.error.message);
            } else {
                console.log('success! token: ' + result.id);
                $scope.payment = {
                    token: result.id,
                    provider: 'stripe'
                };
            }
        }

        $scope.stripeCallback = function (code, result) {
            if (!ensureEnoughTimeToPrepare()) return;
            getPaymentData(code, result);

            //將payment provider取得的token加入其他資料一起上傳
            uploadOrder()
                .then(function (res) {
                    var orderId = res.params['$orderId'];
                    console.log('orderId is ' + orderId);

                    function errorHandler(errorId, type, message) {
                        model.error[errorId] = {
                            type: type,
                            message: message
                        };
                        $location.path('/error/' + errorId);
                        console.log('an error has occurred:' + message);
                        if (!$scope.$$phase) $scope.$apply(); //確保成功轉換頁面
                    }

                    var errorId = (new Date()).getTime(),
                        timeout = setTimeout(function () {
                            $scope.waiting = false;
                            errorHandler(errorId, 'timeout', 'timeout');
                        }, 5000);

                    var reportRef = localFb.ref('users/' + user.uid + '/orderHistory/' + orderId + '/payment/status');
                    reportRef.on('value', function (snap) {
                        if (snap.val() === null) return;

                        clearTimeout(timeout);

                        if (snap.val() === 'succeeded') {
                            $location.path('/invoice'); //成功後轉換至invoice頁面
                            console.log('transaction ' + snap.val());
                            $scope.emptyCart();
                            if (!$scope.$$phase) $scope.$apply(); //確保成功轉換頁面
                        } else {
                            errorHandler(errorId, 'transaction failed', snap.val().message);
                        }
                        $scope.waiting = false;
                    });
                }, function (err) {
                    console.log(JSON.stringify(err)); //上傳失敗產生警告
                });
        };

        function prepareOrderData() {
            angular.forEach(ngCart.getItems(), function (item) {
                cart.products[item._id] = item._data;
                cart.products[item._id].quantity = item._quantity;
                cart.products[item._id].itemId = item._id;
            });

            var payment = $scope.payment || {};
            payment.method = $scope.paymentMethod;

            angular.extend(cart,
                {
                    clientName: user[user.provider].displayName || user[user.provider].email,
                    clientId: user.uid,
                    clientEmail: $scope.clientEmail.$value || null,
                    clientPhone: $scope.clientPhone || null,
                    createdTime: Firebase.ServerValue.TIMESTAMP,
                    note: $scope.note || null,
                    schedule: $scope.dt.getTime(),
                    orderStatus: 'received',
                    payment: payment,
                    shipment: {}//
                }
            );
        }


        function uploadOrder() {

            //整理order 資料
            prepareOrderData();

            //產生要存至主order資料庫的結構
            var mainOrderStructure = {
                clientName: '',
                clientId: '',
                clientEmail: '',
                clientPhone: '',
                createdTime: '',
                orderStatus: '',
                note: '',
                //subTotal:'',        由主機端計算，防止人為竄改。
                products: {
                    $productId: {
                        itemName: '',
                        itemId: '',
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
                note: '',
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

            //產生收據
            model.invoice = angular.extend({}, cart);

            //批次上傳
            return localFb.batchUpdate(batchOrderData, true)
        }

        //date picker
        //$scope.today = function () {
        //    $scope.dt = new Date();
        //};
        //$scope.today();
        $scope.dt= new Date();

        $scope.getDt=function(){
            var newDate=$scope.dt;
            newDate.setMinutes(0);
            newDate.setHours(10);
            var todayBegin = newDate.getTime();

            newDate.setHours(20);
            var todayEnd = newDate.getTime();

            $scope.dt.setHours(12);
            $scope.dt.setMinutes(0);
            $scope.minTime=todayBegin;
            $scope.maxTime=todayEnd;
        };
        $scope.getDt();

        $scope.minDate = $scope.dt;


        // Disable weekend selection
        $scope.disabled = function (date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };


        $scope.open = function ($event) {
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