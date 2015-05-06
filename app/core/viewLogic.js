angular.module('core.viewLogic', ['firebase', 'myApp.config'])
    .factory('viewLogic', function (config, $q){
        console.log("viewLogicLoaded");
        var viewLogic={
            ruleMatrix: config.viewLogic,
            createIndex:createIndex,
            subRule:{}
        };
        var temp={};
        temp.allElement={colCount:0};


        var ruleMatrix=config.viewLogic,
            rowNum=ruleMatrix.length,
            colNum=ruleMatrix[0].length;

        function compilePartialRule(partialRule, name){
            var firstRow=partialRule[0],
                elePosArr=[];
            for(var i=0; i<firstRow.length; i++){
                if(firstRow[i]==="result") break;
                if(temp.allElement[firstRow[i]]===undefined){
                    var colNum=viewLogic.ruleMatrix[0].length;
                    viewLogic.ruleMatrix[0][colNum]=firstRow[i];
                    temp.allElement[firstRow[i]]=colNum;
                    elePosArr.push(colNum);
                } else{
                    elePosArr.push(temp.allElement[firstRow[i]]);
                }
            }
            for(var j=1; j<partialRule.length; j++){
                viewLogic.ruleMatrix.push([]);
                var rowNum=viewLogic.ruleMatrix.length-1;
                if(name){
                    viewLogic.subRule[name]=[rowNum, partialRule.length]
                }
                for(var k=0; k<firstRow.length; k++){
                    viewLogic.ruleMatrix[rowNum][elePosArr[k]]=partialRule[j][k]
                }
            }
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