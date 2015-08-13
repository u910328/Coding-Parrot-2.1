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
    app.controller(ctrlName, function (user, $scope, model, localFb, snippet, $location) {
        //取得productDetail製造的model.cart並和視圖綁定
        model.cart = model.cart || {products: {}};
        $scope.cart = model.cart;

        $scope.subTotal = model.calcSubTotal('', model.cart.products);

        angular.extend(model.cart,
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


        $scope.checkout = function () {
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
                value: snippet.filterRawData(model.cart, mainOrderStructure)
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
                value: snippet.filterRawData(model.cart, userOderReceiptStructure)
            };

            //放到同一個array產生批次上傳資料
            var batchOrderData = [mainOrderData, userReceiptData];

            //產生收據
            model.invoice = angular.extend({}, model.cart);

            //批次上傳
            localFb.batchUpdate(batchOrderData, true).then(function () {
                $location.path('/invoice'); //成功後轉換至invoice頁面
            }, function (err) {
                console.log(JSON.stringify(err)); //上傳失敗產生警告
            });
            model.cart = false; //清空購物車
        }
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