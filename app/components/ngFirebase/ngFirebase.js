'use strict';

angular.module('ngFirebase', [])
    .directive('ngFirebase', ['$firebaseObject', 'localFb', function ($firebaseObject, localFb) {
        return {//TODO: cache firebase data to localFb
            restrict: 'A',
            transclude: true,
            scope: {
                ngFirebase: '@',
                loading: '@'
            },
            link: function (scope, element, attrs, ctrl, transcludeFn) {
                function init(){
                    element.append(scope.loading);
                    var obj = $firebaseObject(localFb.ref(scope.ngFirebase));
                    obj.$loaded(appendTransclude, appendTransclude);

                    function appendTransclude(dataOrError) {
                        element.empty();
                        transcludeFn(function (clone, trclScope) {
                            element.append(clone);
                            if (dataOrError === obj) {
                                trclScope.$value = dataOrError.$value ? dataOrError.$value : dataOrError;
                                trclScope.$firebaseObject = dataOrError;
                                trclScope.$eval(attrs.loaded);
                            } else {
                                trclScope.$error = dataOrError
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