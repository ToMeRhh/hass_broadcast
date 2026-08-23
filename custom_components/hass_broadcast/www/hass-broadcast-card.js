var st=Object.defineProperty;var ot=Object.getOwnPropertyDescriptor;var g=(i,e,t,r)=>{for(var s=r>1?void 0:r?ot(e,t):e,o=i.length-1,n;o>=0;o--)(n=i[o])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&st(e,t,s),s};var q=globalThis,W=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,te=Symbol(),be=new WeakMap,T=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(W&&e===void 0){let r=t!==void 0&&t.length===1;r&&(e=be.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&be.set(t,e))}return e}toString(){return this.cssText}},ye=i=>new T(typeof i=="string"?i:i+"",void 0,te),R=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new T(t,i,te)},ve=(i,e)=>{if(W)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let r=document.createElement("style"),s=q.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,i.appendChild(r)}},re=W?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let r of e.cssRules)t+=r.cssText;return ye(t)})(i):i;var{is:nt,defineProperty:at,getOwnPropertyDescriptor:lt,getOwnPropertyNames:dt,getOwnPropertySymbols:ct,getPrototypeOf:ht}=Object,V=globalThis,xe=V.trustedTypes,pt=xe?xe.emptyScript:"",ut=V.reactiveElementPolyfillSupport,U=(i,e)=>i,O={toAttribute(i,e){switch(e){case Boolean:i=i?pt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},F=(i,e)=>!nt(i,e),$e={attribute:!0,type:String,converter:O,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$e){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&at(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){let{get:s,set:o}=lt(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let a=s?.call(this);o?.call(this,n),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$e}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;let e=ht(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){let t=this.properties,r=[...dt(t),...ct(t)];for(let s of r)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)t.unshift(re(s))}else e!==void 0&&t.push(re(e));return t}static _$Eu(e,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ve(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:O).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=r.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:O;this._$Em=s;let a=n.fromAttribute(t,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,r,s=!1,o){if(e!==void 0){let n=this.constructor;if(s===!1&&(o=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??F)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:o},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,o]of r){let{wrapped:n}=o,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[U("elementProperties")]=new Map,v[U("finalized")]=new Map,ut?.({ReactiveElement:v}),(V.reactiveElementVersions??=[]).push("2.1.2");var de=globalThis,we=i=>i,Y=de.trustedTypes,_e=Y?Y.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ce="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,Me="?"+$,gt=`<${Me}>`,k=document,N=()=>k.createComment(""),D=i=>i===null||typeof i!="object"&&typeof i!="function",ce=Array.isArray,ft=i=>ce(i)||typeof i?.[Symbol.iterator]=="function",ie=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Ae=/>/g,w=RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Se=/'/g,Ee=/"/g,Te=/^(?:script|style|textarea|title)$/i,he=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),d=he(1),K=he(2),jt=he(3),A=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Pe=new WeakMap,_=k.createTreeWalker(k,129);function Re(i,e){if(!ce(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return _e!==void 0?_e.createHTML(e):e}var mt=(i,e)=>{let t=i.length-1,r=[],s,o=e===2?"<svg>":e===3?"<math>":"",n=L;for(let a=0;a<t;a++){let l=i[a],p,u,c=-1,y=0;for(;y<l.length&&(n.lastIndex=y,u=n.exec(l),u!==null);)y=n.lastIndex,n===L?u[1]==="!--"?n=ke:u[1]!==void 0?n=Ae:u[2]!==void 0?(Te.test(u[2])&&(s=RegExp("</"+u[2],"g")),n=w):u[3]!==void 0&&(n=w):n===w?u[0]===">"?(n=s??L,c=-1):u[1]===void 0?c=-2:(c=n.lastIndex-u[2].length,p=u[1],n=u[3]===void 0?w:u[3]==='"'?Ee:Se):n===Ee||n===Se?n=w:n===ke||n===Ae?n=L:(n=w,s=void 0);let x=n===w&&i[a+1].startsWith("/>")?" ":"";o+=n===L?l+gt:c>=0?(r.push(p),l.slice(0,c)+Ce+l.slice(c)+$+x):l+$+(c===-2?a:x)}return[Re(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},I=class i{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let o=0,n=0,a=e.length-1,l=this.parts,[p,u]=mt(e,t);if(this.el=i.createElement(p,r),_.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=_.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let c of s.getAttributeNames())if(c.endsWith(Ce)){let y=u[n++],x=s.getAttribute(c).split($),B=/([.?@])?(.*)/.exec(y);l.push({type:1,index:o,name:B[2],strings:x,ctor:B[1]==="."?oe:B[1]==="?"?ne:B[1]==="@"?ae:C}),s.removeAttribute(c)}else c.startsWith($)&&(l.push({type:6,index:o}),s.removeAttribute(c));if(Te.test(s.tagName)){let c=s.textContent.split($),y=c.length-1;if(y>0){s.textContent=Y?Y.emptyScript:"";for(let x=0;x<y;x++)s.append(c[x],N()),_.nextNode(),l.push({type:2,index:++o});s.append(c[y],N())}}}else if(s.nodeType===8)if(s.data===Me)l.push({type:2,index:o});else{let c=-1;for(;(c=s.data.indexOf($,c+1))!==-1;)l.push({type:7,index:o}),c+=$.length-1}o++}}static createElement(e,t){let r=k.createElement("template");return r.innerHTML=e,r}};function P(i,e,t=i,r){if(e===A)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl,o=D(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,r)),r!==void 0?(t._$Co??=[])[r]=s:t._$Cl=s),s!==void 0&&(e=P(i,s._$AS(i,e.values),s,r)),e}var se=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??k).importNode(t,!0);_.currentNode=s;let o=_.nextNode(),n=0,a=0,l=r[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new H(o,o.nextSibling,this,e):l.type===1?p=new l.ctor(o,l.name,l.strings,this,e):l.type===6&&(p=new le(o,this,e)),this._$AV.push(p),l=r[++a]}n!==l?.index&&(o=_.nextNode(),n++)}return _.currentNode=k,s}p(e){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},H=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),D(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ft(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=I.createElement(Re(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{let o=new se(s,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=Pe.get(e.strings);return t===void 0&&Pe.set(e.strings,t=new I(e)),t}k(e){ce(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,s=0;for(let o of e)s===t.length?t.push(r=new i(this.O(N()),this.O(N()),this,this.options)):r=t[s],r._$AI(o),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let r=we(e).nextSibling;we(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},C=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(e,t=this,r,s){let o=this.strings,n=!1;if(o===void 0)e=P(this,e,t,0),n=!D(e)||e!==this._$AH&&e!==A,n&&(this._$AH=e);else{let a=e,l,p;for(e=o[0],l=0;l<o.length-1;l++)p=P(this,a[r+l],t,l),p===A&&(p=this._$AH[l]),n||=!D(p)||p!==this._$AH[l],p===h?e=h:e!==h&&(e+=(p??"")+o[l+1]),this._$AH[l]=p}n&&!s&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},oe=class extends C{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},ne=class extends C{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},ae=class extends C{constructor(e,t,r,s,o){super(e,t,r,s,o),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??h)===A)return;let r=this._$AH,s=e===h&&r!==h||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==h&&(r===h||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},le=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}};var bt=de.litHtmlPolyfillSupport;bt?.(I,H),(de.litHtmlVersions??=[]).push("3.3.3");var Ue=(i,e,t)=>{let r=t?.renderBefore??e,s=r._$litPart$;if(s===void 0){let o=t?.renderBefore??null;r._$litPart$=s=new H(e.insertBefore(N(),o),o,void 0,t??{})}return s._$AI(i),s};var pe=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ue(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};b._$litElement$=!0,b.finalized=!0,pe.litElementHydrateSupport?.({LitElement:b});var yt=pe.litElementPolyfillSupport;yt?.({LitElement:b});(pe.litElementVersions??=[]).push("4.2.2");var G=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};var vt={attribute:!0,type:String,converter:O,reflect:!1,hasChanged:F},xt=(i=vt,e,t)=>{let{kind:r,metadata:s}=t,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),r==="accessor"){let{name:n}=t;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,l,i,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,i,a),a}}}if(r==="setter"){let{name:n}=t;return function(a){let l=this[n];e.call(this,a),this.requestUpdate(n,l,i,!0,a)}}throw Error("Unsupported decorator location: "+r)};function M(i){return(e,t)=>typeof t=="object"?xt(i,e,t):((r,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(i,e,t)}function m(i){return M({...i,state:!0,attribute:!1})}async function Oe(i,e,t){let r=new FormData;r.append("file",e,"recording.wav"),r.append("duration",String(t));let s=await fetch("/api/hass_broadcast/upload",{method:"POST",body:r,headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!s.ok)throw new Error(`Upload failed (${s.status})`);return(await s.json()).message_id}async function Le(i){return(await i.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function Ne(i,e){return(await i.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function De(i,e,t,r){return{failed:(await i.connection.sendMessagePromise({type:"hass_broadcast/send",message_id:e,targets:t,mode:r})).failed}}var Ie="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function He(i){return i?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${i?.message??i?.name??"unknown error"}`}function je(i,e){let t=i.length*2,r=new ArrayBuffer(44+t),s=new DataView(r),o=(n,a)=>{for(let l=0;l<a.length;l++)s.setUint8(n+l,a.charCodeAt(l))};return o(0,"RIFF"),s.setUint32(4,36+t,!0),o(8,"WAVE"),o(12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,e,!0),s.setUint32(28,e*2,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),o(36,"data"),s.setUint32(40,t,!0),new Int16Array(r,44).set(i),new Blob([r],{type:"audio/wav"})}var ze=16e3,$t="/api/hass_broadcast/static/recorder-worklet.js",S=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:ze}),await this.context.audioWorklet.addModule($t);let e=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=t=>{this.chunks.push(t.data),this.levelCallback&&this.levelCallback(wt(t.data))},e.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(e){throw await this.release(),e}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let e=this.context?.sampleRate??ze,t=this.chunks;await this.release();let r=t.reduce((n,a)=>n+a.length,0),s=new Int16Array(r),o=0;for(let n of t)s.set(n,o),o+=n.length;return{blob:je(s,e),duration:r/e}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function wt(i){let e=0;for(let t of i)e=Math.max(e,Math.abs(t));return e/32768}function X(i){return i?.states?Object.keys(i.states).filter(e=>e.startsWith("media_player.")).filter(e=>(i.states[e].attributes.supported_features&512)!==0).sort():[]}function Be(i,e,t){let r=e?.length?[...new Set(e)]:i;if(!t?.length)return r;let s=new Set(t);return r.filter(o=>!s.has(o))}function qe(i,e,t){let r=e?.length?new Set(e):void 0,s=new Set(t??[]);return i.filter(o=>(r===void 0||r.has(o))&&!s.has(o))}function _t(i,e){let t=n=>i?.states?.[n]?.attributes?.friendly_name??n,r=X(i),s=new Set(r),o=[...new Set([...e.show_players??[],...e.hide_players??[]])].filter(n=>!s.has(n)).sort();return[...r,...o].map(n=>({entityId:n,name:t(n),available:s.has(n)}))}var We=3;function kt(i,e,t){if(!i?.length)return t;let r=i.map(n=>e.find(a=>a.entityId===n)?.name??n),s=r.slice(0,We).join(", "),o=r.length-We;return o>0?`${s} +${o} more`:s}function At(i,e,t){let r=i??[];if(t)return r.includes(e)?r:[...r,e];let s=r.filter(o=>o!==e);return s.length?s:void 0}function ue(i){if(i===""||i===null||i===void 0)return 60;let e=Number(i);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var E=class extends b{constructor(){super(...arguments);this.config={type:""}}setConfig(t){this.config=t}emit(t){this.config={...this.config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}get currentRecordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}setRecordMode(t){this.emit({record_mode:t})}playerSection(t,r,s,o){let n=this.config[t]??[];return d`
      <details class="players">
        <summary>
          ${r} — ${kt(n,o,s)}
        </summary>
        ${o.length===0?d`<div class="hint">No media players found.</div>`:this.playerList(t,o)}
      </details>
    `}playerList(t,r){let s=this.config[t]??[];return d`
      <div class="rows">
        ${r.map(o=>d`
            <label>
              <input
                type="checkbox"
                .checked=${s.includes(o.entityId)}
                @change=${n=>this.emit({[t]:At(this.config[t],o.entityId,n.target.checked)})}
              />
              <span class=${o.available?"":"missing"}>
                ${o.name}${o.available?"":" (not available)"}
              </span>
            </label>
          `)}
      </div>
    `}render(){let t=_t(this.hass,this.config);return d`
      <div class="field">
        <label for="title">Card name</label>
        <input
          id="title"
          type="text"
          placeholder="Voice Broadcast"
          .value=${this.config.title??""}
          @change=${r=>this.emit({title:r.target.value.trim()||void 0})}
        />
      </div>

      <div class="field">
        <label>Recording</label>
        <div class="segmented">
          ${[["push_to_talk","Push to talk"],["start_stop","Tap to start and stop"]].map(([r,s])=>d`
              <button
                type="button"
                data-on=${this.currentRecordMode===r}
                @click=${()=>this.setRecordMode(r)}
              >
                ${s}
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
          @change=${r=>this.emit({player_list:r.target.value})}
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
          @change=${r=>this.emit({mode:r.target.value})}
        >
          <option value="plain">Plain — just play the message</option>
          <option value="restore">Restore — put back volume afterwards</option>
          <option value="chime">Chime — attention tone, then the message</option>
        </select>
        <div class="hint">
          Restore uses a speaker's native announce support when it has any, which
          ducks and resumes whatever was playing. Speakers without it — Google Cast
          among them — get volume restored, but an interrupted Spotify or YouTube
          session may not resume.
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
          @change=${r=>this.emit({max_duration:ue(r.target.value)})}
        />
      </div>

      <div class="field">
        <label>
          <input
            type="checkbox"
            .checked=${this.config.show_history!==!1}
            @change=${r=>this.emit({show_history:r.target.checked})}
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
  `,g([M({attribute:!1})],E.prototype,"hass",2),g([m()],E.prototype,"config",2),E=g([G("hass-broadcast-card-editor")],E);function Ve(i){return Number.isFinite(i)?Math.min(1,Math.max(0,i)):0}function Q(i){return new Array(Math.max(0,i)).fill(0)}function Fe(i,e){if(e<=0)return[];if(i.length===0)return Q(e);let t=[];for(let r=0;r<e;r++){let s=Math.floor(r*i.length/e),o=Math.max(s+1,Math.floor((r+1)*i.length/e)),n=0;for(let a=s;a<o&&a<i.length;a++)n=Math.max(n,i[a]);t.push(n)}return t}function ge(i){let e=i.reduce((t,r)=>Math.max(t,r),0);return e<=0?[...i]:i.map(t=>t/e)}var Z=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,t){if(this.windowStart===void 0)return this.windowStart=t,this.pending=Ve(e),!1;let r=!1;return t-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=t,r=!0),this.pending=Math.max(this.pending,Ve(e)),r}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let t=this.peaks.slice(-e);return[...Q(e-t.length),...t]}};function Ye(i,e,t){return{source:{kind:"fresh",blob:i},url:URL.createObjectURL(i),duration:e,peaks:ge(Fe(t,48))}}function fe(i){return i.source.kind==="stored"?i.source.id:void 0}var St=async(i,e)=>{let t=globalThis.AudioContext??globalThis.webkitAudioContext;if(!t)return[];let r=new t;try{let o=(await r.decodeAudioData(await i.arrayBuffer())).getChannelData(0),n=[];for(let a=0;a<e;a++){let l=Math.floor(a*o.length/e),p=Math.floor((a+1)*o.length/e),u=0;for(let c=l;c<p;c++)u=Math.max(u,Math.abs(o[c]));n.push(u)}return ge(n)}finally{await r.close?.()}};async function Ke(i,e,t=St){let r=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!r.ok)throw new Error(`Could not load that recording (${r.status})`);let s=await r.blob(),o=[];try{o=await t(s,48)}catch{o=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(s),duration:e.duration,peaks:o}}function ee(i){i&&URL.revokeObjectURL(i.url)}var Ge=R`
  ha-card {
    padding: 16px;
  }

  /* --- status line ------------------------------------------------ */
  .status {
    /* Fixed, clipped single line: the messages routed here (send failures
       naming several speakers, upload errors) are long and variable-length
       and would otherwise wrap to two or three lines at phone width,
       pushing everything below down — the exact reflow this redesign
       exists to remove. The full text is still reachable via the
       "title" attribute. */
    height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    /* Seeking is horizontal-only; a full-width band that blocked all
       touch-action trapped vertical scroll on phones even when idle and
       non-seekable. Vertical panning is left to the browser. */
    touch-action: pan-y;
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
    /* Reserved unconditionally (not just while recording) so the pulse
       ring never shifts layout. The ring's box-shadow spreads up to 28px
       while fading to transparent, so at 16px its tail is faint but not
       fully gone by the time it reaches the rows above/below. */
    padding: 16px 0;
  }
  .record {
    position: relative;
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
  }
  /* Two rings pulse outward on pseudo-elements rather than the button
     itself, so the button's own box-shadow transition above stays
     untouched. The second ring starts half a cycle behind the first, so a
     new ring is always emerging before the previous one finishes fading —
     a continuous pulse instead of one ring restarting after a gap. */
  .record[data-recording="true"]::before,
  .record[data-recording="true"]::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    animation: record-pulse 2.8s ease-out infinite;
  }
  .record[data-recording="true"]::after {
    animation-delay: 1.4s;
  }
  @keyframes record-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(219, 68, 55, 0.55);
    }
    100% {
      box-shadow: 0 0 0 28px rgba(219, 68, 55, 0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .record[data-recording="true"]::before,
    .record[data-recording="true"]::after {
      animation: none;
      box-shadow: none;
    }
    .record[data-recording="true"]::after {
      box-shadow: 0 0 0 8px rgba(219, 68, 55, 0.25);
    }
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
`;function z(i){let e=Number.isFinite(i)&&i>0?Math.floor(i):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function Je(i,e){return i.getFullYear()===e.getFullYear()&&i.getMonth()===e.getMonth()&&i.getDate()===e.getDate()}function me(i){return i.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Xe(i,e=new Date){let t=new Date(i);if(Number.isNaN(t.getTime()))return"Unknown time";let r=(e.getTime()-t.getTime())/1e3;if(r<60)return"Just now";if(r<3600){let n=Math.round(r/60);return`${n} minute${n===1?"":"s"} ago`}if(Je(t,e))return`Today ${me(t)}`;let s=new Date(e);return s.setDate(e.getDate()-1),Je(t,s)?`Yesterday ${me(t)}`:`${t.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${me(t)}`}function Ze(i){let e=i.now??new Date;return d`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <span class="count">${i.messages.length||""}</span>
      </div>
      ${i.messages.length===0?d`<div class="empty">Nothing recorded yet</div>`:i.messages.map(t=>d`
              <div
                class="history-row"
                data-loaded="${i.loadedId===t.id}"
                data-loading="${i.loadingId===t.id}"
              >
                <button class="history-load" @click=${()=>i.onLoad(t)}>
                  <span class="history-when">${Xe(t.created,e)}</span>
                  <span class="history-length">${z(t.duration)}</span>
                </button>
                ${t.can_delete?d`
                      <button
                        class="icon"
                        title="Delete"
                        aria-label="Delete"
                        @click=${()=>i.onDelete(t.id)}
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
</svg>`;function Qe(i){let e=i.playing?"Pause":"Play";return d`
    <div class="player" data-enabled=${i.enabled}>
      <button
        class="icon"
        ?disabled=${!i.enabled}
        title=${e}
        aria-label=${e}
        @click=${i.onToggle}
      >
        ${i.playing?Pt:Et}
      </button>
      <span class="time"
        >${z(i.position)} / ${z(i.duration)}</span
      >
      <button
        class="icon"
        ?disabled=${!i.enabled}
        title="Clear"
        aria-label="Clear"
        @click=${i.onClear}
      >
        ${Ct}
      </button>
    </div>
  `}var et=2;function Mt(i,e){if(e.length===0)return"No speakers selected";let t=e.map(o=>i.find(n=>n.entityId===o)?.name??o),r=t.slice(0,et).join(", "),s=t.length-et;return s>0?`${r} +${s}`:r}function tt(i,e){let t=i.selected.includes(e.entityId);return d`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?h:d`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${t?"\u2713":""}</span>
    </button>
  `}function Tt(i,e){let t=i.selected.includes(e.entityId);return d`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function rt(i){let e=d`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${i.selected.length} of ${i.players.length}</span>
    </div>
  `;return i.players.length===0?d`${e}<div class="empty">No speakers found</div>`:i.style==="chips"?d`
      ${e}
      <div class="chips">${i.players.map(t=>Tt(i,t))}</div>
    `:i.style==="dropdown"?d`
      ${e}
      <div class="dropdown">
        <button
          class="dropdown-summary"
          aria-expanded=${i.open}
          @click=${()=>i.onOpenChange(!i.open)}
        >
          <span>${Mt(i.players,i.selected)}</span>
          <span aria-hidden="true">${i.open?"\u25B4":"\u25BE"}</span>
        </button>
        ${i.open?d`
              <!-- Absolutely positioned: an inline panel would push the
                   broadcast button and the history list down the card. -->
              <div class="dropdown-panel">
                ${i.players.map(t=>tt(i,t))}
              </div>
            `:h}
      </div>
    `:d`
    ${e}
    <div class="target-rows">${i.players.map(t=>tt(i,t))}</div>
  `}function Rt(i){let t=i.currentTarget.getBoundingClientRect();return t.width===0?0:Math.min(1,Math.max(0,(i.clientX-t.left)/t.width))}function it(i){let e=r=>i.progress!==void 0&&r/i.bars.length<i.progress,t=r=>{i.seekable&&i.onSeek(Rt(r))};return d`
    <div
      class="wave ${i.seekable?"seekable":""}"
      @pointerdown=${r=>{i.seekable&&(r.currentTarget.setPointerCapture(r.pointerId),t(r))}}
      @pointermove=${r=>{i.seekable&&r.buttons>0&&t(r)}}
      @pointerup=${r=>{i.seekable&&r.currentTarget.releasePointerCapture(r.pointerId)}}
      @pointercancel=${r=>{i.seekable&&r.currentTarget.releasePointerCapture(r.pointerId)}}
    >
      ${i.bars.map((r,s)=>d`
          <div
            class="bar ${e(s)?"played":i.recording?"live":""}"
            style="height:${Math.max(2,Math.round(r*100))}%"
          ></div>
        `)}
    </div>
  `}var Ut="Voice Broadcast",Ot=.4,f=class extends b{constructor(){super(...arguments);this.config={type:""};this.phase="idle";this.elapsed=0;this.selected=[];this.history=[];this.bars=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.recorder=new S;this.envelope=new Z;this.busy=!1;this.disconnected=!1;this.stopRequested=!1}setConfig(t){this.config=t,this.selected=t.targets?[...t.targets]:[]}getCardSize(){return this.config.show_history===!1?3:6}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain",record_mode:"push_to_talk",player_list:"rows"}}connectedCallback(){super.connectedCallback(),this.disconnected=!1,S.isSupported()||(this.status={kind:"error",text:Ie}),this.refreshHistory()}disconnectedCallback(){super.disconnectedCallback(),this.disconnected=!0,this.clearTimer(),this.stopPlayback(),ee(this.clip),this.clip=void 0,this.bars=[],this.phase==="recording"&&!this.busy&&(this.phase="idle",this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1}))}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}async refreshHistory(){if(!(!this.hass||this.config.show_history===!1))try{this.history=await Le(this.hass)}catch{this.history=[]}}get players(){return Be(X(this.hass),this.config.show_players,this.config.hide_players)}get targets(){return qe(this.selected,this.config.show_players,this.config.hide_players)}get recordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}async onPressStart(t){if(!(this.phase==="sending"||!S.isSupported())){if(this.recordMode==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}t.preventDefault(),!this.busy&&(this.stopRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await this.stopRecording())}}async onPressEnd(){if(this.recordMode==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0;return}await this.stopRecording()}}async startRecording(){if(this.busy||this.phase==="recording")return;this.busy=!0,this.status=void 0;try{this.recorder.onLevel(r=>{this.envelope.push(r,Date.now())&&(this.bars=this.envelope.tail(48))}),this.envelope.reset(),await this.recorder.start()}catch(r){this.fail(He(r));return}finally{this.busy=!1}if(this.disconnected){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1});return}this.phase="recording",this.elapsed=0;let t=ue(this.config.max_duration);this.timer=window.setInterval(()=>{this.elapsed+=1,this.elapsed>=t&&this.stopRecording()},1e3)}async stopRecording(){if(!(this.busy||this.phase!=="recording")){this.busy=!0,this.clearTimer();try{let{blob:t,duration:r}=await this.recorder.stop();if(this.recordMode==="push_to_talk"&&r<Ot){this.phase="idle",this.fail("Hold the button while you speak.");return}this.setClip(Ye(t,r,this.envelope.all())),this.phase="idle"}catch(t){this.fail(`Could not finish recording: ${t?.message??t}`),this.phase="idle"}finally{this.busy=!1}}}setClip(t){this.stopPlayback(),this.clip&&this.clip!==t&&ee(this.clip),this.clip=t,this.bars=t.peaks.length?t.peaks:[]}clearClip(){this.stopPlayback(),ee(this.clip),this.clip=void 0,this.bars=[]}seek(t){if(!this.clip)return;this.position=t*this.clip.duration;let r=this.ensureAudio();r&&r.src===this.clip.url&&(r.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let t=this.ensureAudio();if(!(!t||!this.clip)){if(this.playing){t.pause(),this.playing=!1;return}t.src!==this.clip.url&&(t.src=this.clip.url,t.currentTime=this.position),t.play().then(()=>{this.playing=!0},r=>{this.fail(`Could not play that here: ${r?.message??r}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}fail(t){this.status={kind:"error",text:t}}toggleTarget(t){this.selected=this.selected.includes(t)?this.selected.filter(r=>r!==t):[...this.selected,t]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.phase==="idle"}async messageId(t){let r=fe(t);if(r!==void 0)return r;let s=t.source.blob,o=await Oe(this.hass,s,t.duration);return this.clip===t&&(this.clip={...t,source:{kind:"stored",id:o}}),o}async broadcast(){if(this.phase!=="idle")return;let t=this.clip;if(!t){this.fail("Record a message or pick one from below first.");return}let r=this.targets;if(r.length===0){this.fail("Pick at least one speaker first.");return}this.phase="sending",this.status=void 0;try{let s=await this.messageId(t),{failed:o}=await De(this.hass,s,r,this.config.mode??"plain");this.phase="idle",o.length===0?this.status={kind:"info",text:`Sent to ${this.describe(r)}`}:o.length>=r.length?this.fail(`Could not play on any speaker: ${this.describe(o)}.`):this.fail(`Played, but not on ${this.describe(o)}.`),await this.refreshHistory()}catch(s){this.phase="idle",this.fail(`Could not send: ${s?.message??s}`)}}async loadMessage(t){this.loadingId=t.id,this.status=void 0;try{this.setClip(await Ke(this.hass,t))}catch(r){this.fail(r?.message??String(r))}finally{this.loadingId=void 0}}describe(t){return t.map(r=>this.hass?.states?.[r]?.attributes?.friendly_name??r).join(", ")}async deleteRecording(t){try{await Ne(this.hass,t)&&await this.refreshHistory()}catch(r){r?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${r?.message??r}`)}}get recordHint(){return this.phase==="recording"?`Recording\u2026 ${this.elapsed}s`:this.phase==="sending"?"Broadcasting\u2026":this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}get recordLabel(){return this.phase==="sending"?"Broadcasting":this.phase==="recording"?this.recordMode==="push_to_talk"?"Recording \u2014 release to stop":"Recording \u2014 tap to stop":this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}render(){return d`
      <ha-card .header=${this.config.title?.trim()||Ut}>
        ${it({bars:this.bars.length?this.bars:Q(48),progress:this.phase==="recording"?void 0:this.clip?this.position/(this.clip.duration||1):void 0,seekable:this.phase==="idle"&&this.clip!==void 0,recording:this.phase==="recording",onSeek:t=>this.seek(t)})}

        ${Qe({enabled:this.phase==="idle"&&this.clip!==void 0,playing:this.playing,position:this.position,duration:this.clip?.duration??0,onToggle:()=>this.togglePlay(),onClear:()=>this.clearClip()})}

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
            title=${this.recordLabel}
            aria-label=${this.recordLabel}
          ></button>
        </div>
        <div
          class="status ${this.status?.kind??"info"}"
          title=${this.status?.text??this.recordHint}
          aria-live="polite"
        >
          ${this.status?.text??this.recordHint}
        </div>

        ${rt({players:this.players.map(t=>({entityId:t,name:this.hass?.states?.[t]?.attributes?.friendly_name??t,available:this.hass?.states?.[t]?.state!=="unavailable"})),selected:this.selected,style:this.config.player_list??"rows",open:this.pickerOpen,onToggle:t=>this.toggleTarget(t),onOpenChange:t=>{this.pickerOpen=t}})}

        <button
          class="broadcast"
          ?disabled=${!this.canBroadcast}
          @click=${this.broadcast}
        >
          ${this.phase==="sending"?"Broadcasting\u2026":"Broadcast"}
        </button>

        ${this.config.show_history===!1?h:Ze({messages:this.history,loadedId:this.clip?fe(this.clip):void 0,loadingId:this.loadingId,onLoad:t=>void this.loadMessage(t),onDelete:t=>void this.deleteRecording(t)})}
      </ha-card>
    `}};f.styles=Ge,g([M({attribute:!1})],f.prototype,"hass",2),g([m()],f.prototype,"config",2),g([m()],f.prototype,"phase",2),g([m()],f.prototype,"elapsed",2),g([m()],f.prototype,"status",2),g([m()],f.prototype,"selected",2),g([m()],f.prototype,"history",2),g([m()],f.prototype,"clip",2),g([m()],f.prototype,"bars",2),g([m()],f.prototype,"loadingId",2),g([m()],f.prototype,"position",2),g([m()],f.prototype,"playing",2),g([m()],f.prototype,"pickerOpen",2),f=g([G("hass-broadcast-card")],f);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{f as HassBroadcastCard};
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
