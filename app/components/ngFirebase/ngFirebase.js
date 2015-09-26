'use strict';

angular.module('ngFirebase', [])
    .directive('ngFirebase', ['$firebase', function ($firebase) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                ngFirebase: '@',
                loading: '@',
                pure:'@'
            },
            link: function (scope, element, attrs, ctrl, transcludeFn) {
                function init(){
                    var obj = $firebase.$object(scope.ngFirebase);
                    element.append(scope.loading);
                    obj.$loaded(appendTransclude, appendTransclude);

                    function appendTransclude(dataOrError) {
                        element.empty();
                        transcludeFn(function (clone, trclScope) {
                            element.append(clone);
                            if (dataOrError === obj) {
                                if(scope.pure){
                                    var pureValue={};
                                    angular.forEach(dataOrError, function(subValue,key){
                                        pureValue[key]=subValue
                                    });
                                    trclScope.$value=dataOrError.$value? dataOrError.$value:pureValue;
                                } else {
                                    trclScope.$value = dataOrError.$value ? dataOrError.$value : dataOrError;
                                }
                                trclScope.$firebaseObject = dataOrError;
                                trclScope.$eval(attrs.loaded);
                            } else {
                                trclScope.$error = dataOrError;
                                obj.$destroy();
                            }
                        })
                    }
                }

                scope.$watch('ngFirebase', function(){
                    init();
                });
            }

        };
    }]);