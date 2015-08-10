angular.module('core.viewLogic', ['firebase', 'myApp.config'])
    .factory('viewLogic', ['config','model','snippet',function (config, model, snippet){

        //allElement記錄所有元素在第一列所在行數及所有出現的列數
        var allElement={},
            loadedRule={};

        var viewLogic={
            rule:[[0]],
            allElement: allElement,
            VLObj:VLObj
        };

        function checkRow(ithRow, pathCol, pathRow) {
            var changedModelObj=new model.ModelObj(pathRow[pathCol]),
                newVal=changedModelObj.val();
            //console.log(JSON.stringify(newVal));

            switch(typeof ithRow[pathCol]){             //先檢查改變的以加快檢查速度
                case 'function':
                    if(ithRow[pathCol]&&!ithRow[pathCol].apply(null,[newVal])){
                        return false
                    }
                    break;
                case 'string':
                    if (ithRow[pathCol]&&!eval("newVal"+ithRow[pathCol])) {
                        return false;
                    }
                    break;
            }


            for (var j = 1; j < pathRow.length; j++) {
                if (ithRow[j] && j!= pathCol) {
                    var modelObj=new model.ModelObj(pathRow[j]),
                        val=modelObj.val();

                    switch(typeof ithRow[j]){
                        case 'function':
                            if(!ithRow[j].apply(null,[val])){
                                return false
                            }
                            break;
                        case 'string':
                            if (!eval("val" + ithRow[j])) {
                                return false
                            }
                            break;
                    }
                }
            }
            return true;
        }

//分成兩部分 1.先計算所有變動 preProcessView 2.將變動套用到view上 updateView
        function preProcessView(modelPath, localElement, nRule){
            var elements=localElement||allElement;
            var rule=nRule||viewLogic["rule"],
                mPath=modelPath.split("|")[0],
                elemArr=elements[mPath]||[],
                index=elemArr[1],
                pathCol=elemArr[0],
                finalResult={_toBeEvaluated:[]},
                stop=false;
            if(index===undefined) return finalResult;
            for(var block=0; block<index.length; block++){
                for(var i=0; i<index[block].length; i++){
                    if(index[block][i]===true) {stop=true; continue;}
                    var currentRow=rule[index[block][i]];

                    if(checkRow(currentRow, pathCol, rule[0])){
                        switch (typeof currentRow[0]){
                            case 'function':
                                finalResult['_toBeEvaluated'].push([currentRow[0],[true]]);
                                break;
                            case 'string':
                                var resultArr=currentRow[0].split(";"); //rule 的最後一行看起來像 "showAAA=class1;showBBB=class2"
                                for(var j=0;j<resultArr.length;j++){
                                    finalResult[resultArr[j].split("=")[0]]=resultArr[j].split("=")[1].split("|")[0]
                                }
                                break;
                            case 'object':
                                if(angular.isArray(currentRow[0])) {
                                    finalResult['_toBeEvaluated'].push([currentRow[0][0],[true,currentRow[0][1]]]);
                                } else {
                                    console.log('error: currentRow[0] is not an array')
                                }
                                break;
                        }
                        if(stop) break;
                    } else {
                        switch (typeof currentRow[0]){
                            case 'function':
                                finalResult['_toBeEvaluated'].push([currentRow[0],[false]]);
                                break;
                            case 'string':
                                var resultArr=currentRow[0].split(";");
                                for(var k=0;k<resultArr.length;k++){
                                    finalResult[resultArr[k].split("=")[0]]=resultArr[k].split("=")[1].split("|")[1]
                                }
                                break;
                            case 'object':
                                if(angular.isArray(currentRow[0])) {
                                    finalResult['_toBeEvaluated'].push([currentRow[0][0],[false,currentRow[0][1]]]);
                                } else {
                                    console.log('error: currentRow[0] is not an array')
                                }
                                break;
                        }
                    }

                    //switch (typeof currentRow[0]){
                    //    case 'function':
                    //        if(checkRow(currentRow, pathCol, rule[0])){
                    //            finalResult['_toBeEvaluated'].push([currentRow[0],[true]]);
                    //        } else {
                    //            finalResult['_toBeEvaluated'].push([currentRow[0],[false]]);
                    //        }
                    //        break;
                    //    case 'string':
                    //        var resultArr=currentRow[0].split(";"); //rule 的最後一行看起來像 "showAAA=class1;showBBB=class2"
                    //        if(checkRow(currentRow, pathCol, rule[0])){
                    //            for(var j=0;j<resultArr.length;j++){
                    //                finalResult[resultArr[j].split("=")[0]]=resultArr[j].split("=")[1].split("|")[0]
                    //            }
                    //        } else {
                    //            for(var k=0;k<resultArr.length;k++){
                    //                finalResult[resultArr[k].split("=")[0]]=resultArr[k].split("=")[1].split("|")[1]
                    //            }
                    //        }
                    //        break;
                    //    case 'object':
                    //        if(checkRow(currentRow, pathCol, rule[0])){
                    //            finalResult['_toBeEvaluated'].push([currentRow[0][0],[true,currentRow[0][1]]]);
                    //        } else {
                    //            finalResult['_toBeEvaluated'].push([currentRow[0][0],[false,currentRow[0][1]]]);
                    //        }
                    //        break;
                    //}
                    //if(stop&&checkRow(currentRow, pathCol, rule[0])) break;
                }

            }
            //console.log(modelPath,JSON.stringify(finalResult));
            return finalResult
        }

        function updateVL(modelPath, localElement, nRule, defaultFn) {
            var toBeUpdated=preProcessView(modelPath, localElement, nRule);
            if(defaultFn) defaultFn.apply(null);
            for (var key in toBeUpdated) {
                if(key==="_toBeEvaluated") continue;
                snippet.evalAssignment([model, key.split(".")], [toBeUpdated[key]]);
            }
            for(var i=0; i<toBeUpdated["_toBeEvaluated"].length; i++){
                toBeUpdated["_toBeEvaluated"][i][0].apply(null, toBeUpdated["_toBeEvaluated"][i][1]);
            }
        }

        function watchEle(eleName, scope, localElement, nRule, defaultFn){
            scope.$watch(eleName, function(nval, oval){
                //console.log(eleName, nval,oval);
                updateVL(eleName, localElement, nRule, defaultFn);
            })
        }

        function addPartialRule(partialRule, scope, rule, element, watched, isLocal, type, defaultFn){
            var partialFirstRow=partialRule[0],
                elePosArr=[],
                evalStr="",
                blockElement={};

            for(var i=1; i<partialFirstRow.length; i++){
                var extraArg=isLocal? ", element, rule, defaultFn":"", watch=false;
                if(watched){
                    var eleWatched=watched[partialFirstRow[i]];
                } else {
                    var eleWatched=3
                }
                switch(eleWatched){
                    case undefined:
                        watched[partialFirstRow[i]]=isLocal? 1:2; watch=true;
                        break;
                    case 1:
                        if((isLocal? 1:2)==2) {watched[partialFirstRow[i]]=3; watch=true;}
                        break;
                    case 2:
                        if((isLocal? 1:2)==1) {watched[partialFirstRow[i]]=3; watch=true;}
                        break;
                }
                if(watch){
                    evalStr=evalStr+"watchEle('"+partialFirstRow[i]+"', scope"+extraArg+");";
                }

                if(element[partialFirstRow[i]]===undefined){
                    var colNum=rule[0].length;
                    rule[0][colNum]=partialFirstRow[i];
                    element[partialFirstRow[i]]=[colNum,[]];
                    elePosArr.push(colNum);
                } else{
                    elePosArr.push(element[partialFirstRow[i]][0]);
                }

                if(type==='break') {
                    blockElement[partialFirstRow[i]]=[true];
                } else {
                    blockElement[partialFirstRow[i]]=[];
                }
            }


            var rowNum=rule.length;
            for(var j=1; j<partialRule.length; j++){
                var newRow=[partialRule[j][0]];
                for(var k=1; k<partialFirstRow.length; k++){
                    var currentElement=rule[0][elePosArr[k-1]];
                    if(!!partialRule[j][k]||type==='all') {
                        newRow[elePosArr[k-1]]=partialRule[j][k];
                        blockElement[currentElement].push(rowNum+j-1);
                    }
                }
                rule.push(newRow);
            }

            for(var key in blockElement){
                if(blockElement[key].length===0) continue;
                element[key][1].push(blockElement[key]);
            }
            //console.log(JSON.stringify(rule));
            //console.log(JSON.stringify(element));
            if(scope) eval(evalStr);
            //console.log(evalStr);
        }

        //
        //function compileRule(){
        //    viewLogic.rule=[[]];
        //    for(var key in config.viewLogic){
        //        var firstRow=config.viewLogic[key][0];
        //        temp[key]=[];
        //        //生成新的第一行，綜合所有的子表的第一行，將第一次出現的element放到rowCount那一列
        //        // 並記錄每個KEY 子表的元素位置於temp[key] array
        //        for(var i=0; i<firstRow.length; i++){
        //            if(firstRow[i]==="result") break;
        //            if(temp.allElement[firstRow[i]]===undefined){
        //                viewLogic.rule[0][temp.allElement.colCount]=firstRow[i];
        //                temp.allElement[firstRow[i]]=temp.allElement.colCount;
        //                temp[key].push(temp.allElement.colCount);
        //                temp.allElement.colCount++;
        //            } else {
        //                temp[key].push(temp.allElement[firstRow[i]]);
        //            }
        //        }
        //        //總表產生一列新的判斷列並將原本的key 名稱的table 裡的判斷列元素放到對應的位置
        //        for(var j=1; j<config.viewLogic[key].length; j++){
        //            viewLogic.rule.push([]);
        //            for(var k=0; k<firstRow.length; k++){
        //                viewLogic.rule[viewLogic.rule.length-1][temp[key][k]]=config.viewLogic[key][j][k]
        //            }
        //        }
        //    }
        //}
        //
        //function createIndex(){
        //    viewLogic["index"]={}; //紀錄規則表中的某modelPath 其值變動所需檢查的部分
        //    for(var i=0; i<rowNum; i++){
        //        for(var j=0; j<colNum-1; j++){ //最後一行是條件確認後要變動的位置
        //            if(i===0){
        //                viewLogic["index"][rule[0][j]]=[j];    //第0個元素為該path所在行數
        //            } else {
        //                if(!!rule[i][j]){
        //                    viewLogic["index"][rule[0][j]].push(i)
        //                }
        //            }
        //        }
        //    }
        //}


        function VLObj(scope){
            var that=this;
            this.localElement={};
            this.localRule=[[0]];
            this.watched={};
            this.add=function(partialRule, isLocal, type, defaultFn){

                function checkIfLoaded(partialRule, argArr){
                    if(!partialRule[0][0]&&loadedRule[partialRule[0][0]]){
                        for(var i=1; i<partialRule[0].length; i++){
                            watchEle(partialRule[0][i], scope, viewLogic.allElement, viewLogic.rule, defaultFn)
                        }
                        console.log(partialRule[0][0]+' is loaded')
                    } else {
                        loadedRule[partialRule[0][0]]=true;
                        addPartialRule.apply(null, argArr)
                    }
                }

                if(typeof partialRule[0][0]==='object'){
                    for(var i=0;i<partialRule.length;i++){
                        if(isLocal){
                            addPartialRule(partialRule[i], scope, that.localRule, that.localElement, that.watched, true, type, defaultFn);
                        } else {
                            checkIfLoaded(partialRule[i], [partialRule[i], scope, viewLogic.rule, viewLogic.allElement, that.watched, false, type, defaultFn]);
                            //addPartialRule(partialRule[i], scope, viewLogic.rule, viewLogic.allElement, that.watched, false, type, defaultFn);
                        }
                    }
                } else {
                    if(isLocal){
                        addPartialRule(partialRule, scope, viewLogic.rule, viewLogic.allElement, that.watched, false, type, defaultFn);
                    } else {
                        checkIfLoaded(partialRule,[partialRule, scope, viewLogic.rule, viewLogic.allElement, that.watched, false, type, defaultFn]);
                        //addPartialRule(partialRule, scope, viewLogic.rule, viewLogic.allElement, that.watched, false, type, defaultFn);
                    }
                }
            }
        }

        if(config.viewLogic&&config.viewLogic.rule) {
            addPartialRule(config.viewLogic.rule, false, viewLogic.rule, viewLogic.allElement, undefined, false, config.viewLogic.type);
            console.log("global viewLogic loaded");
        }

        return viewLogic
    }]);