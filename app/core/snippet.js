angular.module('core.snippet', ['firebase', 'myApp.config'])
    .factory('snippet', ['config','$q',function (config, $q) {

        function isArray(someVar){
            return Object.prototype.toString.call( someVar ) === '[object Array]'
        }

        function ReplaceableObj(){
            var that=this;
            this.replace=function(objName,params){
                if(that[objName]===undefined) that[objName]={};
                var resString=JSON.stringify(that[objName]);
                for(var key in params){
                    resString=resString.replace(eval("/\\"+key+"/g"), params[key]);
                }
                that[objName]=JSON.parse(resString);
            };
            this.showObj=function(objName){
                console.log(JSON.stringify(that[objName]))
            }
        }

        function replaceParamsInString(string, params){
            for(var param in params){
                if(params.hasOwnProperty(param)) string=string.replace(eval("/\\"+param+"/g"), params[param]);
            }
            return string
        }

        function replaceParamsInObj(obj, params){
            var objString=JSON.stringify(obj);
            objString=replaceParamsInString(objString, params);

            var replacedObj=JSON.parse(objString);

            for(var key in obj){
                if(obj.hasOwnProperty(key)&&(typeof obj[key]==='function')){
                    var paramReplacedKey=replaceParamsInString(key, params);
                    replacedObj[paramReplacedKey]=obj[key]
                }
            }

            return replacedObj
        }

        function getUnionOfObj(objArr){
            var result=objArr[0];
            if(objArr.length===1) return result;
            for(var i=1;i<objArr.length;i++){
                for(var key in objArr[i]){
                    result[key]=objArr[i][key];
                }
            }
            return result
        }

        function evalAssignment(lhsArr, rhsArr){

            var lhsPath="",
                lhs=lhsArr[0];

            if(Object.prototype.toString.call(rhsArr) === '[object Array]' ) {
                var rhs=rhsArr[0];
            }

            function toPathArr(strOrArr){
                return (typeof strOrArr==='string')? strOrArr.split('.'): strOrArr
            }

            if(lhsArr[1]!=undefined){
                var lhsPathArr=toPathArr(lhsArr[1]);

                for(var i=0; i<lhsPathArr.length; i++){
                    lhsPath=lhsPath+"['"+lhsPathArr[i]+"']";
                    if((i+1<lhsPathArr.length)&&typeof lhs[lhsPathArr[i]]!="object"){
                        eval("lhsArr[0]"+lhsPath+"={}")
                    } else {
                        lhs=lhs[lhsPathArr[i]];
                    }
                }
            }
            if(!rhsArr) return eval("lhsArr[0]"+lhsPath);
            if(typeof rhsArr==='function'){
                eval("rhs=rhsArr(lhsArr[0]"+lhsPath+")");
            } else {
                if(rhsArr[1]!=undefined){
                    var rhsPathArr=toPathArr(rhsArr[1]);
                    for(var j=0; j<rhsPathArr.length; j++){
                        if(rhs[rhsPathArr[j]]===undefined){
                            rhs=undefined;
                            break;
                        }
                        rhs=rhs[rhsPathArr[j]];
                    }
                }
            }

            eval("lhsArr[0]"+lhsPath+"=rhs");




            //console.log(lhsArr[0]); TODO:reomove debug code here
            //console.log("lhsArr[0]"+lhsPath+"="+rhs);
            //console.log(eval("lhsArr[0]"+lhsPath));

        }

        //see https://github.com/hughsk/flat
        function flatten(target, opts) {
            opts = opts || {};

            var delimiter = opts.delimiter || '.';
            var maxDepth = opts.maxDepth;
            var currentDepth = 1;
            var output = {};

            function step(object, prev) {
                Object.keys(object).forEach(function(key) {
                    var value = object[key];
                    var isarray = opts.safe && Array.isArray(value);
                    var type = Object.prototype.toString.call(value);
                    var isbuffer = false;
                    var isobject = (
                        type === "[object Object]" ||
                        type === "[object Array]"
                    );

                    var newKey = prev
                        ? prev + delimiter + key
                        : key;

                    if (!opts.maxDepth) {
                        maxDepth = currentDepth + 1;
                    }

                    if (!isarray && !isbuffer && isobject && Object.keys(value).length && currentDepth < maxDepth) {
                        ++currentDepth;
                        return step(value, newKey)
                    }

                    output[newKey] = value
                })
            }
            step(target);

            return output
        }

        function unflatten(target, opts) {
            opts = opts || {};

            var delimiter = opts.delimiter || '.';
            var overwrite = opts.overwrite || false;
            var result = {};

            var isbuffer = false;
            if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
                return target
            }

            // safely ensure that the key is
            // an integer.
            function getkey(key) {
                var parsedKey = Number(key);

                return (
                    isNaN(parsedKey) ||
                    key.indexOf('.') !== -1
                ) ? key
                    : parsedKey
            }

            Object.keys(target).forEach(function(key) {
                var split = key.split(delimiter);
                var key1 = getkey(split.shift());
                var key2 = getkey(split[0]);
                var recipient = result;

                while (key2 !== undefined) {
                    var type = Object.prototype.toString.call(recipient[key1]);
                    var isobject = (
                        type === "[object Object]" ||
                        type === "[object Array]"
                    );

                    if ((overwrite && !isobject) || (!overwrite && recipient[key1] === undefined)) {
                        recipient[key1] = (
                            typeof key2 === 'number' &&
                            !opts.object ? [] : {}
                        )
                    }

                    recipient = recipient[key1];
                    if (split.length > 0) {
                        key1 = getkey(split.shift());
                        key2 = getkey(split[0])
                    }
                }

                // unflatten again for 'messy objects'
                recipient[key1] = unflatten(target[key], opts)
            });

            return result
        }

        function isBuffer(value) {
            if (typeof Buffer === 'undefined') return false;
            return Buffer.isBuffer(value)
        }

        function cloneObject(obj){
            if(obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj) return obj;
            var temp = obj.constructor(); // changed
            for(var key in obj) {
                if(Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj['isActiveClone'] = null;
                    temp[key] = cloneObject(obj[key]);
                    delete obj['isActiveClone'];
                }
            }
            return temp;
        }

        function createBatchUpdateValues(rawData, structure){
            var structureClone;
            if(typeof structure!=='object') {console.log('error: structure is not an object'); return structure}
            structureClone=cloneObject(structure);

            function iterate(obj){
                for(var key in obj){
                    if(key==='valueArr'){
                        for(var i=0;i<obj['valueArr'].length;i++){
                            var keyStr=obj['valueArr'][i];
                            if(obj['value']===undefined) obj['value']={};
                            if(typeof keyStr==='string') obj['value'][keyStr]=keyStr;
                        }
                        delete obj['valueArr'];
                        continue;
                    }
                    if(obj.hasOwnProperty(key)){
                        if(typeof obj[key]==='string'){
                            if(rawData[obj[key]]==='') {obj[key]=''} else {
                                obj[key]=rawData[obj[key]]||obj[key];
                            }
                        } else if(typeof obj[key]==='object'){
                            iterate(obj[key])
                        }
                    }
                }
            }
            iterate(structureClone);
            return structureClone
        }

        function checkIfPropertyExist(arr){
            var obj=arr[0],
                pathArr=arr[1],
                isExist=true;
            for(var i=0; i<pathArr.length; i++){
                if(obj[pathArr[i]]===undefined||obj[pathArr[i]]===null) {
                    isExist=false;
                    break;
                }
                obj=obj[pathArr[i]]
            }
            return isExist
        }

        function getRouteKey(locationPath, routeParam){
            var path=locationPath;
            for(var key in routeParam){
                if(key==='key') continue;
                var replacement=routeParam[key].split('/')[1]? ':'+key+'*':':'+key;
                path=path.replace(routeParam[key], replacement);
            }
            return path
        }


        function getRule(structure, pathArr){
            var omniKey={},
                currentStructure=structure,
                checkStructure=true;

            //collect the real value for keys like $uid, $pjId.
            function findOmniKey(i){
                if(currentStructure[pathArr[i]]){
                    currentStructure=currentStructure[pathArr[i]]
                } else {
                    var keyExist=false;
                    for(var key in currentStructure){
                        if(key.charAt(0)=="$"){
                            omniKey[key]=pathArr[i];
                            currentStructure=currentStructure[key];
                            keyExist=true;
                            break;
                        }
                    }
                    if(!keyExist){
                        checkStructure=false;
                        console.log("no rules for ["+pathArr.toString()+"]");
                    }
                }
            }

            for(var i=0; i<pathArr.length; i++){
                findOmniKey(i);
                if(!checkStructure) break
            }

            if(!checkStructure) return undefined;

            var contentString=JSON.stringify(currentStructure);
            for(var key in omniKey){
                contentString=contentString.replace(eval("/\\"+key+"/g"), omniKey[key])
            }

            console.log(JSON.stringify(omniKey));

            return JSON.parse(contentString);
        }

        function WaitUntil(conditionNum, onComplete, argArr){
            var that=this;
            this.satisfiedCondition=0;
            this.resolve=function(){
                that.satisfiedCondition++;
                if(that.satisfiedCondition===conditionNum){
                    onComplete.apply(null, argArr||[])
                }
            };
            if(conditionNum===0){
                onComplete.apply(null, argArr||[])
            }
        }

        function errMessage(err) {
            return angular.isObject(err) && err.code? err.code : err + '';
        }

        function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@'))||'');
        }

        function ucfirst (str) {
            // inspired by: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        }


        return {
            flatten:flatten,
            unflatten:unflatten,
            isBuffer:isBuffer,
            isArray:isArray,
            cloneObject:cloneObject,
            getRule:getRule,
            getRouteKey:getRouteKey,
            evalAssignment:evalAssignment,
            checkIfPropertyExist:checkIfPropertyExist,
            WaitUntil:WaitUntil,
            getUnionOfObj:getUnionOfObj,
            ReplaceableObj:ReplaceableObj,
            replaceParamsInObj:replaceParamsInObj,
            replaceParamsInString:replaceParamsInString,
            createBatchUpdateValues:createBatchUpdateValues,
            firstPartOfEmail:firstPartOfEmail,
            errMessage:errMessage,
            ucfirst:ucfirst
        }
    }]);