angular.module('core.viewLogic', ['firebase', 'myApp.config'])
    .factory('viewLogic', function (config, $q, model){
        console.log("viewLogicLoaded");
        var viewLogic={
            ruleMatrix: config.viewLogic,
            createIndex:createIndex,
            subRule:{}
        };
        var temp={};
        temp.allElement={colCount:0};

        var allElement={};
        for(var i= 0; i<viewLogic.ruleMatrix[0].length; i++){
            if(viewLogic.ruleMatrix[0][i]==='result') break;
            allElement[viewLogic.ruleMatrix[0][i]]=i
        }


        var ruleMatrix=config.viewLogic,
            rowNum=ruleMatrix.length,
            colNum=ruleMatrix[0].length;

        function checkRow(i, pathCol, partialRule) {
            var rule=partialRule||viewLogic["ruleMatrix"];
            var ithRow = rule[i],
                pathRow = rule[0],
                match = true,
                changedModelObj=new model.ModelObj(pathRow[pathCol]),
                changedVal=changedModelObj.val();
            if (!eval("changedVal"+ithRow[pathCol])) {   //先檢查改變的以加快檢查速度
                return false;
            }
            for (var j = 0; j < pathRow.length; j++) {
                if (pathRow[j]==='result') break;
                if (ithRow[j] && j!= pathCol) {
                    var modelObj=new model.ModelObj(pathRow[j]),
                        val=modelObj.val();
                    if (!eval("val" + ithRow[j])) {
                        match = false;
                        break;
                    }
                }
            }
            return match;
        }

//分成兩部分 1.先計算所有變動 preProcessView 2.將變動套用到view上 updateView
        function preProcessView(modelPath, allElement, partialRule){
            var rule=partialRule||viewLogic["ruleMatrix"],
                colNum=rule[0].length,
                mPath=modelPath.split("|")[0],
                index=allElement[mPath][1],
                finalResult={};
            if(index===undefined) return finalResult;
            for(var i=1; i<index.length; i++){            //第0個元素為該path所在行數
                var resultArr=rule[index[i]][colNum-1].split(";"); //rule 的最後一行看起來像 "showAAA=class1;showBBB=class2"
                if(checkRow(index[i], index[0])){
                    for(var j=0;j<resultArr.length;j++){
                        finalResult[resultArr[j].split("=")[0]]=resultArr[j].split("=")[1].split("|")[0]
                    }
                } else {
                    for(var k=0;k<resultArr.length;k++){
                        finalResult[resultArr[k].split("=")[0]]=resultArr[k].split("=")[1].split("|")[1]
                    }
                }//TODO:加入不通過時default的處理
            }
            console.log(JSON.stringify(finalResult));
            return finalResult
        }

        function updateVL(modelPath, allElement) {
            var toBeUpdated=preProcessView(modelPath);
            for (var key in toBeUpdated) {
                snippet.evalAssignment([model, key.split(".")], [toBeUpdated[key]]);
            }
        }

        function watchEle(eleName, scope, allElement){
            scope.$watch(eleName, function(nval, oval){
                updateVL(eleName, allElement);
            })
        }

        function addPartialRule(partialRule, isLocal, scope){
            var partialFirstRow=partialRule[0],
                elePosArr=[];
            if(isLocal){
                for(var l=1; l<partialRule.length; l++){
                    var localElement={};
                    for(var m=0; m<partialFirstRow.length; m++){
                        if(partialFirstRow[m]!=='result') break;
                        if(l===1){
                            localElement[partialFirstRow[m]]=[-1,[]];
                            watchEle(partialFirstRow[m], scope, localElement);
                        }
                        if(partialRule[l][m]!==undefined) {
                            localElement[partialFirstRow[m]][1].push(l)
                        }
                    }
                }
                return localElement
            }

            for(var i=0; i<partialFirstRow.length; i++){
                if(partialFirstRow[i]==="result") break;
                watchEle(partialFirstRow[m], scope, allElement);
                if(allElement[partialFirstRow[i]]===undefined){
                    var colNum=viewLogic.ruleMatrix[0].length;
                    viewLogic.ruleMatrix[0][colNum]=partialFirstRow[i];
                    allElement[partialFirstRow[i]]=[colNum,[]];
                    elePosArr.push(colNum);
                } else{
                    elePosArr.push(allElement[partialFirstRow[i]][0]);
                }
            }
            for(var j=1; j<partialRule.length; j++){
                var newRow=[];
                var rowNum=viewLogic.ruleMatrix.length;
                for(var k=0; k<partialFirstRow.length; k++){
                    if(partialRule[j][k]!==undefined) {
                        newRow[elePosArr[k]]=partialRule[j][k];
                        var ele=viewLogic.ruleMatrix[0][elePosArr[k]];
                        allElement[ele][1].push(rowNum+j-1)
                    }
                }
                viewLogic.ruleMatrix.push(newRow);
            }
            return allElement
        }

        function compileRule(){
            viewLogic.ruleMatrix=[[]];
            for(var key in config.viewLogic){
                var firstRow=config.viewLogic[key][0];
                temp[key]=[];
                //生成新的第一行，綜合所有的子表的第一行，將第一次出現的element放到rowCount那一列
                // 並記錄每個KEY 子表的元素位置於temp[key] array
                for(var i=0; i<firstRow.length; i++){
                    if(firstRow[i]==="result") break;
                    if(temp.allElement[firstRow[i]]===undefined){
                        viewLogic.ruleMatrix[0][temp.allElement.colCount]=firstRow[i];
                        temp.allElement[firstRow[i]]=temp.allElement.colCount;
                        temp[key].push(temp.allElement.colCount);
                        temp.allElement.colCount++;
                    } else {
                        temp[key].push(temp.allElement[firstRow[i]]);
                    }
                }
                //總表產生一列新的判斷列並將原本的key 名稱的table 裡的判斷列元素放到對應的位置
                for(var j=1; j<config.viewLogic[key].length; j++){
                    viewLogic.ruleMatrix.push([]);
                    for(var k=0; k<firstRow.length; k++){
                        viewLogic.ruleMatrix[viewLogic.ruleMatrix.length-1][temp[key][k]]=config.viewLogic[key][j][k]
                    }
                }
            }
        }

        function createIndex(){
            viewLogic["index"]={}; //紀錄規則表中的某modelPath 其值變動所需檢查的部分
            for(var i=0; i<rowNum; i++){
                for(var j=0; j<colNum-1; j++){ //最後一行是條件確認後要變動的位置
                    if(i===0){
                        viewLogic["index"][ruleMatrix[0][j]]=[j];    //第0個元素為該path所在行數
                    } else {
                        if(!!ruleMatrix[i][j]){
                            viewLogic["index"][ruleMatrix[0][j]].push(i)
                        }
                    }
                }
            }
        }
        return viewLogic
    });