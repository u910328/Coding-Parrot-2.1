angular.module('core.model', ['firebase', 'myApp.config'])
    .factory('model', function (config, fbutil, $q, snippet) {
        var model={
            update:update,
            updateView:updateView,
            ModelObj:ModelObj,
            db:{online:{}},
            action:{},
            view:{},
            path:{},
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
    });
