'use strict';

angular.module('ngFirebase', [])
    //.factory('ngCartItem', ['$rootScope', '$log', function ($rootScope, $log) {
    //
    //}])
    .directive('ngFirebase', ['$firebaseObject', 'localFb', function($firebaseObject, localFb){
        return {//TODO: cache firebase data to localFb
            restrict : 'A',
            transclude: true,
            scope: {
                ngFirebase:'@'
            },
            link:function(scope, element, attrs, ctrl, transcludeFn){
                var obj=$firebaseObject(localFb.ref(scope.ngFirebase)),
                    appendTransclude=function(dataOrError){
                        transcludeFn(function(clone, trclScope){
                            element.append(clone);
                            if(dataOrError===obj) {
                                trclScope.$value=dataOrError.$value? dataOrError.$value:dataOrError;
                                trclScope.$eval(attrs.loaded);
                            } else {
                                trclScope.$error=dataOrError
                            }
                        })
                    };
                obj.$loaded(appendTransclude, appendTransclude);
            }

        };
    }]);