//Step 1: name the new module or use a random id.
window.newModule = "custom.services";

angular.module(window.newModule, ['firebase', 'myApp.config'])
//Step 2: replace 'serviceSeed' by the factory name you like.
    .factory('customFn', ['FBURL', 'config', 'fbutil', '$firebaseObject', '$q', 'snippet', function (FBURL, config, fbutil, $firebaseObject, $q, snippet) {
        var customFn={
            calcSubTotal:calcSubTotal
        };
        function calcSubTotal(orderId, productsInfo, scope){
            scope.subTotal=scope.subTotal||{};
            var subTotal=0;
            for(var productId in productsInfo){
                subTotal+=productsInfo[productId].price*productsInfo[productId].quantity
            }
            if(scope) {
                scope.subTotal=scope.subTotal||{};
                scope.subTotal[orderId]=subTotal;
            }
            return subTotal;
        }
        return customFn
    }]);

if(window.appDI) window.appDI.push(window.newModule);
