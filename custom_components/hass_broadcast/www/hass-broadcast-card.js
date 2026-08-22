var rt=Object.defineProperty;var ot=Object.getOwnPropertyDescriptor;var f=(s,e,t,i)=>{for(var r=i>1?void 0:i?ot(e,t):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(r=(i?n(e,t,r):n(r))||r);return i&&r&&rt(e,t,r),r};var q=globalThis,W=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,te=Symbol(),be=new WeakMap,T=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(W&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=be.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&be.set(t,e))}return e}toString(){return this.cssText}},ve=s=>new T(typeof s=="string"?s:s+"",void 0,te),R=(s,...e)=>{let t=s.length===1?s[0]:e.reduce((i,r,o)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[o+1],s[0]);return new T(t,s,te)},$e=(s,e)=>{if(W)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),r=q.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},ie=W?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return ve(t)})(s):s;var{is:nt,defineProperty:at,getOwnPropertyDescriptor:lt,getOwnPropertyNames:dt,getOwnPropertySymbols:ct,getPrototypeOf:ht}=Object,V=globalThis,xe=V.trustedTypes,pt=xe?xe.emptyScript:"",ut=V.reactiveElementPolyfillSupport,U=(s,e)=>s,O={toAttribute(s,e){switch(e){case Boolean:s=s?pt:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},F=(s,e)=>!nt(s,e),_e={attribute:!0,type:String,converter:O,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_e){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&at(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){let{get:r,set:o}=lt(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){let a=r?.call(this);o?.call(this,n),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_e}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;let e=ht(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){let t=this.properties,i=[...dt(t),...ct(t)];for(let r of i)this.createProperty(r,t[r])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let r of i)t.unshift(ie(r))}else e!==void 0&&t.push(ie(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $e(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){let o=(i.converter?.toAttribute!==void 0?i.converter:O).toAttribute(t,i.type);this._$Em=e,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(e,t){let i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let o=i.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:O;this._$Em=r;let a=n.fromAttribute(t,o.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,i,r=!1,o){if(e!==void 0){let n=this.constructor;if(r===!1&&(o=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??F)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:o},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[r,o]of i){let{wrapped:n}=o,a=this[r];n!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,o,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[U("elementProperties")]=new Map,v[U("finalized")]=new Map,ut?.({ReactiveElement:v}),(V.reactiveElementVersions??=[]).push("2.1.2");var de=globalThis,we=s=>s,Y=de.trustedTypes,Ae=Y?Y.createPolicy("lit-html",{createHTML:s=>s}):void 0,Me="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,Te="?"+x,ft=`<${Te}>`,A=document,L=()=>A.createComment(""),D=s=>s===null||typeof s!="object"&&typeof s!="function",ce=Array.isArray,gt=s=>ce(s)||typeof s?.[Symbol.iterator]=="function",se=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Se=/>/g,_=RegExp(`>|${se}(?:([^\\s"'>=/]+)(${se}*=${se}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ee=/'/g,Pe=/"/g,Re=/^(?:script|style|textarea|title)$/i,he=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),d=he(1),K=he(2),zt=he(3),k=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Ce=new WeakMap,w=A.createTreeWalker(A,129);function Ue(s,e){if(!ce(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ae!==void 0?Ae.createHTML(e):e}var mt=(s,e)=>{let t=s.length-1,i=[],r,o=e===2?"<svg>":e===3?"<math>":"",n=N;for(let a=0;a<t;a++){let l=s[a],p,u,c=-1,b=0;for(;b<l.length&&(n.lastIndex=b,u=n.exec(l),u!==null);)b=n.lastIndex,n===N?u[1]==="!--"?n=ke:u[1]!==void 0?n=Se:u[2]!==void 0?(Re.test(u[2])&&(r=RegExp("</"+u[2],"g")),n=_):u[3]!==void 0&&(n=_):n===_?u[0]===">"?(n=r??N,c=-1):u[1]===void 0?c=-2:(c=n.lastIndex-u[2].length,p=u[1],n=u[3]===void 0?_:u[3]==='"'?Pe:Ee):n===Pe||n===Ee?n=_:n===ke||n===Se?n=N:(n=_,r=void 0);let $=n===_&&s[a+1].startsWith("/>")?" ":"";o+=n===N?l+ft:c>=0?(i.push(p),l.slice(0,c)+Me+l.slice(c)+x+$):l+x+(c===-2?a:$)}return[Ue(s,o+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},I=class s{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let o=0,n=0,a=e.length-1,l=this.parts,[p,u]=mt(e,t);if(this.el=s.createElement(p,i),w.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(r=w.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let c of r.getAttributeNames())if(c.endsWith(Me)){let b=u[n++],$=r.getAttribute(c).split(x),B=/([.?@])?(.*)/.exec(b);l.push({type:1,index:o,name:B[2],strings:$,ctor:B[1]==="."?oe:B[1]==="?"?ne:B[1]==="@"?ae:C}),r.removeAttribute(c)}else c.startsWith(x)&&(l.push({type:6,index:o}),r.removeAttribute(c));if(Re.test(r.tagName)){let c=r.textContent.split(x),b=c.length-1;if(b>0){r.textContent=Y?Y.emptyScript:"";for(let $=0;$<b;$++)r.append(c[$],L()),w.nextNode(),l.push({type:2,index:++o});r.append(c[b],L())}}}else if(r.nodeType===8)if(r.data===Te)l.push({type:2,index:o});else{let c=-1;for(;(c=r.data.indexOf(x,c+1))!==-1;)l.push({type:7,index:o}),c+=x.length-1}o++}}static createElement(e,t){let i=A.createElement("template");return i.innerHTML=e,i}};function P(s,e,t=s,i){if(e===k)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl,o=D(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=P(s,r._$AS(s,e.values),r,i)),e}var re=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??A).importNode(t,!0);w.currentNode=r;let o=w.nextNode(),n=0,a=0,l=i[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new j(o,o.nextSibling,this,e):l.type===1?p=new l.ctor(o,l.name,l.strings,this,e):l.type===6&&(p=new le(o,this,e)),this._$AV.push(p),l=i[++a]}n!==l?.index&&(o=w.nextNode(),n++)}return w.currentNode=A,r}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},j=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),D(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==k&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):gt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=I.createElement(Ue(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{let o=new re(r,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=Ce.get(e.strings);return t===void 0&&Ce.set(e.strings,t=new I(e)),t}k(e){ce(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,r=0;for(let o of e)r===t.length?t.push(i=new s(this.O(L()),this.O(L()),this,this.options)):i=t[r],i._$AI(o),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=we(e).nextSibling;we(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},C=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(e,t=this,i,r){let o=this.strings,n=!1;if(o===void 0)e=P(this,e,t,0),n=!D(e)||e!==this._$AH&&e!==k,n&&(this._$AH=e);else{let a=e,l,p;for(e=o[0],l=0;l<o.length-1;l++)p=P(this,a[i+l],t,l),p===k&&(p=this._$AH[l]),n||=!D(p)||p!==this._$AH[l],p===h?e=h:e!==h&&(e+=(p??"")+o[l+1]),this._$AH[l]=p}n&&!r&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},oe=class extends C{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},ne=class extends C{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},ae=class extends C{constructor(e,t,i,r,o){super(e,t,i,r,o),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??h)===k)return;let i=this._$AH,r=e===h&&i!==h||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==h&&(i===h||r);r&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},le=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}};var yt=de.litHtmlPolyfillSupport;yt?.(I,j),(de.litHtmlVersions??=[]).push("3.3.3");var Oe=(s,e,t)=>{let i=t?.renderBefore??e,r=i._$litPart$;if(r===void 0){let o=t?.renderBefore??null;i._$litPart$=r=new j(e.insertBefore(L(),o),o,void 0,t??{})}return r._$AI(s),r};var pe=globalThis,y=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return k}};y._$litElement$=!0,y.finalized=!0,pe.litElementHydrateSupport?.({LitElement:y});var bt=pe.litElementPolyfillSupport;bt?.({LitElement:y});(pe.litElementVersions??=[]).push("4.2.2");var G=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};var vt={attribute:!0,type:String,converter:O,reflect:!1,hasChanged:F},$t=(s=vt,e,t)=>{let{kind:i,metadata:r}=t,o=globalThis.litPropertyMetadata.get(r);if(o===void 0&&globalThis.litPropertyMetadata.set(r,o=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),o.set(t.name,s),i==="accessor"){let{name:n}=t;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,l,s,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,s,a),a}}}if(i==="setter"){let{name:n}=t;return function(a){let l=this[n];e.call(this,a),this.requestUpdate(n,l,s,!0,a)}}throw Error("Unsupported decorator location: "+i)};function M(s){return(e,t)=>typeof t=="object"?$t(s,e,t):((i,r,o)=>{let n=r.hasOwnProperty(o);return r.constructor.createProperty(o,i),n?Object.getOwnPropertyDescriptor(r,o):void 0})(s,e,t)}function m(s){return M({...s,state:!0,attribute:!1})}async function Ne(s,e,t){let i=new FormData;i.append("file",e,"recording.wav"),i.append("duration",String(t));let r=await fetch("/api/hass_broadcast/upload",{method:"POST",body:i,headers:{Authorization:`Bearer ${s.auth.data.access_token}`}});if(!r.ok)throw new Error(`Upload failed (${r.status})`);return(await r.json()).message_id}async function Le(s){return(await s.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function De(s,e){return(await s.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function Ie(s,e,t,i){let o=(await s.callService("hass_broadcast","send",{message_id:e,targets:t,mode:i},void 0,void 0,!0))?.response?.failed;return{failed:Array.isArray(o)?o:[]}}var je="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function ze(s){return s?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${s?.message??s?.name??"unknown error"}`}function He(s,e){let t=s.length*2,i=new ArrayBuffer(44+t),r=new DataView(i),o=(n,a)=>{for(let l=0;l<a.length;l++)r.setUint8(n+l,a.charCodeAt(l))};return o(0,"RIFF"),r.setUint32(4,36+t,!0),o(8,"WAVE"),o(12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,e,!0),r.setUint32(28,e*2,!0),r.setUint16(32,2,!0),r.setUint16(34,16,!0),o(36,"data"),r.setUint32(40,t,!0),new Int16Array(i,44).set(s),new Blob([i],{type:"audio/wav"})}var Be=16e3,xt="/api/hass_broadcast/static/recorder-worklet.js",S=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:Be}),await this.context.audioWorklet.addModule(xt);let e=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=t=>{this.chunks.push(t.data),this.levelCallback&&this.levelCallback(_t(t.data))},e.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(e){throw await this.release(),e}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let e=this.context?.sampleRate??Be,t=this.chunks;await this.release();let i=t.reduce((n,a)=>n+a.length,0),r=new Int16Array(i),o=0;for(let n of t)r.set(n,o),o+=n.length;return{blob:He(r,e),duration:i/e}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function _t(s){let e=0;for(let t of s)e=Math.max(e,Math.abs(t));return e/32768}function X(s){return s?.states?Object.keys(s.states).filter(e=>e.startsWith("media_player.")).filter(e=>(s.states[e].attributes.supported_features&512)!==0).sort():[]}function qe(s,e,t){let i=e?.length?[...new Set(e)]:s;if(!t?.length)return i;let r=new Set(t);return i.filter(o=>!r.has(o))}function We(s,e,t){let i=e?.length?new Set(e):void 0,r=new Set(t??[]);return s.filter(o=>(i===void 0||i.has(o))&&!r.has(o))}function wt(s,e){let t=n=>s?.states?.[n]?.attributes?.friendly_name??n,i=X(s),r=new Set(i),o=[...new Set([...e.show_players??[],...e.hide_players??[]])].filter(n=>!r.has(n)).sort();return[...i,...o].map(n=>({entityId:n,name:t(n),available:r.has(n)}))}var Ve=3;function At(s,e,t){if(!s?.length)return t;let i=s.map(n=>e.find(a=>a.entityId===n)?.name??n),r=i.slice(0,Ve).join(", "),o=i.length-Ve;return o>0?`${r} +${o} more`:r}function kt(s,e,t){let i=s??[];if(t)return i.includes(e)?i:[...i,e];let r=i.filter(o=>o!==e);return r.length?r:void 0}function ue(s){if(s===""||s===null||s===void 0)return 60;let e=Number(s);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var E=class extends y{constructor(){super(...arguments);this.config={type:""}}setConfig(t){this.config=t}emit(t){this.config={...this.config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}get currentRecordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}setRecordMode(t){this.emit({record_mode:t})}playerSection(t,i,r,o){let n=this.config[t]??[];return d`
      <details class="players">
        <summary>
          ${i} — ${At(n,o,r)}
        </summary>
        ${o.length===0?d`<div class="hint">No media players found.</div>`:this.playerList(t,o)}
      </details>
    `}playerList(t,i){let r=this.config[t]??[];return d`
      <div class="rows">
        ${i.map(o=>d`
            <label>
              <input
                type="checkbox"
                .checked=${r.includes(o.entityId)}
                @change=${n=>this.emit({[t]:kt(this.config[t],o.entityId,n.target.checked)})}
              />
              <span class=${o.available?"":"missing"}>
                ${o.name}${o.available?"":" (not available)"}
              </span>
            </label>
          `)}
      </div>
    `}render(){let t=wt(this.hass,this.config);return d`
      <div class="field">
        <label for="title">Card name</label>
        <input
          id="title"
          type="text"
          placeholder="Voice Broadcast"
          .value=${this.config.title??""}
          @change=${i=>this.emit({title:i.target.value.trim()||void 0})}
        />
      </div>

      <div class="field">
        <label>Recording</label>
        <div class="segmented">
          ${[["push_to_talk","Push to talk"],["start_stop","Tap to start and stop"]].map(([i,r])=>d`
              <button
                type="button"
                data-on=${this.currentRecordMode===i}
                @click=${()=>this.setRecordMode(i)}
              >
                ${r}
              </button>
            `)}
        </div>
        <div class="hint">
          Push to talk records only while the button is held.
        </div>
      </div>

      <div class="field">
        <label for="player-list">Speaker list style</label>
        <select
          id="player-list"
          .value=${this.config.player_list??"rows"}
          @change=${i=>this.emit({player_list:i.target.value})}
        >
          <option value="rows">List — one row per speaker</option>
          <option value="chips">Chips — compact pills</option>
          <option value="dropdown">Dropdown — a single summary line</option>
        </select>
      </div>

      <div class="field">
        <label for="mode">Playback mode</label>
        <select
          id="mode"
          .value=${this.config.mode??"plain"}
          @change=${i=>this.emit({mode:i.target.value})}
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
        ${this.playerSection("show_players","Players to show","every player",t)}
        <div class="hint">
          With nothing selected, the card offers every media player that
          supports playback.
        </div>
      </div>

      <div class="field">
        ${this.playerSection("hide_players","Players to hide","none",t)}
        <div class="hint">Removed after the list above.</div>
      </div>

      <div class="field">
        <label for="max">Maximum recording length (seconds)</label>
        <input
          id="max"
          type="number"
          min="5"
          max="300"
          .value=${String(this.config.max_duration??60)}
          @change=${i=>this.emit({max_duration:ue(i.target.value)})}
        />
      </div>

      <div class="field">
        <label>
          <input
            type="checkbox"
            .checked=${this.config.show_history!==!1}
            @change=${i=>this.emit({show_history:i.target.checked})}
          />
          Show recent recordings
        </label>
      </div>
    `}};E.styles=R`
    .field { display: block; margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    .hint { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
    input[type="text"], input[type="number"], select { width: 100%; box-sizing: border-box;
      padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color, #ddd);
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      font: inherit; }
    .players { border: 1px solid var(--divider-color, #ddd); border-radius: 4px;
      padding: 8px; }
    summary { cursor: pointer; font-weight: 500; }
    .rows { max-height: 220px; overflow-y: auto; margin-top: 8px;
      border-top: 1px solid var(--divider-color, #ddd); padding-top: 4px; }
    .players label { display: flex; align-items: center; gap: 8px; font-weight: normal;
      margin: 0; padding: 4px 0; }
    .missing { color: var(--secondary-text-color); }
    .segmented { display: flex; gap: 6px; }
    .segmented button { flex: 1; padding: 8px; font: inherit; cursor: pointer;
      border: 1px solid var(--divider-color, #ddd); border-radius: 6px;
      background: none; color: var(--primary-text-color); }
    .segmented button[data-on="true"] { background: var(--primary-color);
      color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
  `,f([M({attribute:!1})],E.prototype,"hass",2),f([m()],E.prototype,"config",2),E=f([G("hass-broadcast-card-editor")],E);function Fe(s){return Number.isFinite(s)?Math.min(1,Math.max(0,s)):0}function Q(s){return new Array(Math.max(0,s)).fill(0)}function fe(s,e){if(e<=0)return[];if(s.length===0)return Q(e);let t=[];for(let i=0;i<e;i++){let r=Math.floor(i*s.length/e),o=Math.max(r+1,Math.floor((i+1)*s.length/e)),n=0;for(let a=r;a<o&&a<s.length;a++)n=Math.max(n,s[a]);t.push(n)}return t}function ge(s){let e=s.reduce((t,i)=>Math.max(t,i),0);return e<=0?[...s]:s.map(t=>t/e)}var Z=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,t){if(this.windowStart===void 0)return this.windowStart=t,this.pending=Fe(e),!1;let i=!1;return t-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=t,i=!0),this.pending=Math.max(this.pending,Fe(e)),i}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let t=this.peaks.slice(-e);return[...Q(e-t.length),...t]}resampled(e){return fe(this.peaks,e)}};function Ye(s,e,t){return{source:{kind:"fresh",blob:s},url:URL.createObjectURL(s),duration:e,peaks:ge(fe(t,48))}}function me(s){return s.source.kind==="stored"?s.source.id:void 0}var St=async(s,e)=>{let t=globalThis.AudioContext??globalThis.webkitAudioContext;if(!t)return[];let i=new t;try{let o=(await i.decodeAudioData(await s.arrayBuffer())).getChannelData(0),n=[];for(let a=0;a<e;a++){let l=Math.floor(a*o.length/e),p=Math.floor((a+1)*o.length/e),u=0;for(let c=l;c<p;c++)u=Math.max(u,Math.abs(o[c]));n.push(u)}return ge(n)}finally{await i.close?.()}};async function Ke(s,e,t=St){let i=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${s.auth.data.access_token}`}});if(!i.ok)throw new Error(`Could not load that recording (${i.status})`);let r=await i.blob(),o=[];try{o=await t(r,48)}catch{o=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(r),duration:e.duration,peaks:o}}function ee(s){s&&URL.revokeObjectURL(s.url)}var Ge=R`
  ha-card {
    padding: 16px;
  }

  /* --- status line ------------------------------------------------ */
  .status {
    min-height: 20px;
    font-size: 0.85em;
    line-height: 20px;
    text-align: center;
    margin-bottom: 4px;
  }
  .status.error {
    color: var(--error-color, #db4437);
  }
  .status.info {
    color: var(--secondary-text-color);
  }

  /* --- waveform strip --------------------------------------------- */
  .wave {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    height: 64px;
    padding: 0 4px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    touch-action: none;
  }
  .wave.seekable {
    cursor: pointer;
  }
  .bar {
    flex: 1;
    min-width: 2px;
    border-radius: 2px;
    /* Centred in a flex row, so a bar of height h reads as mirrored around
       the middle without drawing two of them. */
    background: var(--divider-color, #ddd);
    transition: height 80ms linear;
  }
  .bar.live,
  .bar.played {
    background: var(--primary-color, #03a9f4);
  }

  /* --- player row -------------------------------------------------- */
  .player {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 4px;
  }
  .player .time {
    flex: 1;
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
  }
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .icon:hover:not([disabled]) {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .icon[disabled] {
    color: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .icon:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* --- broadcast --------------------------------------------------- */
  .broadcast {
    display: block;
    width: 100%;
    margin: 16px 0;
    padding: 14px;
    font: inherit;
    font-weight: 500;
    border: none;
    border-radius: 24px;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    cursor: pointer;
  }
  .broadcast[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .broadcast:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* --- record button ----------------------------------------------- */
  .record-row {
    display: flex;
    justify-content: center;
    padding: 8px 0 4px;
  }
  .record {
    width: 96px;
    height: 96px;
    border: none;
    border-radius: 50%;
    background: var(--error-color, #db4437);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    /* Stops the browser claiming the gesture as a scroll or a long-press. */
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .record[data-recording="true"] {
    transform: scale(0.92);
    box-shadow: 0 0 0 8px rgba(219, 68, 55, 0.25);
  }
  .record[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    box-shadow: none;
    cursor: default;
  }
  .record:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 4px;
  }

  /* --- sections ---------------------------------------------------- */
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 8px 0 6px;
    font-size: 0.8em;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .section-head .count {
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }
  .empty {
    padding: 12px 0;
    font-size: 0.9em;
    color: var(--secondary-text-color);
  }

  /* --- speakers: rows ---------------------------------------------- */
  .target-rows {
    max-height: 208px;
    overflow-y: auto;
  }
  .target-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 8px;
    font: inherit;
    text-align: left;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .target-row[data-on="true"] {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .target-name {
    flex: 1;
  }
  .target-note {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .target-check {
    width: 20px;
    text-align: center;
    color: var(--primary-color);
  }

  /* --- speakers: chips --------------------------------------------- */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    padding: 8px 14px;
    font: inherit;
    border-radius: 18px;
    border: 1px solid var(--divider-color, #ddd);
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .chip[data-on="true"] {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  /* --- speakers: dropdown ------------------------------------------ */
  .dropdown {
    position: relative;
  }
  .dropdown-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    font: inherit;
    text-align: left;
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 8px;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .dropdown-panel {
    position: absolute;
    z-index: 2;
    left: 0;
    right: 0;
    max-height: 240px;
    overflow-y: auto;
    margin-top: 4px;
    padding: 4px;
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  /* --- history ----------------------------------------------------- */
  .history {
    border-top: 1px solid var(--divider-color, #ddd);
    margin-top: 8px;
    padding-top: 4px;
  }
  .history-row {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 8px;
  }
  .history-row[data-loaded="true"] {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .history-row[data-loading="true"] {
    opacity: 0.5;
  }
  .history-load {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    flex: 1;
    padding: 10px 8px;
    font: inherit;
    text-align: left;
    border: none;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .history-length {
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
  }
`;function H(s){let e=Number.isFinite(s)&&s>0?Math.floor(s):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function Je(s,e){return s.getFullYear()===e.getFullYear()&&s.getMonth()===e.getMonth()&&s.getDate()===e.getDate()}function ye(s){return s.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Xe(s,e=new Date){let t=new Date(s);if(Number.isNaN(t.getTime()))return"Unknown time";let i=(e.getTime()-t.getTime())/1e3;if(i<60)return"Just now";if(i<3600){let n=Math.round(i/60);return`${n} minute${n===1?"":"s"} ago`}if(Je(t,e))return`Today ${ye(t)}`;let r=new Date(e);return r.setDate(e.getDate()-1),Je(t,r)?`Yesterday ${ye(t)}`:`${t.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${ye(t)}`}function Ze(s){let e=s.now??new Date;return d`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <span class="count">${s.messages.length||""}</span>
      </div>
      ${s.messages.length===0?d`<div class="empty">Nothing recorded yet</div>`:s.messages.map(t=>d`
              <div
                class="history-row"
                data-loaded="${s.loadedId===t.id}"
                data-loading="${s.loadingId===t.id}"
              >
                <button class="history-load" @click=${()=>s.onLoad(t)}>
                  <span class="history-when">${Xe(t.created,e)}</span>
                  <span class="history-length">${H(t.duration)}</span>
                </button>
                ${t.can_delete?d`
                      <button
                        class="icon"
                        title="Delete"
                        aria-label="Delete"
                        @click=${()=>s.onDelete(t.id)}
                      >
                        ✕
                      </button>
                    `:h}
              </div>
            `)}
    </div>
  `}var Et=K`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path fill="currentColor" d="M8 5v14l11-7z" />
</svg>`,Pt=K`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" />
</svg>`,Ct=K`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
</svg>`;function Qe(s){let e=s.playing?"Pause":"Play";return d`
    <div class="player" data-enabled=${s.enabled}>
      <button
        class="icon"
        ?disabled=${!s.enabled}
        title=${e}
        aria-label=${e}
        @click=${s.onToggle}
      >
        ${s.playing?Pt:Et}
      </button>
      <span class="time"
        >${H(s.position)} / ${H(s.duration)}</span
      >
      <button
        class="icon"
        ?disabled=${!s.enabled}
        title="Clear"
        aria-label="Clear"
        @click=${s.onClear}
      >
        ${Ct}
      </button>
    </div>
  `}var et=2;function Mt(s,e){if(e.length===0)return"No speakers selected";let t=e.map(o=>s.find(n=>n.entityId===o)?.name??o),i=t.slice(0,et).join(", "),r=t.length-et;return r>0?`${i} +${r}`:i}function tt(s,e){let t=s.selected.includes(e.entityId);return d`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>s.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?h:d`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${t?"\u2713":""}</span>
    </button>
  `}function Tt(s,e){let t=s.selected.includes(e.entityId);return d`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>s.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function it(s){let e=d`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${s.selected.length} of ${s.players.length}</span>
    </div>
  `;return s.players.length===0?d`${e}<div class="empty">No speakers found</div>`:s.style==="chips"?d`
      ${e}
      <div class="chips">${s.players.map(t=>Tt(s,t))}</div>
    `:s.style==="dropdown"?d`
      ${e}
      <div class="dropdown">
        <button
          class="dropdown-summary"
          aria-expanded=${s.open}
          @click=${()=>s.onOpenChange(!s.open)}
        >
          <span>${Mt(s.players,s.selected)}</span>
          <span aria-hidden="true">${s.open?"\u25B4":"\u25BE"}</span>
        </button>
        ${s.open?d`
              <!-- Absolutely positioned: an inline panel would push the
                   broadcast button and the history list down the card. -->
              <div class="dropdown-panel">
                ${s.players.map(t=>tt(s,t))}
              </div>
            `:h}
      </div>
    `:d`
    ${e}
    <div class="target-rows">${s.players.map(t=>tt(s,t))}</div>
  `}function Rt(s){let t=s.currentTarget.getBoundingClientRect();return t.width===0?0:Math.min(1,Math.max(0,(s.clientX-t.left)/t.width))}function st(s){let e=t=>s.progress!==void 0&&t/s.bars.length<s.progress;return d`
    <div
      class="wave ${s.seekable?"seekable":""}"
      @pointerdown=${t=>{s.seekable&&s.onSeek(Rt(t))}}
    >
      ${s.bars.map((t,i)=>d`
          <div
            class="bar ${e(i)?"played":s.progress===void 0?"live":""}"
            style="height:${Math.max(2,Math.round(t*100))}%"
          ></div>
        `)}
    </div>
  `}var Ut="Voice Broadcast",Ot=.4,g=class extends y{constructor(){super(...arguments);this.config={type:""};this.phase="idle";this.elapsed=0;this.selected=[];this.history=[];this.bars=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.recorder=new S;this.envelope=new Z;this.busy=!1;this.disconnected=!1;this.stopRequested=!1}setConfig(t){this.config=t,this.selected=t.targets?[...t.targets]:[]}getCardSize(){return this.config.show_history===!1?3:6}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain",record_mode:"push_to_talk",player_list:"rows"}}connectedCallback(){super.connectedCallback(),this.disconnected=!1,S.isSupported()||(this.status={kind:"error",text:je}),this.refreshHistory()}disconnectedCallback(){super.disconnectedCallback(),this.disconnected=!0,this.clearTimer(),this.stopPlayback(),ee(this.clip),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1}))}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}async refreshHistory(){if(!(!this.hass||this.config.show_history===!1))try{this.history=await Le(this.hass)}catch{this.history=[]}}get players(){return qe(X(this.hass),this.config.show_players,this.config.hide_players)}get targets(){return We(this.selected,this.config.show_players,this.config.hide_players)}get recordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}async onPressStart(t){if(t.preventDefault(),!(this.phase==="sending"||!S.isSupported())){if(this.recordMode==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}this.stopRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await this.stopRecording()}}async onPressEnd(){if(this.recordMode==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0;return}await this.stopRecording()}}async startRecording(){if(this.busy||this.phase==="recording")return;this.busy=!0,this.status=void 0;try{this.recorder.onLevel(i=>{this.envelope.push(i,Date.now())&&(this.bars=this.envelope.tail(48))}),this.envelope.reset(),await this.recorder.start()}catch(i){this.fail(ze(i));return}finally{this.busy=!1}if(this.disconnected){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1});return}this.phase="recording",this.elapsed=0;let t=ue(this.config.max_duration);this.timer=window.setInterval(()=>{this.elapsed+=1,this.elapsed>=t&&this.stopRecording()},1e3)}async stopRecording(){if(!(this.busy||this.phase!=="recording")){this.busy=!0,this.clearTimer();try{let{blob:t,duration:i}=await this.recorder.stop();if(this.recordMode==="push_to_talk"&&i<Ot){this.phase="idle",this.fail("Hold the button while you speak.");return}this.setClip(Ye(t,i,this.envelope.all())),this.phase="idle"}catch(t){this.fail(`Could not finish recording: ${t?.message??t}`),this.phase="idle"}finally{this.busy=!1}}}setClip(t){this.stopPlayback(),this.clip&&this.clip!==t&&ee(this.clip),this.clip=t,this.bars=t.peaks.length?t.peaks:[]}clearClip(){this.stopPlayback(),ee(this.clip),this.clip=void 0,this.bars=[]}seek(t){if(!this.clip)return;this.position=t*this.clip.duration;let i=this.ensureAudio();i&&i.src===this.clip.url&&(i.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let t=this.ensureAudio();if(!(!t||!this.clip)){if(this.playing){t.pause(),this.playing=!1;return}t.src!==this.clip.url&&(t.src=this.clip.url,t.currentTime=this.position),t.play().then(()=>{this.playing=!0},i=>{this.fail(`Could not play that here: ${i?.message??i}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}fail(t){this.status={kind:"error",text:t}}toggleTarget(t){this.selected=this.selected.includes(t)?this.selected.filter(i=>i!==t):[...this.selected,t]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.phase!=="sending"}async messageId(t){let i=me(t);if(i!==void 0)return i;let r=t.source.blob,o=await Ne(this.hass,r,t.duration);return this.clip={...t,source:{kind:"stored",id:o}},o}async broadcast(){let t=this.clip;if(!t){this.fail("Record a message or pick one from below first.");return}let i=this.targets;if(i.length===0){this.fail("Pick at least one speaker first.");return}this.phase="sending",this.status=void 0;try{let r=await this.messageId(t),{failed:o}=await Ie(this.hass,r,i,this.config.mode??"plain");this.phase="idle",o.length===0?this.status={kind:"info",text:`Sent to ${this.describe(i)}`}:o.length>=i.length?this.fail(`Could not play on any speaker: ${this.describe(o)}.`):this.fail(`Played, but not on ${this.describe(o)}.`),await this.refreshHistory()}catch(r){this.phase="idle",this.fail(`Could not send: ${r?.message??r}`)}}async loadMessage(t){this.loadingId=t.id,this.status=void 0;try{this.setClip(await Ke(this.hass,t))}catch(i){this.fail(i?.message??String(i))}finally{this.loadingId=void 0}}describe(t){return t.map(i=>this.hass?.states?.[i]?.attributes?.friendly_name??i).join(", ")}async deleteRecording(t){try{await De(this.hass,t)&&await this.refreshHistory()}catch(i){i?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${i?.message??i}`)}}get recordHint(){return this.phase==="recording"?`Recording\u2026 ${this.elapsed}s`:this.phase==="sending"?"Broadcasting\u2026":this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}render(){return d`
      <ha-card .header=${this.config.title?.trim()||Ut}>
        ${st({bars:this.bars.length?this.bars:Q(48),progress:this.clip?this.position/(this.clip.duration||1):void 0,seekable:this.clip!==void 0,onSeek:t=>this.seek(t)})}

        ${Qe({enabled:this.clip!==void 0,playing:this.playing,position:this.position,duration:this.clip?.duration??0,onToggle:()=>this.togglePlay(),onClear:()=>this.clearClip()})}

        <div class="record-row">
          <button
            class="record"
            data-recording=${this.phase==="recording"}
            ?disabled=${!S.isSupported()||this.phase==="sending"}
            @pointerdown=${this.onPressStart}
            @pointerup=${this.onPressEnd}
            @pointercancel=${this.onPressEnd}
            @pointerleave=${this.onPressEnd}
            @contextmenu=${t=>t.preventDefault()}
            @keydown=${t=>{!t.repeat&&(t.key===" "||t.key==="Enter")&&this.onPressStart(t)}}
            @keyup=${t=>{(t.key===" "||t.key==="Enter")&&this.onPressEnd()}}
            title=${this.recordHint}
            aria-label=${this.recordHint}
          ></button>
        </div>
        <div class="status ${this.status?.kind??"info"}">
          ${this.status?.text??this.recordHint}
        </div>

        ${it({players:this.players.map(t=>({entityId:t,name:this.hass?.states?.[t]?.attributes?.friendly_name??t,available:this.hass?.states?.[t]?.state!=="unavailable"})),selected:this.selected,style:this.config.player_list??"rows",open:this.pickerOpen,onToggle:t=>this.toggleTarget(t),onOpenChange:t=>{this.pickerOpen=t}})}

        <button
          class="broadcast"
          ?disabled=${!this.canBroadcast}
          @click=${this.broadcast}
        >
          ${this.phase==="sending"?"Broadcasting\u2026":"Broadcast"}
        </button>

        ${this.config.show_history===!1?h:Ze({messages:this.history,loadedId:this.clip?me(this.clip):void 0,loadingId:this.loadingId,onLoad:t=>void this.loadMessage(t),onDelete:t=>void this.deleteRecording(t)})}
      </ha-card>
    `}};g.styles=Ge,f([M({attribute:!1})],g.prototype,"hass",2),f([m()],g.prototype,"config",2),f([m()],g.prototype,"phase",2),f([m()],g.prototype,"elapsed",2),f([m()],g.prototype,"status",2),f([m()],g.prototype,"selected",2),f([m()],g.prototype,"history",2),f([m()],g.prototype,"clip",2),f([m()],g.prototype,"bars",2),f([m()],g.prototype,"loadingId",2),f([m()],g.prototype,"position",2),f([m()],g.prototype,"playing",2),f([m()],g.prototype,"pickerOpen",2),g=f([G("hass-broadcast-card")],g);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{g as HassBroadcastCard};
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
