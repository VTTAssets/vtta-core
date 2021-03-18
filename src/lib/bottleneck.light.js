!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.Bottleneck=e()}(this,function(){"use strict";var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var e,s,i,r={load:function(t,e,s={}){var i,r,n;for(i in e)n=e[i],s[i]=null!=(r=t[i])?r:n;return s},overwrite:function(t,e,s={}){var i,r;for(i in t)r=t[i],void 0!==e[i]&&(s[i]=r);return s}},n=(e=class{constructor(t,e){this.incr=t,this.decr=e,this._first=null,this._last=null,this.length=0}push(t){var e;this.length++,"function"==typeof this.incr&&this.incr(),e={value:t,prev:this._last,next:null},null!=this._last?(this._last.next=e,this._last=e):this._first=this._last=e}shift(){var t;if(null!=this._first)return this.length--,"function"==typeof this.decr&&this.decr(),t=this._first.value,null!=(this._first=this._first.next)?this._first.prev=null:this._last=null,t}first(){if(null!=this._first)return this._first.value}getArray(){var t,e,s;for(t=this._first,s=[];null!=t;)s.push((e=t,t=t.next,e.value));return s}forEachShift(t){var e;for(e=this.shift();null!=e;)t(e),e=this.shift()}debug(){var t,e,s,i,r;for(t=this._first,r=[];null!=t;)r.push((e=t,t=t.next,{value:e.value,prev:null!=(s=e.prev)?s.value:void 0,next:null!=(i=e.next)?i.value:void 0}));return r}},class{constructor(t){if(this.instance=t,this._events={},null!=this.instance.on||null!=this.instance.once||null!=this.instance.removeAllListeners)throw new Error("An Emitter already exists for this object");this.instance.on=((t,e)=>this._addListener(t,"many",e)),this.instance.once=((t,e)=>this._addListener(t,"once",e)),this.instance.removeAllListeners=((t=null)=>null!=t?delete this._events[t]:this._events={})}_addListener(t,e,s){var i;return null==(i=this._events)[t]&&(i[t]=[]),this._events[t].push({cb:s,status:e}),this.instance}listenerCount(t){return null!=this._events[t]?this._events[t].length:0}async trigger(t,...e){var s,i;try{if("debug"!==t&&this.trigger("debug",`Event triggered: ${t}`,e),null==this._events[t])return;return this._events[t]=this._events[t].filter(function(t){return"none"!==t.status}),i=this._events[t].map(async t=>{var s,i;if("none"!==t.status){"once"===t.status&&(t.status="none");try{return"function"==typeof(null!=(i="function"==typeof t.cb?t.cb(...e):void 0)?i.then:void 0)?await i:i}catch(t){return s=t,this.trigger("error",s),null}}}),(await Promise.all(i)).find(function(t){return null!=t})}catch(t){return s=t,this.trigger("error",s),null}}});s=e,i=n;var o,h,u=class{constructor(t){this.Events=new i(this),this._length=0,this._lists=function(){var e,i,r;for(r=[],e=1,i=t;1<=i?e<=i:e>=i;1<=i?++e:--e)r.push(new s(()=>this.incr(),()=>this.decr()));return r}.call(this)}incr(){if(0==this._length++)return this.Events.trigger("leftzero")}decr(){if(0==--this._length)return this.Events.trigger("zero")}push(t){return this._lists[t.options.priority].push(t)}queued(t){return null!=t?this._lists[t].length:this._length}shiftAll(t){return this._lists.forEach(function(e){return e.forEachShift(t)})}getFirst(t=this._lists){var e,s,i;for(e=0,s=t.length;e<s;e++)if((i=t[e]).length>0)return i;return[]}shiftLastFrom(t){return this.getFirst(this._lists.slice(t).reverse()).shift()}},a=class extends Error{};h=r,o=a;var l,c,_=class{constructor(t,e,s,i,r,n,o,u){this.task=t,this.args=e,this.rejectOnDrop=r,this.Events=n,this._states=o,this.Promise=u,this.options=h.load(s,i),this.options.priority=this._sanitizePriority(this.options.priority),this.options.id===i.id&&(this.options.id=`${this.options.id}-${this._randomIndex()}`),this.promise=new this.Promise((t,e)=>{this._resolve=t,this._reject=e}),this.retryCount=0}_sanitizePriority(t){var e;return(e=~~t!==t?5:t)<0?0:e>9?9:e}_randomIndex(){return Math.random().toString(36).slice(2)}doDrop({error:t,message:e="This job has been dropped by Bottleneck"}={}){return!!this._states.remove(this.options.id)&&(this.rejectOnDrop&&this._reject(null!=t?t:new o(e)),this.Events.trigger("dropped",{args:this.args,options:this.options,task:this.task,promise:this.promise}),!0)}_assertStatus(t){var e;if((e=this._states.jobStatus(this.options.id))!==t&&("DONE"!==t||null!==e))throw new o(`Invalid job status ${e}, expected ${t}. Please open an issue at https://github.com/SGrondin/bottleneck/issues`)}doReceive(){return this._states.start(this.options.id),this.Events.trigger("received",{args:this.args,options:this.options})}doQueue(t,e){return this._assertStatus("RECEIVED"),this._states.next(this.options.id),this.Events.trigger("queued",{args:this.args,options:this.options,reachedHWM:t,blocked:e})}doRun(){return 0===this.retryCount?(this._assertStatus("QUEUED"),this._states.next(this.options.id)):this._assertStatus("EXECUTING"),this.Events.trigger("scheduled",{args:this.args,options:this.options})}async doExecute(t,e,s,i){var r,n,o;0===this.retryCount?(this._assertStatus("RUNNING"),this._states.next(this.options.id)):this._assertStatus("EXECUTING"),n={args:this.args,options:this.options,retryCount:this.retryCount},this.Events.trigger("executing",n);try{if(o=await(null!=t?t.schedule(this.options,this.task,...this.args):this.task(...this.args)),e())return this.doDone(n),await i(this.options,n),this._assertStatus("DONE"),this._resolve(o)}catch(t){return r=t,this._onFailure(r,n,e,s,i)}}doExpire(t,e,s){var i,r;return this._states.jobStatus("RUNNING"===this.options.id)&&this._states.next(this.options.id),this._assertStatus("EXECUTING"),r={args:this.args,options:this.options,retryCount:this.retryCount},i=new o(`This job timed out after ${this.options.expiration} ms.`),this._onFailure(i,r,t,e,s)}async _onFailure(t,e,s,i,r){var n,o;if(s())return null!=(n=await this.Events.trigger("failed",t,e))?(o=~~n,this.Events.trigger("retry",`Retrying ${this.options.id} after ${o} ms`,e),this.retryCount++,i(o)):(this.doDone(e),await r(this.options,e),this._assertStatus("DONE"),this._reject(t))}doDone(t){return this._assertStatus("EXECUTING"),this._states.next(this.options.id),this.Events.trigger("done",t)}};c=r,l=a;var d,p=class{constructor(t,e,s){this.instance=t,this.storeOptions=e,this.clientId=this.instance._randomIndex(),c.load(s,s,this),this._nextRequest=this._lastReservoirRefresh=this._lastReservoirIncrease=Date.now(),this._running=0,this._done=0,this._unblockTime=0,this.ready=this.Promise.resolve(),this.clients={},this._startHeartbeat()}_startHeartbeat(){var t;return null==this.heartbeat&&(null!=this.storeOptions.reservoirRefreshInterval&&null!=this.storeOptions.reservoirRefreshAmount||null!=this.storeOptions.reservoirIncreaseInterval&&null!=this.storeOptions.reservoirIncreaseAmount)?"function"==typeof(t=this.heartbeat=setInterval(()=>{var t,e,s,i,r;if(i=Date.now(),null!=this.storeOptions.reservoirRefreshInterval&&i>=this._lastReservoirRefresh+this.storeOptions.reservoirRefreshInterval&&(this._lastReservoirRefresh=i,this.storeOptions.reservoir=this.storeOptions.reservoirRefreshAmount,this.instance._drainAll(this.computeCapacity())),null!=this.storeOptions.reservoirIncreaseInterval&&i>=this._lastReservoirIncrease+this.storeOptions.reservoirIncreaseInterval&&(({reservoirIncreaseAmount:t,reservoirIncreaseMaximum:s,reservoir:r}=this.storeOptions),this._lastReservoirIncrease=i,(e=null!=s?Math.min(t,s-r):t)>0))return this.storeOptions.reservoir+=e,this.instance._drainAll(this.computeCapacity())},this.heartbeatInterval)).unref?t.unref():void 0:clearInterval(this.heartbeat)}async __publish__(t){return await this.yieldLoop(),this.instance.Events.trigger("message",t.toString())}async __disconnect__(t){return await this.yieldLoop(),clearInterval(this.heartbeat),this.Promise.resolve()}yieldLoop(t=0){return new this.Promise(function(e,s){return setTimeout(e,t)})}computePenalty(){var t;return null!=(t=this.storeOptions.penalty)?t:15*this.storeOptions.minTime||5e3}async __updateSettings__(t){return await this.yieldLoop(),c.overwrite(t,t,this.storeOptions),this._startHeartbeat(),this.instance._drainAll(this.computeCapacity()),!0}async __running__(){return await this.yieldLoop(),this._running}async __queued__(){return await this.yieldLoop(),this.instance.queued()}async __done__(){return await this.yieldLoop(),this._done}async __groupCheck__(t){return await this.yieldLoop(),this._nextRequest+this.timeout<t}computeCapacity(){var t,e;return({maxConcurrent:t,reservoir:e}=this.storeOptions),null!=t&&null!=e?Math.min(t-this._running,e):null!=t?t-this._running:null!=e?e:null}conditionsCheck(t){var e;return null==(e=this.computeCapacity())||t<=e}async __incrementReservoir__(t){var e;return await this.yieldLoop(),e=this.storeOptions.reservoir+=t,this.instance._drainAll(this.computeCapacity()),e}async __currentReservoir__(){return await this.yieldLoop(),this.storeOptions.reservoir}isBlocked(t){return this._unblockTime>=t}check(t,e){return this.conditionsCheck(t)&&this._nextRequest-e<=0}async __check__(t){var e;return await this.yieldLoop(),e=Date.now(),this.check(t,e)}async __register__(t,e,s){var i,r;return await this.yieldLoop(),i=Date.now(),this.conditionsCheck(e)?(this._running+=e,null!=this.storeOptions.reservoir&&(this.storeOptions.reservoir-=e),r=Math.max(this._nextRequest-i,0),this._nextRequest=i+r+this.storeOptions.minTime,{success:!0,wait:r,reservoir:this.storeOptions.reservoir}):{success:!1}}strategyIsBlock(){return 3===this.storeOptions.strategy}async __submit__(t,e){var s,i,r;if(await this.yieldLoop(),null!=this.storeOptions.maxConcurrent&&e>this.storeOptions.maxConcurrent)throw new l(`Impossible to add a job having a weight of ${e} to a limiter having a maxConcurrent setting of ${this.storeOptions.maxConcurrent}`);return i=Date.now(),r=null!=this.storeOptions.highWater&&t===this.storeOptions.highWater&&!this.check(e,i),(s=this.strategyIsBlock()&&(r||this.isBlocked(i)))&&(this._unblockTime=i+this.computePenalty(),this._nextRequest=this._unblockTime+this.storeOptions.minTime,this.instance._dropAllQueued()),{reachedHWM:r,blocked:s,strategy:this.storeOptions.strategy}}async __free__(t,e){return await this.yieldLoop(),this._running-=e,this._done+=e,this.instance._drainAll(this.computeCapacity()),{running:this._running}}};d=a;var v,f=class{constructor(t){this.status=t,this._jobs={},this.counts=this.status.map(function(){return 0})}next(t){var e,s;return s=(e=this._jobs[t])+1,null!=e&&s<this.status.length?(this.counts[e]--,this.counts[s]++,this._jobs[t]++):null!=e?(this.counts[e]--,delete this._jobs[t]):void 0}start(t){return 0,this._jobs[t]=0,this.counts[0]++}remove(t){var e;return null!=(e=this._jobs[t])&&(this.counts[e]--,delete this._jobs[t]),null!=e}jobStatus(t){var e;return null!=(e=this.status[this._jobs[t]])?e:null}statusJobs(t){var e,s,i,r;if(null!=t){if((s=this.status.indexOf(t))<0)throw new d(`status must be one of ${this.status.join(", ")}`);for(e in r=[],i=this._jobs)i[e]===s&&r.push(e);return r}return Object.keys(this._jobs)}statusCounts(){return this.counts.reduce((t,e,s)=>(t[this.status[s]]=e,t),{})}};v=e;var g,m,y,b,w,E=class{constructor(t,e){this.schedule=this.schedule.bind(this),this.name=t,this.Promise=e,this._running=0,this._queue=new v}isEmpty(){return 0===this._queue.length}async _tryToRun(){var t,e,s,i,r,n,o;if(this._running<1&&this._queue.length>0)return this._running++,({task:o,args:t,resolve:r,reject:i}=this._queue.shift()),e=await async function(){try{return n=await o(...t),function(){return r(n)}}catch(t){return s=t,function(){return i(s)}}}(),this._running--,this._tryToRun(),e()}schedule(t,...e){var s,i,r;return r=i=null,s=new this.Promise(function(t,e){return r=t,i=e}),this._queue.push({task:t,args:e,resolve:r,reject:i}),this._tryToRun(),s}},O={version:"2.19.5"},k=Object.freeze({version:"2.19.5",default:O}),x=()=>console.log("You must import the full version of Bottleneck in order to use this feature."),I=()=>console.log("You must import the full version of Bottleneck in order to use this feature.");w=r,g=n,y=x,m=I,b=(()=>console.log("You must import the full version of Bottleneck in order to use this feature."));var R,j,D=function(){class t{constructor(t={}){this.deleteKey=this.deleteKey.bind(this),this.limiterOptions=t,w.load(this.limiterOptions,this.defaults,this),this.Events=new g(this),this.instances={},this.Bottleneck=U,this._startAutoCleanup(),this.sharedConnection=null!=this.connection,null==this.connection&&("redis"===this.limiterOptions.datastore?this.connection=new y(Object.assign({},this.limiterOptions,{Events:this.Events})):"ioredis"===this.limiterOptions.datastore&&(this.connection=new m(Object.assign({},this.limiterOptions,{Events:this.Events}))))}key(t=""){var e;return null!=(e=this.instances[t])?e:(()=>{var e;return e=this.instances[t]=new this.Bottleneck(Object.assign(this.limiterOptions,{id:`${this.id}-${t}`,timeout:this.timeout,connection:this.connection})),this.Events.trigger("created",e,t),e})()}async deleteKey(t=""){var e,s;return s=this.instances[t],this.connection&&(e=await this.connection.__runCommand__(["del",...b.allKeys(`${this.id}-${t}`)])),null!=s&&(delete this.instances[t],await s.disconnect()),null!=s||e>0}limiters(){var t,e,s,i;for(t in s=[],e=this.instances)i=e[t],s.push({key:t,limiter:i});return s}keys(){return Object.keys(this.instances)}async clusterKeys(){var t,e,s,i,r,n,o,h,u;if(null==this.connection)return this.Promise.resolve(this.keys());for(n=[],t=null,u=`b_${this.id}-`.length,e="_settings".length;0!==t;)for([h,s]=await this.connection.__runCommand__(["scan",null!=t?t:0,"match",`b_${this.id}-*_settings`,"count",1e4]),t=~~h,i=0,o=s.length;i<o;i++)r=s[i],n.push(r.slice(u,-e));return n}_startAutoCleanup(){var t;return clearInterval(this.interval),"function"==typeof(t=this.interval=setInterval(async()=>{var t,e,s,i,r,n;for(e in r=Date.now(),i=[],s=this.instances){n=s[e];try{await n._store.__groupCheck__(r)?i.push(this.deleteKey(e)):i.push(void 0)}catch(e){t=e,i.push(n.Events.trigger("error",t))}}return i},this.timeout/2)).unref?t.unref():void 0}updateSettings(t={}){if(w.overwrite(t,this.defaults,this),w.overwrite(t,t,this.limiterOptions),null!=t.timeout)return this._startAutoCleanup()}disconnect(t=!0){var e;if(!this.sharedConnection)return null!=(e=this.connection)?e.disconnect(t):void 0}}return t.prototype.defaults={timeout:3e5,connection:null,Promise:Promise,id:"group-key"},t}.call(t);j=r,R=n;var C,P,T,L,S,q,A,$,B,N,F=function(){class t{constructor(t={}){this.options=t,j.load(this.options,this.defaults,this),this.Events=new R(this),this._arr=[],this._resetPromise(),this._lastFlush=Date.now()}_resetPromise(){return this._promise=new this.Promise((t,e)=>this._resolve=t)}_flush(){return clearTimeout(this._timeout),this._lastFlush=Date.now(),this._resolve(),this.Events.trigger("batch",this._arr),this._arr=[],this._resetPromise()}add(t){var e;return this._arr.push(t),e=this._promise,this._arr.length===this.maxSize?this._flush():null!=this.maxTime&&1===this._arr.length&&(this._timeout=setTimeout(()=>this._flush(),this.maxTime)),e}}return t.prototype.defaults={maxTime:null,maxSize:null,Promise:Promise},t}.call(t),M=(C=k)&&C.default||C,G=[].splice;S=10,N=r,q=u,T=_,L=p,A=(()=>console.log("You must import the full version of Bottleneck in order to use this feature.")),P=n,$=f,B=E;var U=function(){class t{constructor(e={},...s){var i,r;this._addToQueue=this._addToQueue.bind(this),this._validateOptions(e,s),N.load(e,this.instanceDefaults,this),this._queues=new q(S),this._scheduled={},this._states=new $(["RECEIVED","QUEUED","RUNNING","EXECUTING"].concat(this.trackDoneStatus?["DONE"]:[])),this._limiter=null,this.Events=new P(this),this._submitLock=new B("submit",this.Promise),this._registerLock=new B("register",this.Promise),r=N.load(e,this.storeDefaults,{}),this._store=function(){if("redis"===this.datastore||"ioredis"===this.datastore||null!=this.connection)return i=N.load(e,this.redisStoreDefaults,{}),new A(this,r,i);if("local"===this.datastore)return i=N.load(e,this.localStoreDefaults,{}),new L(this,r,i);throw new t.prototype.BottleneckError(`Invalid datastore type: ${this.datastore}`)}.call(this),this._queues.on("leftzero",()=>{var t;return null!=(t=this._store.heartbeat)&&"function"==typeof t.ref?t.ref():void 0}),this._queues.on("zero",()=>{var t;return null!=(t=this._store.heartbeat)&&"function"==typeof t.unref?t.unref():void 0})}_validateOptions(e,s){if(null==e||"object"!=typeof e||0!==s.length)throw new t.prototype.BottleneckError("Bottleneck v2 takes a single object argument. Refer to https://github.com/SGrondin/bottleneck#upgrading-to-v2 if you're upgrading from Bottleneck v1.")}ready(){return this._store.ready}clients(){return this._store.clients}channel(){return`b_${this.id}`}channel_client(){return`b_${this.id}_${this._store.clientId}`}publish(t){return this._store.__publish__(t)}disconnect(t=!0){return this._store.__disconnect__(t)}chain(t){return this._limiter=t,this}queued(t){return this._queues.queued(t)}clusterQueued(){return this._store.__queued__()}empty(){return 0===this.queued()&&this._submitLock.isEmpty()}running(){return this._store.__running__()}done(){return this._store.__done__()}jobStatus(t){return this._states.jobStatus(t)}jobs(t){return this._states.statusJobs(t)}counts(){return this._states.statusCounts()}_randomIndex(){return Math.random().toString(36).slice(2)}check(t=1){return this._store.__check__(t)}_clearGlobalState(t){return null!=this._scheduled[t]&&(clearTimeout(this._scheduled[t].expiration),delete this._scheduled[t],!0)}async _free(t,e,s,i){var r,n;try{if(({running:n}=await this._store.__free__(t,s.weight)),this.Events.trigger("debug",`Freed ${s.id}`,i),0===n&&this.empty())return this.Events.trigger("idle")}catch(t){return r=t,this.Events.trigger("error",r)}}_run(t,e,s){var i,r,n;return e.doRun(),i=this._clearGlobalState.bind(this,t),n=this._run.bind(this,t,e),r=this._free.bind(this,t,e),this._scheduled[t]={timeout:setTimeout(()=>e.doExecute(this._limiter,i,n,r),s),expiration:null!=e.options.expiration?setTimeout(function(){return e.doExpire(i,n,r)},s+e.options.expiration):void 0,job:e}}_drainOne(t){return this._registerLock.schedule(()=>{var e,s,i,r,n;return 0===this.queued()?this.Promise.resolve(null):(n=this._queues.getFirst(),({options:r,args:e}=i=n.first()),null!=t&&r.weight>t?this.Promise.resolve(null):(this.Events.trigger("debug",`Draining ${r.id}`,{args:e,options:r}),s=this._randomIndex(),this._store.__register__(s,r.weight,r.expiration).then(({success:t,wait:o,reservoir:h})=>{var u;return this.Events.trigger("debug",`Drained ${r.id}`,{success:t,args:e,options:r}),t?(n.shift(),(u=this.empty())&&this.Events.trigger("empty"),0===h&&this.Events.trigger("depleted",u),this._run(s,i,o),this.Promise.resolve(r.weight)):this.Promise.resolve(null)})))})}_drainAll(t,e=0){return this._drainOne(t).then(s=>{var i;return null!=s?(i=null!=t?t-s:t,this._drainAll(i,e+s)):this.Promise.resolve(e)}).catch(t=>this.Events.trigger("error",t))}_dropAllQueued(t){return this._queues.shiftAll(function(e){return e.doDrop({message:t})})}stop(e={}){var s,i;return e=N.load(e,this.stopDefaults),i=(t=>{var e;return e=(()=>{var e;return(e=this._states.counts)[0]+e[1]+e[2]+e[3]===t}),new this.Promise((t,s)=>e()?t():this.on("done",()=>{if(e())return this.removeAllListeners("done"),t()}))}),s=e.dropWaitingJobs?(this._run=function(t,s){return s.doDrop({message:e.dropErrorMessage})},this._drainOne=(()=>this.Promise.resolve(null)),this._registerLock.schedule(()=>this._submitLock.schedule(()=>{var t,s,r;for(t in s=this._scheduled)r=s[t],"RUNNING"===this.jobStatus(r.job.options.id)&&(clearTimeout(r.timeout),clearTimeout(r.expiration),r.job.doDrop({message:e.dropErrorMessage}));return this._dropAllQueued(e.dropErrorMessage),i(0)}))):this.schedule({priority:S-1,weight:0},()=>i(1)),this._receive=function(s){return s._reject(new t.prototype.BottleneckError(e.enqueueErrorMessage))},this.stop=(()=>this.Promise.reject(new t.prototype.BottleneckError("stop() has already been called"))),s}async _addToQueue(e){var s,i,r,n,o,h,u;({args:s,options:n}=e);try{({reachedHWM:o,blocked:i,strategy:u}=await this._store.__submit__(this.queued(),n.weight))}catch(t){return r=t,this.Events.trigger("debug",`Could not queue ${n.id}`,{args:s,options:n,error:r}),e.doDrop({error:r}),!1}return i?(e.doDrop(),!0):o&&(null!=(h=u===t.prototype.strategy.LEAK?this._queues.shiftLastFrom(n.priority):u===t.prototype.strategy.OVERFLOW_PRIORITY?this._queues.shiftLastFrom(n.priority+1):u===t.prototype.strategy.OVERFLOW?e:void 0)&&h.doDrop(),null==h||u===t.prototype.strategy.OVERFLOW)?(null==h&&e.doDrop(),o):(e.doQueue(o,i),this._queues.push(e),await this._drainAll(),o)}_receive(e){return null!=this._states.jobStatus(e.options.id)?(e._reject(new t.prototype.BottleneckError(`A job with the same id already exists (id=${e.options.id})`)),!1):(e.doReceive(),this._submitLock.schedule(this._addToQueue,e))}submit(...t){var e,s,i,r,n,o;return"function"==typeof t[0]?(n=t,[s,...t]=n,[e]=G.call(t,-1),r=N.load({},this.jobDefaults)):(o=t,[r,s,...t]=o,[e]=G.call(t,-1),r=N.load(r,this.jobDefaults)),(i=new T((...t)=>new this.Promise(function(e,i){return s(...t,function(...t){return(null!=t[0]?i:e)(t)})}),t,r,this.jobDefaults,this.rejectOnDrop,this.Events,this._states,this.Promise)).promise.then(function(t){return"function"==typeof e?e(...t):void 0}).catch(function(t){return Array.isArray(t)?"function"==typeof e?e(...t):void 0:"function"==typeof e?e(t):void 0}),this._receive(i)}schedule(...t){var e,s,i;return"function"==typeof t[0]?([i,...t]=t,s={}):[s,i,...t]=t,e=new T(i,t,s,this.jobDefaults,this.rejectOnDrop,this.Events,this._states,this.Promise),this._receive(e),e.promise}wrap(t){var e,s;return e=this.schedule.bind(this),(s=function(...s){return e(t.bind(this),...s)}).withOptions=function(s,...i){return e(s,t,...i)},s}async updateSettings(t={}){return await this._store.__updateSettings__(N.overwrite(t,this.storeDefaults)),N.overwrite(t,this.instanceDefaults,this),this}currentReservoir(){return this._store.__currentReservoir__()}incrementReservoir(t=0){return this._store.__incrementReservoir__(t)}}return t.default=t,t.Events=P,t.version=t.prototype.version=M.version,t.strategy=t.prototype.strategy={LEAK:1,OVERFLOW:2,OVERFLOW_PRIORITY:4,BLOCK:3},t.BottleneckError=t.prototype.BottleneckError=a,t.Group=t.prototype.Group=D,t.RedisConnection=t.prototype.RedisConnection=x,t.IORedisConnection=t.prototype.IORedisConnection=I,t.Batcher=t.prototype.Batcher=F,t.prototype.jobDefaults={priority:5,weight:1,expiration:null,id:"<no-id>"},t.prototype.storeDefaults={maxConcurrent:null,minTime:0,highWater:null,strategy:t.prototype.strategy.LEAK,penalty:null,reservoir:null,reservoirRefreshInterval:null,reservoirRefreshAmount:null,reservoirIncreaseInterval:null,reservoirIncreaseAmount:null,reservoirIncreaseMaximum:null},t.prototype.localStoreDefaults={Promise:Promise,timeout:null,heartbeatInterval:250},t.prototype.redisStoreDefaults={Promise:Promise,timeout:null,heartbeatInterval:5e3,clientTimeout:1e4,Redis:null,clientOptions:{},clusterNodes:null,clearDatastore:!1,connection:null},t.prototype.instanceDefaults={datastore:"local",connection:null,id:"<no-id>",rejectOnDrop:!0,trackDoneStatus:!1,Promise:Promise},t.prototype.stopDefaults={enqueueErrorMessage:"This limiter has been stopped and cannot accept new jobs.",dropWaitingJobs:!0,dropErrorMessage:"This limiter has been stopped."},t}.call(t);return U});