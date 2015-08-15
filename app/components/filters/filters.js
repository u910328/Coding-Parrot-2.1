'use strict';

angular.module('myApp')
    .filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    })
    .filter('consecutive', ['$filter', function ($filter) {
        return function (items, input) {
            var result=items.slice(0);
            if(typeof input==='object'){
                angular.forEach(input, function(value){
                    result=$filter('filter')(result, value);
                });
                return result
            } else if(typeof input==='string'){
                var keyArray = input.split(' ');
                for (var i = 0; i < keyArray.length; i++) {
                    result = $filter('filter')(result, keyArray[i]);
                }
                return input === '' ? items : result
            }

        }
    }])
    ////see http://jsfiddle.net/nirmalkumar_86/9F89Q/5/
    .filter('filterMultiple', ['$filter', function ($filter) {
        return function (items, keyObj) {
            var filterObj = {
                data: items,
                filteredData: [],
                applyFilter: function (obj, key) {
                    var fData = [];
                    if (this.filteredData.length == 0)
                        this.filteredData = this.data;
                    if (obj) {
                        var fObj = {};
                        if (!angular.isArray(obj)) {
                            fObj[key] = obj;
                            fData = fData.concat($filter('filter')(this.filteredData, fObj));
                        } else if (angular.isArray(obj)) {
                            if (obj.length > 0) {
                                for (var i = 0; i < obj.length; i++) {
                                    if (angular.isDefined(obj[i])) {
                                        fObj[key] = obj[i];
                                        fData = fData.concat($filter('filter')(this.filteredData, fObj));
                                    }
                                }

                            }
                        }
                        if (fData.length > 0) {
                            this.filteredData = fData;
                        }
                    }
                }
            };

            if (keyObj) {
                angular.forEach(keyObj, function (obj, key) {
                    filterObj.applyFilter(obj, key);
                });
            }

            return filterObj.filteredData;
        }
    }])
    .filter('unique', function () {
        return function (input, key) {
            var unique = {};
            var uniqueList = [];
            for (var i = 0; i < input.length; i++) {
                if (typeof unique[input[i][key]] == "undefined") {
                    unique[input[i][key]] = "";
                    uniqueList.push(input[i]);
                }
            }
            return uniqueList;
        };
    })
    //see https://github.com/vpegado/angular-percentage-filter
    .filter('percentage', ['$window', function ($window) {
        return function (input, decimals, suffix) {
            decimals = angular.isNumber(decimals)? decimals :  3;
            suffix = suffix || '%';
            if ($window.isNaN(input)) {
                return '';
            }
            return Math.round(input * Math.pow(10, decimals + 2))/Math.pow(10, decimals) + suffix
        };
    }]);

