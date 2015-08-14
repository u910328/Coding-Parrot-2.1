'use strict';

//see http://jsfiddle.net/nirmalkumar_86/9F89Q/5/
angular.module('myApp')
    //filter Multiple...
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
    });


