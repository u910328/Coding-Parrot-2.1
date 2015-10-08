//Step 1: name the new module or use a random id.
window.newModule = "custom.filters";

angular.module(window.newModule, ['firebase', 'myApp.config'])
//Step 2: replace 'serviceSeed' by the factory name you like.
    .filter('orderSubTotal', function() {
        return function(order) {
            var sum= 0,
                products=order.products||{};
            for(var key in products){
                sum+=products[key].price*products[key].quantity
            }
            return sum;
        };
    })
    .factory('filterUtil', function($filter){
        function watchFilterOpts(scope, source, target, filter, isReverse){
            scope[source]=scope[source]||[];
            function refresh(){
                scope[filter]=scope[filter]? scope[filter]:{};
                scope[target]=$filter('consecutive')(scope[source], scope[filter], isReverse);
                //scope.$digest();
            }

            var watchFilter=scope.$watch(filter,function(){
                refresh();
            });
            var watchSource=scope.$watch(source,function(){
                refresh();
            });

            return function(){
                watchFilter();
                watchSource();
            }
        }
        return {
            watchFilterOpts:watchFilterOpts
        }
    });

if(window.appDI) window.appDI.push(window.newModule);