angular.module('core.viewLogic', ['firebase', 'myApp.config'])
    .factory('viewLogic', function (config, $q, model){
        console.log("viewLogicLoaded");
        var viewLogic={
            rule:[[]],
            result:[0],
            addPartialRule:addPartialRule
        };
        //var temp={};
        //temp.allElement={colCount:0};

        //起始，將config.viewLogic裡的元素註冊到allElement
        var allElement={};
        //for(var i= 0; i<viewLogic.rule[0].length; i++){
        //    if(viewLogic.rule[0][i]==='result') break;
        //    allElement[viewLogic.rule[0][i]]=[i,[]]
        //}



        function checkRow(ithRow, pathCol, pathRow) {
            var changedModelObj=new model.ModelObj(pathRow[pathCol]),
                newVal=changedModelObj.val();
            if (!eval("newVal"+ithRow[pathCol])) {   //先檢查改變的以加快檢查速度
                return false;
            }
            for (var j = 0; j < pathRow.length; j++) {
                if (pathRow[j]==='result') break;
                if (ithRow[j] && j!= pathCol) {
                    var modelObj=new model.ModelObj(pathRow[j]),
                        val=modelObj.val();
                    if (!eval("val" + ithRow[j])) {
                        return false
                    }
                }
            }
            return true;
        }

//分成兩部分 1.先計算所有變動 preProcessView 2.將變動套用到view上 updateView
        function preProcessView(modelPath, localElement, partialRule){
            var elements=localElement||allElement;
            var rule=partialRule||viewLogic["rule"],
                colNum=rule[0].length,
                mPath=modelPath.split("|")[0],
                elem=elements[mPath]||[],
                index=elem[1],
                pathCol=elem[0],
                finalResult={};
            if(index===undefined) return finalResult;
            for(var i=0; i<index.length; i++){
                var resultArr=rule[index[i]][colNum-1].split(";"); //rule 的最後一行看起來像 "showAAA=class1;showBBB=class2"
                if(checkRow(index[i], pathCol, rule[0])){
                    for(var j=0;j<resultArr.length;j++){
                        finalResult[resultArr[j].split("=")[0]]=resultArr[j].split("=")[1].split("|")[0]
                    }
                } else {
                    for(var k=0;k<resultArr.length;k++){
                        finalResult[resultArr[k].split("=")[0]]=resultArr[k].split("=")[1].split("|")[1]
                    }
                }
            }
            console.log(JSON.stringify(finalResult));
            return finalResult
        }

        function updateVL(modelPath, localElement, partialRule) {
            var toBeUpdated=preProcessView(modelPath, localElement, partialRule);
            for (var key in toBeUpdated) {
                snippet.evalAssignment([model, key.split(".")], [toBeUpdated[key]]);
            }
        }

        function watchEle(eleName, scope, localElement, partialRule){
            scope.$watch(eleName, function(nval, oval){
                updateVL(eleName, localElement, partialRule);
            })
        }

        function addPartialRule(partialRule, isLocal, scope){
            var partialFirstRow=partialRule[0],
                elePosArr=[],
                evalStr="";
            if(isLocal){
                for(var l=1; l<partialRule.length; l++){
                    var localElement={};
                    for(var m=0; m<partialFirstRow.length; m++){
                        if(partialFirstRow[m]!=='result') break;
                        if(l===1){
                            localElement[partialFirstRow[m]]=[m,[]];
                            evalStr=evalStr+"watchEle('"+partialFirstRow[m]+"', scope, localElement, partialRule);";
                            //watchEle(partialFirstRow[m], scope, localElement);
                        }
                        if(partialRule[l][m]!==undefined) {
                            localElement[partialFirstRow[m]][1].push(l)
                        }
                    }
                }
                eval(evalStr);
                return localElement
            }

            for(var i=0; i<partialFirstRow.length; i++){
                if(partialFirstRow[i]==="result") break;
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
                var newRow=[];
                for(var k=0; k<partialFirstRow.length; k++){
                    if(partialFirstRow[k]==='result') break;
                    if(!!partialRule[j][k]) {
                        newRow[elePosArr[k]]=partialRule[j][k];
                        allElement[viewLogic.rule[0][elePosArr[k]]][1].push(rowNum+j-1)
                    }
                }
                viewLogic.rule.push(newRow);
                viewLogic.result.push(partialRule[j][partialFirstRow.length-1]);
            }

            console.log(JSON.stringify(allElement));
            console.log(JSON.stringify(viewLogic.rule));
            console.log(JSON.stringify(viewLogic.result));
            if(scope) eval(evalStr);
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