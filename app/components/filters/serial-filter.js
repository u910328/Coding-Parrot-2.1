'use strict';

angular.module('myApp')
    .filter('filterSerial', ['$filter', function ($filter) {
        return function (items, keys) {
            var keyArray = keys.split(' '), result = items.slice(0);
            for (var i = 0; i < keyArray.length; i++) {
                result = $filter('filter')(result, keyArray[i]);
            }
            return keys === '' ? items : result
        }
    }]);


