angular.module('core.model', ['firebase', 'myApp.config'])
    .factory('model', ['config','fbutil','$q','snippet',function (config, fbutil, $q, snippet) {
        var model={
            update:update,
            ModelObj:ModelObj,
            init:init,
            db:{online:{}},
            action:{},
            view:{},
            error:{},
            debug:'debug'
        };

        function ModelObj(modelPath){
            var that=this;
            this.modelPathArr=modelPath.split("|");
            this.pathArr=this.modelPathArr[0].split(".");
            this.val=function(){
                var value={},
                    modelPath="";

                for(var j=0; j<that.pathArr.length; j++){
                    modelPath=modelPath+"['"+that.pathArr[j]+"']"
                }
                for(var i=1; i<that.modelPathArr.length; i++){
                    value[that.modelPathArr[i]]=eval("model"+modelPath)[that.modelPathArr[i]];
                }

                if(JSON.stringify(value)==="{}"){
                    eval("value=model"+modelPath)
                }

                return value
            }
        }

        function init(scope, keyArr, refresh){
            for(var i=0; i<keyArr.length; i++){
                model[keyArr[i]]=refresh? {}:model[keyArr[i]]||{};
                scope[keyArr[i]]=model[keyArr[i]]
            }
        }

        function update(path, value, valuePathArr) {
            var pathArr=path.split(".");
            if(valuePathArr!=undefined) {
                snippet.evalAssignment([model, pathArr], valuePathArr);
            } else {
                snippet.evalAssignment([model, pathArr], [value]);
            }
            //updateView(path)
        }

        return model
    }]);
