window.newModule = 'core.$errorHandler';

angular.module(window.newModule, ['firebase', 'myApp.config'])
    .factory('$errorHandler', /*@ngInject*/ function (/*injections*/) {
        var errorType={

        };

        return function(opt){
            var _opt=opt||{};
            if(!opt.type){
                return function(error){
                    console.log(JSON.stringify(error));
                }
            }
        };
    });

if (window.appDI) window.appDI.push(window.newModule);