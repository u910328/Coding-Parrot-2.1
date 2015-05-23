angular.module('core.viewLogic', ['firebase', 'myApp.config'])
    .factory('viewLogic', function (config, $q, model, snippet){
        console.log("viewLogicLoaded");
        var viewLogic={
            rule:[[0]],
            addPartialRule:addPartialRule,
            preProcessView:preProcessView,
            updateVL:updateVL,
            watchEle:watchEle
        };

        //allElement記錄所有元素在第一列所在行數及所有出現的列數
        var allElement={};

        function checkRow(ithRow, pathCol, pathRow) {
            var changedModelObj=new model.ModelObj(pathRow[pathCol]),
                newVal=changedModelObj.val();
            //console.log(JSON.stringify(newVal));

            switch(typeof ithRow[pathCol]){             //先檢查改變的以加快檢查速度
                case 'function':
                    if(!ithRow[pathCol].apply(null,[newVal])){
                        return false
                    }
                    break;
                case 'string':
                    if (!eval("newVal"+ithRow[pathCol])) {
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
        function preProcessView(modelPath, localElement, partialRule){
            var elements=localElement||allElement;
            var rule=partialRule||viewLogic["rule"],
                mPath=modelPath.split("|")[0],
                elemArr=elements[mPath]||[],
                index=elemArr[1],
                pathCol=elemArr[0],
                finalResult={_toBeEvaluated:[]};
            if(index===undefined) return finalResult;
            for(var i=0; i<index.length; i++){
                switch (typeof rule[index[i]][0]){
                    case 'function':
                        if(checkRow(rule[index[i]], pathCol, rule[0])){
                            finalResult['_toBeEvaluated'].push([rule[index[i]][0],true]);
                        } else {
                            finalResult['_toBeEvaluated'].push([rule[index[i]][0],false]);
                        }
                        break;
                    case 'string':
                        var resultArr=rule[index[i]][0].split(";"); //rule 的最後一行看起來像 "showAAA=class1;showBBB=class2"
                        if(checkRow(rule[index[i]], pathCol, rule[0])){
                            for(var j=0;j<resultArr.length;j++){
                                finalResult[resultArr[j].split("=")[0]]=resultArr[j].split("=")[1].split("|")[0]
                            }
                        } else {
                            for(var k=0;k<resultArr.length;k++){
                                finalResult[resultArr[k].split("=")[0]]=resultArr[k].split("=")[1].split("|")[1]
                            }
                        }
                        break;
                }
            }
            console.log(JSON.stringify(finalResult));
            return finalResult
        }

        function updateVL(modelPath, localElement, partialRule) {
            var toBeUpdated=preProcessView(modelPath, localElement, partialRule);
            for (var key in toBeUpdated) {
                if(key==="_toBeEvaluated") continue;
                snippet.evalAssignment([model, key.split(".")], [toBeUpdated[key]]);
            }
            for(var i=0; i<toBeUpdated["_toBeEvaluated"].length; i++){
                toBeUpdated["_toBeEvaluated"][i][0].apply(null, [toBeUpdated["_toBeEvaluated"][i][1]]);
            }
        }

        function watchEle(eleName, scope, localElement, partialRule){
            scope.$watch(eleName, function(nval, oval){
                console.log(eleName, nval,oval);
                updateVL(eleName, localElement, partialRule);
            })
        }

        function addPartialRule(partialRule, scope, isLocal){
            var partialFirstRow=partialRule[0],
                elePosArr=[],
                evalStr="";
            if(isLocal){
                var localElement={};
                for(var l=0; l<partialRule.length; l++){
                    for(var m=1; m<partialFirstRow.length; m++){
                        if(l===0){
                            localElement[partialFirstRow[m]]=[m,[]];
                            evalStr=evalStr+"watchEle('"+partialFirstRow[m]+"', scope, localElement, partialRule);";
                            //watchEle(partialFirstRow[m], scope, localElement);
                        } else {
                            if(!!partialRule[l][m]) {
                                localElement[partialFirstRow[m]][1].push(l)
                            }
                        }
                    }
                }
                //console.log(JSON.stringify(localElement));

                eval(evalStr);
                return localElement
            }

            for(var i=1; i<partialFirstRow.length; i++){
                evalStr=evalStr+"watchEle('"+partialFirstRow[i]+"', scope);";
                if(allElement[partialFirstRow[i]]===undefined){
                    var colNum=viewLogic.rule[0].length;
                    viewLogic.rule[0][colNum]=partialFirstRow[i];
                    allElement[partialFirstRow[i]]=[colNum,[]];
                    elePosArr.push(colNum);
                } else{
                    elePosArr.push(allElement[partialFirstRow[i]][0]);
                }
            }



            var rowNum=viewLogic.rule.length;
            for(var j=1; j<partialRule.length; j++){
                var newRow=[partialRule[j][0]];
                for(var k=1; k<partialFirstRow.length; k++){
                    if(!!partialRule[j][k]) {
                        newRow[elePosArr[k-1]]=partialRule[j][k];
                        allElement[viewLogic.rule[0][elePosArr[k-1]]][1].push(rowNum+j-1);
                    }
                }
                viewLogic.rule.push(newRow);
                //viewLogic.result.push(partialRule[j][partialFirstRow.length-1]);
            }

            if(scope) eval(evalStr);
            //console.log(JSON.stringify(viewLogic.rule));
            //console.log(JSON.stringify(allElement));

            return allElement
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

        addPartialRule(config.viewLogic);
        return viewLogic
    });