var Rt=Object.defineProperty;var Tt=Object.getOwnPropertyDescriptor;var u=(r,t,e,s)=>{for(var i=s>1?void 0:s?Tt(t,e):t,o=r.length-1,n;o>=0;o--)(n=r[o])&&(i=(s?n(t,e,i):n(i))||i);return s&&i&&Rt(t,e,i),i};var q=globalThis,z=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ht=new WeakMap,k=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(z&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ht.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ht.set(e,t))}return t}toString(){return this.cssText}},ct=r=>new k(typeof r=="string"?r:r+"",void 0,G),R=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new k(e,r,G)},lt=(r,t)=>{if(z)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=q.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},Y=z?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return ct(e)})(r):r;var{is:Ot,defineProperty:Nt,getOwnPropertyDescriptor:Lt,getOwnPropertyNames:jt,getOwnPropertySymbols:Dt,getPrototypeOf:Ht}=Object,W=globalThis,dt=W.trustedTypes,It=dt?dt.emptyScript:"",qt=W.reactiveElementPolyfillSupport,T=(r,t)=>r,O={toAttribute(r,t){switch(t){case Boolean:r=r?It:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},B=(r,t)=>!Ot(r,t),pt={attribute:!0,type:String,converter:O,reflect:!1,useDefault:!1,hasChanged:B};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;var $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=pt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Nt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=Lt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let h=i?.call(this);o?.call(this,n),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??pt}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let t=Ht(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let e=this.properties,s=[...jt(e),...Dt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(Y(i))}else t!==void 0&&e.push(Y(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:O).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:O;this._$Em=i;let h=n.fromAttribute(e,o.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??B)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,h=this[i];n!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,o,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[T("elementProperties")]=new Map,$[T("finalized")]=new Map,qt?.({ReactiveElement:$}),(W.reactiveElementVersions??=[]).push("2.1.2");var st=globalThis,ut=r=>r,V=st.trustedTypes,mt=V?V.createPolicy("lit-html",{createHTML:r=>r}):void 0,bt="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,_t="?"+_,zt=`<${_t}>`,x=document,L=()=>x.createComment(""),j=r=>r===null||typeof r!="object"&&typeof r!="function",it=Array.isArray,Wt=r=>it(r)||typeof r?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ft=/-->/g,gt=/>/g,A=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),vt=/'/g,yt=/"/g,At=/^(?:script|style|textarea|title)$/i,rt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),g=rt(1),ie=rt(2),re=rt(3),S=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),$t=new WeakMap,w=x.createTreeWalker(x,129);function wt(r,t){if(!it(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return mt!==void 0?mt.createHTML(t):t}var Bt=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=N;for(let h=0;h<e;h++){let a=r[h],d,p,c=-1,y=0;for(;y<a.length&&(n.lastIndex=y,p=n.exec(a),p!==null);)y=n.lastIndex,n===N?p[1]==="!--"?n=ft:p[1]!==void 0?n=gt:p[2]!==void 0?(At.test(p[2])&&(i=RegExp("</"+p[2],"g")),n=A):p[3]!==void 0&&(n=A):n===A?p[0]===">"?(n=i??N,c=-1):p[1]===void 0?c=-2:(c=n.lastIndex-p[2].length,d=p[1],n=p[3]===void 0?A:p[3]==='"'?yt:vt):n===yt||n===vt?n=A:n===ft||n===gt?n=N:(n=A,i=void 0);let b=n===A&&r[h+1].startsWith("/>")?" ":"";o+=n===N?a+zt:c>=0?(s.push(d),a.slice(0,c)+bt+a.slice(c)+_+b):a+_+(c===-2?h:b)}return[wt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},D=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,h=t.length-1,a=this.parts,[d,p]=Bt(t,e);if(this.el=r.createElement(d,s),w.currentNode=this.el.content,e===2||e===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(i=w.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let c of i.getAttributeNames())if(c.endsWith(bt)){let y=p[n++],b=i.getAttribute(c).split(_),I=/([.?@])?(.*)/.exec(y);a.push({type:1,index:o,name:I[2],strings:b,ctor:I[1]==="."?Z:I[1]==="?"?Q:I[1]==="@"?tt:P}),i.removeAttribute(c)}else c.startsWith(_)&&(a.push({type:6,index:o}),i.removeAttribute(c));if(At.test(i.tagName)){let c=i.textContent.split(_),y=c.length-1;if(y>0){i.textContent=V?V.emptyScript:"";for(let b=0;b<y;b++)i.append(c[b],L()),w.nextNode(),a.push({type:2,index:++o});i.append(c[y],L())}}}else if(i.nodeType===8)if(i.data===_t)a.push({type:2,index:o});else{let c=-1;for(;(c=i.data.indexOf(_,c+1))!==-1;)a.push({type:7,index:o}),c+=_.length-1}o++}}static createElement(t,e){let s=x.createElement("template");return s.innerHTML=t,s}};function C(r,t,e=r,s){if(t===S)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=j(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=C(r,i._$AS(r,t.values),i,s)),t}var X=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??x).importNode(e,!0);w.currentNode=i;let o=w.nextNode(),n=0,h=0,a=s[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new H(o,o.nextSibling,this,t):a.type===1?d=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(d=new et(o,this,t)),this._$AV.push(d),a=s[++h]}n!==a?.index&&(o=w.nextNode(),n++)}return w.currentNode=x,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},H=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=C(this,t,e),j(t)?t===l||t==null||t===""?(this._$AH!==l&&this._$AR(),this._$AH=l):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Wt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==l&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(x.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=D.createElement(wt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new X(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=$t.get(t.strings);return e===void 0&&$t.set(t.strings,e=new D(t)),e}k(t){it(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(L()),this.O(L()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=ut(t).nextSibling;ut(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=l,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=l}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=C(this,t,e,0),n=!j(t)||t!==this._$AH&&t!==S,n&&(this._$AH=t);else{let h=t,a,d;for(t=o[0],a=0;a<o.length-1;a++)d=C(this,h[s+a],e,a),d===S&&(d=this._$AH[a]),n||=!j(d)||d!==this._$AH[a],d===l?t=l:t!==l&&(t+=(d??"")+o[a+1]),this._$AH[a]=d}n&&!i&&this.j(t)}j(t){t===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Z=class extends P{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===l?void 0:t}},Q=class extends P{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==l)}},tt=class extends P{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=C(this,t,e,0)??l)===S)return;let s=this._$AH,i=t===l&&s!==l||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==l&&(s===l||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},et=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}};var Vt=st.litHtmlPolyfillSupport;Vt?.(D,H),(st.litHtmlVersions??=[]).push("3.3.3");var xt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new H(t.insertBefore(L(),o),o,void 0,e??{})}return i._$AI(r),i};var ot=globalThis,v=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};v._$litElement$=!0,v.finalized=!0,ot.litElementHydrateSupport?.({LitElement:v});var Ft=ot.litElementPolyfillSupport;Ft?.({LitElement:v});(ot.litElementVersions??=[]).push("4.2.2");var F=r=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};var Kt={attribute:!0,type:String,converter:O,reflect:!1,hasChanged:B},Gt=(r=Kt,t,e)=>{let{kind:s,metadata:i}=e,o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),o.set(e.name,r),s==="accessor"){let{name:n}=e;return{set(h){let a=t.get.call(this);t.set.call(this,h),this.requestUpdate(n,a,r,!0,h)},init(h){return h!==void 0&&this.C(n,void 0,r,h),h}}}if(s==="setter"){let{name:n}=e;return function(h){let a=this[n];t.call(this,h),this.requestUpdate(n,a,r,!0,h)}}throw Error("Unsupported decorator location: "+s)};function U(r){return(t,e)=>typeof e=="object"?Gt(r,t,e):((s,i,o)=>{let n=i.hasOwnProperty(o);return i.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(i,o):void 0})(r,t,e)}function f(r){return U({...r,state:!0,attribute:!1})}async function St(r,t,e){let s=new FormData;s.append("file",t,"recording.wav"),s.append("duration",String(e));let i=await fetch("/api/hass_broadcast/upload",{method:"POST",body:s,headers:{Authorization:`Bearer ${r.auth.data.access_token}`}});if(!i.ok)throw new Error(`Upload failed (${i.status})`);return(await i.json()).message_id}async function Et(r){return(await r.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function Ct(r,t){return(await r.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:t})).deleted}async function nt(r,t,e,s){await r.callService("hass_broadcast","send",{message_id:t,targets:e,mode:s})}var Pt="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function Ut(r){return r?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${r?.message??r?.name??"unknown error"}`}function Mt(r,t){let e=r.length*2,s=new ArrayBuffer(44+e),i=new DataView(s),o=(n,h)=>{for(let a=0;a<h.length;a++)i.setUint8(n+a,h.charCodeAt(a))};return o(0,"RIFF"),i.setUint32(4,36+e,!0),o(8,"WAVE"),o(12,"fmt "),i.setUint32(16,16,!0),i.setUint16(20,1,!0),i.setUint16(22,1,!0),i.setUint32(24,t,!0),i.setUint32(28,t*2,!0),i.setUint16(32,2,!0),i.setUint16(34,16,!0),o(36,"data"),i.setUint32(40,e,!0),new Int16Array(s,44).set(r),new Blob([s],{type:"audio/wav"})}var kt=16e3,Yt="/api/hass_broadcast/static/recorder-worklet.js",M=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(t){this.levelCallback=t}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:kt}),await this.context.audioWorklet.addModule(Yt);let t=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=e=>{this.chunks.push(e.data),this.levelCallback&&this.levelCallback(Jt(e.data))},t.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(t){throw await this.release(),t}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let t=this.context?.sampleRate??kt,e=this.chunks;await this.release();let s=e.reduce((n,h)=>n+h.length,0),i=new Int16Array(s),o=0;for(let n of e)i.set(n,o),o+=n.length;return{blob:Mt(i,t),duration:s/t}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(t=>t.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function Jt(r){let t=0;for(let e of r)t=Math.max(t,Math.abs(e));return t/32768}function at(r){if(r===""||r===null||r===void 0)return 60;let t=Number(r);return isNaN(t)?60:Math.min(300,Math.max(5,t))}var E=class extends v{constructor(){super(...arguments);this.config={type:""}}setConfig(e){this.config=e}emit(e){this.config={...this.config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}render(){return g`
      <div class="field">
        <label for="mode">Playback mode</label>
        <select
          id="mode"
          .value=${this.config.mode??"plain"}
          @change=${e=>this.emit({mode:e.target.value})}
        >
          <option value="plain">Plain — just play the message</option>
          <option value="restore">Restore — put back volume afterwards</option>
          <option value="chime">Chime — attention tone, then the message</option>
        </select>
        <div class="hint">
          Google Cast has no native announce support, so Restore cannot reliably
          resume an interrupted Spotify or YouTube session. It does restore volume.
        </div>
      </div>

      <div class="field">
        <label for="max">Maximum recording length (seconds)</label>
        <input
          id="max"
          type="number"
          min="5"
          max="300"
          .value=${String(this.config.max_duration??60)}
          @change=${e=>this.emit({max_duration:at(e.target.value)})}
        />
      </div>

      <div class="field">
        <label>
          <input
            type="checkbox"
            .checked=${this.config.show_history!==!1}
            @change=${e=>this.emit({show_history:e.target.checked})}
          />
          Show recent recordings
        </label>
      </div>
    `}};E.styles=R`
    .field { display: block; margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    .hint { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
  `,u([U({attribute:!1})],E.prototype,"hass",2),u([f()],E.prototype,"config",2),E=u([F("hass-broadcast-card-editor")],E);var Xt=512,m=class extends v{constructor(){super(...arguments);this.config={type:""};this.phase="idle";this.level=0;this.elapsed=0;this.selected=[];this.history=[];this.recorder=new M;this.duration=0;this.busy=!1}setConfig(e){this.config=e,this.selected=e.targets?[...e.targets]:[]}getCardSize(){return this.config.show_history===!1?3:6}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain"}}connectedCallback(){super.connectedCallback(),M.isSupported()||(this.error=Pt),this.refreshHistory()}disconnectedCallback(){super.disconnectedCallback(),this.clearTimer(),this.previewUrl&&URL.revokeObjectURL(this.previewUrl),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1}))}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}async refreshHistory(){if(!(!this.hass||this.config.show_history===!1))try{this.history=await Et(this.hass)}catch{this.history=[]}}get players(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("media_player.")).filter(e=>(this.hass.states[e].attributes.supported_features&Xt)!==0).sort():[]}async startRecording(){if(this.busy||this.phase==="recording")return;this.busy=!0,this.error=void 0;try{this.recorder.onLevel(s=>{this.level=s}),await this.recorder.start()}catch(s){this.error=Ut(s);return}finally{this.busy=!1}this.phase="recording",this.elapsed=0;let e=at(this.config.max_duration);this.timer=window.setInterval(()=>{this.elapsed+=1,this.elapsed>=e&&this.stopRecording()},1e3)}async stopRecording(){if(!(this.busy||this.phase!=="recording")){this.busy=!0,this.clearTimer();try{let{blob:e,duration:s}=await this.recorder.stop();this.blob=e,this.duration=s,this.previewUrl&&URL.revokeObjectURL(this.previewUrl),this.previewUrl=URL.createObjectURL(e),this.level=0,this.phase="preview"}catch(e){this.error=`Could not finish recording: ${e?.message??e}`,this.phase="idle"}finally{this.busy=!1}}}discard(){this.blob=void 0,this.previewUrl&&(URL.revokeObjectURL(this.previewUrl),this.previewUrl=void 0),this.phase="idle"}toggleTarget(e){this.selected=this.selected.includes(e)?this.selected.filter(s=>s!==e):[...this.selected,e]}async send(){if(!this.blob||this.selected.length===0){this.error="Pick at least one speaker first.";return}this.phase="sending",this.error=void 0;try{let e=await St(this.hass,this.blob,this.duration);await nt(this.hass,e,this.selected,this.config.mode??"plain"),this.discard(),await this.refreshHistory()}catch(e){this.error=`Could not send: ${e?.message??e}`,this.phase="preview"}}async replay(e){if(this.selected.length===0){this.error="Pick at least one speaker first.";return}try{await nt(this.hass,e,this.selected,this.config.mode??"plain")}catch(s){this.error=`Could not play: ${s?.message??s}`}}async deleteRecording(e){try{await Ct(this.hass,e)&&await this.refreshHistory()}catch(s){s?.code==="not_authorized"?this.error="You do not have permission to delete this recording.":this.error=`Could not delete: ${s?.message??s}`}}render(){let e=this.phase==="recording";return g`
      <ha-card header="Voice Broadcast">
        ${this.error?g`<div class="error">${this.error}</div>`:l}

        <div class="row">
          <button
            class="record"
            ?disabled=${!M.isSupported()||this.phase==="sending"}
            @click=${e?this.stopRecording:this.startRecording}
            title=${e?"Stop":"Record"}
          >
            ${e?"\u25A0":"\u25CF"}
          </button>
          <div class="meter"><div style="width:${Math.round(this.level*100)}%"></div></div>
          <span>${e?`${this.elapsed}s`:""}</span>
        </div>

        ${this.phase==="preview"&&this.previewUrl?g`
              <audio controls src=${this.previewUrl}></audio>
              <div class="row">
                <button @click=${this.send}>Send</button>
                <button @click=${this.discard}>Discard</button>
              </div>
            `:l}

        <div class="targets">
          ${this.players.map(s=>g`
              <button
                class="chip"
                data-on=${this.selected.includes(s)}
                @click=${()=>this.toggleTarget(s)}
              >
                ${this.hass.states[s].attributes.friendly_name??s}
              </button>
            `)}
        </div>

        ${this.config.show_history===!1?l:g`
              <div class="history">
                ${this.history.map(s=>g`
                    <div class="history-row">
                      <span>${new Date(s.created).toLocaleString()}</span>
                      <button @click=${()=>this.replay(s.id)}>Play</button>
                      ${s.can_delete?g`<button @click=${()=>this.deleteRecording(s.id)}>Delete</button>`:l}
                    </div>
                  `)}
              </div>
            `}
      </ha-card>
    `}};m.styles=R`
    ha-card { padding: 16px; }
    .row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .record { border: none; border-radius: 50%; width: 56px; height: 56px;
      background: var(--error-color, #db4437); color: #fff; cursor: pointer; font-size: 22px; }
    .record[disabled] { opacity: 0.5; cursor: not-allowed; }
    .meter { flex: 1; height: 6px; background: var(--divider-color, #ddd); border-radius: 3px; overflow: hidden; }
    .meter > div { height: 100%; background: var(--primary-color); transition: width 80ms linear; }
    .error { color: var(--error-color, #db4437); margin-bottom: 12px; }
    .targets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .chip { padding: 6px 12px; border-radius: 16px; cursor: pointer;
      border: 1px solid var(--divider-color, #ddd); background: none; color: var(--primary-text-color); }
    .chip[data-on="true"] { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .history { border-top: 1px solid var(--divider-color, #ddd); margin-top: 12px; padding-top: 8px; }
    .history-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .history-row span { flex: 1; font-size: 0.9em; }
    audio { width: 100%; margin-bottom: 12px; }
  `,u([U({attribute:!1})],m.prototype,"hass",2),u([f()],m.prototype,"config",2),u([f()],m.prototype,"phase",2),u([f()],m.prototype,"level",2),u([f()],m.prototype,"elapsed",2),u([f()],m.prototype,"error",2),u([f()],m.prototype,"selected",2),u([f()],m.prototype,"history",2),u([f()],m.prototype,"previewUrl",2),m=u([F("hass-broadcast-card")],m);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{m as HassBroadcastCard};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
