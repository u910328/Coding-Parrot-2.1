angular.module('core.localFb', ['firebase', 'myApp.config'])
    .factory('localFb', function (FBURL, config, fbutil, $q, model, snippet) {
        var localFb={
            FbObj:FbObj,
            load:load,
            update:update,
            set:set,
            updateModel:updateModel,
            path:{},
            debug:'debug'
        };

        function FbObj(refUrl){
            var that=this;
            this.dbName=model.db[refUrl.split("@")[1]]||FBURL.split("//")[1].split(".fi")[0];
            this.dbUrl="https://"+this.dbName+".firebaseio.com";
            this.path=refUrl.split("@")[0];
            this.url= this.dbUrl+"/"+this.path;
            this.dbType=refUrl.split("@")[1];
            this.t=(new Date).getTime().toString();
            this.omniKey={};
            this.ref=function(){
                var ref= new Firebase(that.dbUrl);
                var pathArr=that.path.split("/");
                for(var i=0; i<pathArr.length; i++){
                    if(pathArr[i].charAt(0)==="$"){
                        ref=ref.push();
                        that.omniKey[pathArr[i]]=ref.key();
                    } else {
                        ref=ref.child(pathArr[i]);
                    }
                }
                that.url=ref.toString();
                that.path=that.url.split(".com/")[1];
                return ref
            };

            this.goOnline=function(){
                if(model.db.online[that.dbUrl]===undefined){model.db.online[that.dbUrl]=[]}
                if(model.db.online[that.dbUrl].length===0){
                    Firebase.goOnline(that.dbUrl);
                    console.log(that.dbUrl,"is online", that.t)
                }
                model.db.online[that.dbUrl].push(that.t);
            };

            this.goOffline=function(){
                if(model.db.online[that.dbUrl]===undefined){model.db.online[that.dbUrl]=[]}
                if(model.db.online[that.dbUrl].length===1) {
                    Firebase.goOffline(that.dbUrl);
                    console.log(that.dbUrl,"is offline", that.t)
                }
                var tPos=model.db.online[that.dbUrl].indexOf(that.t);
                if(tPos!=-1){
                    model.db.online[that.dbUrl].splice(tPos,1);
                }
            }
        }

        function Digest(scope, fbObj, isSync, delay){
            var timeout;
            this.reset=function(callback, overrideDelay){
                if(timeout!=undefined) clearTimeout(timeout);
                timeout=setTimeout(function(){
                    if(callback) callback.apply(null);
                    if(!isSync) fbObj.goOffline();
                    if(scope) scope.$digest();
                }, overrideDelay||delay);
            }
        }


        function updateModel(modelPath, value, key, eventType){
            switch(eventType){
                case "child_added":
                    if(modelPath) model.update(modelPath+"."+key, value);
                    break;
                case "child_removed":
                    if(modelPath) model.update(modelPath+"."+key, null);
                    break;
                case "child_changed":
                    if(modelPath) model.update(modelPath+"."+key, value);
                    break;
                case "child_moved":
                    break;
                default:
                    if(modelPath) model.update(modelPath, value);
            }
        }



        function load(refUrl, modelPath, rule, extraOnComplete, finalOnComplete){
            var fbObj=new FbObj(refUrl),
                query=rule["query"]? "."+rule["query"]:"",
                isSync=rule["isSync"],
                eventType=rule["eventType"],
                scope=rule["scope"],
                delay=rule["delay"]||300;

            var ref=fbObj.ref(),
                queryRef=eval("ref"+query);

            var digest=new Digest(scope, fbObj, isSync, delay);

            fbObj.goOnline();

            function RefObj(isSync, eventType){
                var that=this, sync;

                function onComplete1(snap, prevChildName, digestCb){
                    updateModel(modelPath, snap.val(), snap.key(), eventType);
                    console.log('load complete', snap.val());

                    digest.reset(function(){
                        if(typeof digestCb==='function') digestCb.apply(null);
                        if(typeof finalOnComplete==='function') finalOnComplete.apply(null, [snap, prevChildName])
                    });
                    if(extraOnComplete) return extraOnComplete(snap, prevChildName);
                }

                if(isSync){
                    sync='on';
                    that.onComplete=onComplete1;
                } else {
                    sync='once';
                    if(eventType==='child_added'){
                        sync='on';
                        that.onComplete=function(snap, prevChildName){
                            onComplete1(snap, prevChildName, function(){
                                queryRef.off('child_added', that.onComplete)
                            })
                        }
                    } else {
                        that.onComplete=onComplete1
                    }
                }
                that.evalString="queryRef."+sync+"('"+(eventType||'value')+"', onComplete, errorCallback)"
            }

            var refObj=new RefObj(isSync, eventType);
            var onComplete=refObj.onComplete;

            function errorCallback(err){
                console.log("Fail to load "+refUrl+": "+err.code);
                //TODO: 加入ERROR到MODEL
                fbObj.goOffline();
            }

            eval(refObj.evalString);
            digest.reset(null, 5000)
        }

        function update(refUrl, modelPath, value, onComplete, actionObj, removePrev){
            var fbObj=new FbObj(refUrl), ref=fbObj.ref(), type=removePrev? 'set':'update';

            fbObj.goOnline();

            if(actionObj){
                actionObj.lastParam=fbObj.omniKey;
                actionObj.replace('updateFbArr', fbObj.omniKey);
            }

            ref[type](value, function(error){
                if (error) {
                    console.log("Update failed: "+refUrl);
                } else {
                    if(config.debug){console.log("Update success: "+refUrl)}
                    if(modelPath) updateModel(modelPath, value);
                    if(onComplete) onComplete.apply(null);
                }
                fbObj.goOffline();
            });
        }

        function set(refUrl, modelPath, value, onComplete, actionObj){
            update(refUrl, modelPath, value, onComplete, actionObj, true);
        }
//TODO: Transaction

        return localFb
    });