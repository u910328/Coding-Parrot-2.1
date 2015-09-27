var newModule='core.$firebase';
angular.module(newModule, ['firebase', 'myApp.config'])
    .factory('$firebase', ['FBURL', 'config', 'fbutil', '$firebaseObject', '$q', 'snippet', function (FBURL, config, fbutil, $firebaseObject, $q, snippet) {
        var $firebase = {
            FbObj: FbObj,
            load: load,
            update: update,
            set: set,
            batchUpdate: batchUpdate,
            params: {},
            databases: {},
            ref: ref,
            $communicate:$communicate,
            $object: $object,
            getMultipleRefVal:getMultipleRefVal,
            move:move
        };

        var activeRefUrl = {};

        function FbObj(refUrl, opt) {
            var dbOpt = opt || {}, db = $firebase.databases[refUrl.split("@")[1]] || {};

            function isDbOnline() {
                if (dbOpt.keepOnline !== undefined) return !!dbOpt.keepOnline;
                if (db.keepOnline !== undefined) return !!db.keepOnline;
                return true
            }

            this.dbName = db.Name || FBURL.split("//")[1].split(".fi")[0];
            this.dbUrl = "https://" + this.dbName + ".firebaseio.com";
            this.path = refUrl.split("@")[0];
            this.url = this.dbUrl + "/" + this.path;
            this.t = (new Date).getTime().toString();
            this.params = dbOpt.params || {};
            this.keepOnline = isDbOnline();
        }

        FbObj.prototype = {
            ref: function () {
                var ref = new Firebase(this.dbUrl);
                var pathArr = this.path.split("/");
                for (var i = 0; i < pathArr.length; i++) {
                    if (pathArr[i].charAt(0) === "$") {
                        ref = ref.push();
                        this.params[pathArr[i]] = ref.key();
                    } else {
                        ref = ref.child(pathArr[i]);
                    }
                }
                this.url = ref.toString();
                this.path = this.url.split(".com/")[1];
                return ref
            },
            goOnline: function () {
                if (activeRefUrl[this.dbUrl] === undefined) {
                    activeRefUrl[this.dbUrl] = []
                }
                if (activeRefUrl[this.dbUrl].length === 0) {
                    if (!this.keepOnline) {
                        Firebase.goOnline(this.dbUrl);
                        console.log(this.dbUrl, "is online", this.t)
                    }
                }
                activeRefUrl[this.dbUrl].push(this.t);
                return this
            },
            goOffline: function () {
                if (this.keepOnline) return this;
                if (activeRefUrl[this.dbUrl] === undefined) {
                    activeRefUrl[this.dbUrl] = []
                }
                if (activeRefUrl[this.dbUrl].length === 1) {
                    if (!this.keepOnline) {
                        Firebase.goOffline(this.dbUrl);
                        console.log(this.dbUrl, "is offline", this.t)
                    }
                }
                var tPos = activeRefUrl[this.dbUrl].indexOf(this.t);
                if (tPos != -1) {
                    activeRefUrl[this.dbUrl].splice(tPos, 1);
                }
                return this
            }
        };

        function ref(refUrl, opt) {
            var fbObj = new FbObj(refUrl, opt);
            return fbObj.ref()
        }

        var objectRepo={};
        function $object(refUrl){
            if(objectRepo[refUrl]){
                return objectRepo[refUrl]
            } else {
                objectRepo[refUrl]=$firebaseObject(ref(refUrl));
                return objectRepo[refUrl]
            }
        }

        //TODO:用snippet.DelayExec改寫
        function Digest(scope, fbObj, isSync, delay) {
            var timeout;
            this.reset = function (callback, customDelay) {
                if (timeout != undefined) clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (callback) callback.apply(null);
                    if (!isSync) fbObj.goOffline();
                    if (scope) scope.$digest();
                }, customDelay || delay);
            }
        }


        function load(refUrl, rule, extraOnComplete, finalOnComplete) {
            var fbObj = new FbObj(refUrl),
                query = rule && rule["query"] ? "." + rule["query"] : "",
                isSync = rule && rule["isSync"] || true,
                eventType = rule && rule["eventType"] || 'value',
                scope = rule && rule["scope"],
                delay = rule && rule["delay"] || 300;

            var ref = fbObj.ref(),
                queryRef = eval("ref" + query);

            var digest = new Digest(scope, fbObj, isSync, delay);

            fbObj.goOnline();

            function RefObj(isSync, eventType) {
                var that = this, sync;

                function onComplete1(snap, prevChildName, digestCb) {
                    if (config.debug) console.log('load complete', JSON.stringify(snap.val()));

                    digest.reset(function () {
                        if (typeof digestCb === 'function') digestCb.apply(null);
                        if (typeof finalOnComplete === 'function') finalOnComplete.apply(null, [snap, prevChildName])
                    });
                    if (extraOnComplete) return extraOnComplete(snap, prevChildName);
                }

                if (isSync) {
                    sync = 'on';
                    that.onComplete = onComplete1;
                } else {
                    sync = 'once';
                    if (eventType === 'child_added') {
                        sync = 'on';
                        that.onComplete = function (snap, prevChildName) {
                            onComplete1(snap, prevChildName, function () {
                                queryRef.off('child_added', that.onComplete)
                            })
                        }
                    } else {
                        that.onComplete = onComplete1
                    }
                }
                that.evalString = "queryRef." + sync + "('" + eventType + "', onComplete, errorCallback)"
            }

            var refObj = new RefObj(isSync, eventType);
            var onComplete = refObj.onComplete;

            function errorCallback(err) {
                console.log("Fail to load " + refUrl + ": " + err.code);
                //TODO: 加入ERROR到MODEL
                fbObj.goOffline();
            }

            digest.reset(null, 5000);
            eval(refObj.evalString);
        }

        function update(refUrl, value, onComplete, removePrev, refUrlParams) {
            var def = $q.defer();
            var replacedRefUrl = snippet.replaceParamsInString(refUrl, refUrlParams);
            var fbObj = new FbObj(replacedRefUrl), ref = fbObj.ref(), type = removePrev ? 'set' : 'update';

            //將因push而自動生成的key值放到value內相對應的property中
            var params = angular.extend({}, refUrlParams, fbObj.params);
            //console.log(JSON.stringify(params));
            if (typeof value === 'object' && value != null) {
                for (var key in params) {
                    var realKey = key.split('$')[1];
                    if (value[realKey] === undefined) continue;
                    value[realKey] = params[key];
                }
            } else if (typeof value === 'string') {
                for (var key in params) {
                    value.replace(key, params[key]);
                }
            }

            fbObj.goOnline();

            ref[type](value, function (error) {
                if (onComplete) onComplete.apply(null, [error]);
                if (error) {
                    console.log("Update failed: " + refUrl);
                    def.reject(error);
                } else {
                    if (config.debug) {
                        console.log("Update success: " + refUrl)
                    }
                    def.resolve();
                }
                fbObj.goOffline();
            });

            def.promise.params = fbObj.params;

            return def.promise
        }

        function set(refUrl, value, onComplete, refUrlParams) {
            update(refUrl, value, onComplete, true, refUrlParams);
        }

//TODO: Transaction

        function batchUpdate(values, isConsecutive) {
            var def = $q.defer();
            var onCompletes = [], refUrlParams = snippet.cloneObject($firebase.params);

            function update(i) {
                var ithOnComplete = (isConsecutive) ? onCompletes[i] : values[i].onComplete;
                var params = $firebase.update(values[i].refUrl, values[i].value, ithOnComplete, values[i].set, refUrlParams).params;
                refUrlParams = angular.extend(refUrlParams, params);
            }

            function OnComplete(j, isLast) {
                return function (error) {
                    if (values[j] && values[j].onComplete) values[j].onComplete.apply(null, [error]);
                    if (error) {
                        def.reject(error);
                        return
                    }

                    if (isLast) {
                        def.resolve({params: refUrlParams});
                    } else {
                        update(j + 1);
                    }
                }
            }

            if (isConsecutive || isConsecutive === undefined) {
                for (var j = 0; j < values.length; j++) {
                    onCompletes[j] = new OnComplete(j, j === (values.length - 1));  //防止最後實際執行onComplete時使用的是跑完loop後的j的值
                }
                update(0);
            } else {
                for (var i = 0; i < values.length; i++) {
                    update(i);
                }
            }
            return def.promise
        }

        function move(from, to){
            var sourceRef=new Firebase(from),
                targetRef=new Firebase(to);
            sourceRef.once('value', function(snap){
                targetRef.update(snap.val());
            })
        }

        function $transfer(from, to){
            var sourceRef=new Firebase(from.refUrl),
                targetRef=new Firebase(to.refUrl),
                def=$q.defer();
            sourceRef.once('value', function(snap){
                var value=from.modifier&&(typeof modifier==='function')? from.modifier(snap.val()):snap.val();
                targetRef.update(value, function(error){
                    if(error){
                        def.reject(error);
                    } else {
                        def.resolve();
                    }
                });
            })
        }

        function $communicate(opt) {
            var res = {}, def = $q.defer();
            if (typeof opt !== 'object') return;

            batchUpdate(opt.request, true).then(function (resolveVal) {
                if(!opt.response) {
                    def.resolve(resolveVal);
                    return
                }
                angular.extend(res, resolveVal);
                var resUrlArr= snippet.replaceParamsInObj(opt.response, resolveVal.params);

                getResponse(resUrlArr).then(function (response) {
                    angular.extend(res, response);
                    def.resolve(res);
                }, function (error) {
                    def.reject(error);
                })
            }, function (error) {
                def.reject(error);
            });
            return def.promise
        }

        function getResponse(refs) {
            var refNum= Object.keys(refs).length, res = {};

            var def = $q.defer(),
                waitUntil = new snippet.WaitUntil(refNum, function () {
                    def.resolve(res)
                });

            for (var key in refs) {
                ref(refs[key]).on('value', function (snap) {
                    if(res[key]!==undefined){
                        res[key]=snap.val();
                        waitUntil.resolve();
                        ref(refs[key]).off();
                    } else {
                        res[key] = snap.val(); //server hasn't change the data.
                    }
                    //setTimeout(function(){waitUntil.resolve()},0);
                }, function (err) {
                    def.reject(err);
                });
            }
            return def.promise
        }

        function getMultipleRefVal(refs, opt){
            var _opt=opt? opt:{};

            var res={},
                params={},
                onComplete={},
                onGoingRef={},
                def = $q.defer(),
                refNum= Object.keys(refs).length,
                indicator=_opt.indicator||'&',
                currentRefs=angular.extend({},refs),
                waitUntil = new snippet.WaitUntil(refNum, function () {
                    def.resolve(res)
                });

            for(var key in refs){
                onGoingRef[key]=false;
            }

            function iterate(){
                currentRefs=snippet.replaceParamsInObj(currentRefs, params);
                for(var key in onGoingRef){
                    if(onGoingRef.hasOwnProperty(key)&&currentRefs[key].indexOf(indicator)===-1&&!onGoingRef[key]){

                        onComplete[key]=new (function(key){
                            return function (snap){
                                if(typeof snap.val()==='string') {
                                    params[indicator+key]=snap.val();

                                }
                                res[key]=snap.val();
                                delete onGoingRef[key];
                                waitUntil.resolve();
                                iterate();
                            }
                        })(key);

                        onGoingRef[key]=true;
                        ref(currentRefs[key]).once('value', onComplete[key])
                    }
                }
            }
            iterate();
            return def.promise
        }

        return $firebase
    }]);

if(appDI) appDI.push(newModule);