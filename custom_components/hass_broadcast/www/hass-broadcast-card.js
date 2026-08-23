var at=Object.defineProperty;var lt=Object.getOwnPropertyDescriptor;var p=(i,e,t,r)=>{for(var s=r>1?void 0:r?lt(e,t):e,o=i.length-1,n;o>=0;o--)(n=i[o])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&at(e,t,s),s};var q=globalThis,W=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,te=Symbol(),be=new WeakMap,T=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(W&&e===void 0){let r=t!==void 0&&t.length===1;r&&(e=be.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&be.set(t,e))}return e}toString(){return this.cssText}},ye=i=>new T(typeof i=="string"?i:i+"",void 0,te),R=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new T(t,i,te)},ve=(i,e)=>{if(W)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let r=document.createElement("style"),s=q.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,i.appendChild(r)}},re=W?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let r of e.cssRules)t+=r.cssText;return ye(t)})(i):i;var{is:dt,defineProperty:ct,getOwnPropertyDescriptor:ht,getOwnPropertyNames:pt,getOwnPropertySymbols:ut,getPrototypeOf:gt}=Object,V=globalThis,xe=V.trustedTypes,ft=xe?xe.emptyScript:"",mt=V.reactiveElementPolyfillSupport,O=(i,e)=>i,U={toAttribute(i,e){switch(e){case Boolean:i=i?ft:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},F=(i,e)=>!dt(i,e),$e={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$e){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&ct(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){let{get:s,set:o}=ht(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let a=s?.call(this);o?.call(this,n),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$e}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;let e=gt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){let t=this.properties,r=[...pt(t),...ut(t)];for(let s of r)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)t.unshift(re(s))}else e!==void 0&&t.push(re(e));return t}static _$Eu(e,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ve(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:U).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=r.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:U;this._$Em=s;let a=n.fromAttribute(t,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,r,s=!1,o){if(e!==void 0){let n=this.constructor;if(s===!1&&(o=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??F)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:o},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,o]of r){let{wrapped:n}=o,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[O("elementProperties")]=new Map,v[O("finalized")]=new Map,mt?.({ReactiveElement:v}),(V.reactiveElementVersions??=[]).push("2.1.2");var de=globalThis,we=i=>i,Y=de.trustedTypes,_e=Y?Y.createPolicy("lit-html",{createHTML:i=>i}):void 0,Pe="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,Me="?"+$,bt=`<${Me}>`,k=document,D=()=>k.createComment(""),N=i=>i===null||typeof i!="object"&&typeof i!="function",ce=Array.isArray,yt=i=>ce(i)||typeof i?.[Symbol.iterator]=="function",ie=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Ae=/>/g,w=RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Se=/'/g,Ee=/"/g,Te=/^(?:script|style|textarea|title)$/i,he=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),d=he(1),K=he(2),Wt=he(3),A=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),Ce=new WeakMap,_=k.createTreeWalker(k,129);function Re(i,e){if(!ce(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return _e!==void 0?_e.createHTML(e):e}var vt=(i,e)=>{let t=i.length-1,r=[],s,o=e===2?"<svg>":e===3?"<math>":"",n=L;for(let a=0;a<t;a++){let l=i[a],g,f,h=-1,y=0;for(;y<l.length&&(n.lastIndex=y,f=n.exec(l),f!==null);)y=n.lastIndex,n===L?f[1]==="!--"?n=ke:f[1]!==void 0?n=Ae:f[2]!==void 0?(Te.test(f[2])&&(s=RegExp("</"+f[2],"g")),n=w):f[3]!==void 0&&(n=w):n===w?f[0]===">"?(n=s??L,h=-1):f[1]===void 0?h=-2:(h=n.lastIndex-f[2].length,g=f[1],n=f[3]===void 0?w:f[3]==='"'?Ee:Se):n===Ee||n===Se?n=w:n===ke||n===Ae?n=L:(n=w,s=void 0);let x=n===w&&i[a+1].startsWith("/>")?" ":"";o+=n===L?l+bt:h>=0?(r.push(g),l.slice(0,h)+Pe+l.slice(h)+$+x):l+$+(h===-2?a:x)}return[Re(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},I=class i{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let o=0,n=0,a=e.length-1,l=this.parts,[g,f]=vt(e,t);if(this.el=i.createElement(g,r),_.currentNode=this.el.content,t===2||t===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=_.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(Pe)){let y=f[n++],x=s.getAttribute(h).split($),B=/([.?@])?(.*)/.exec(y);l.push({type:1,index:o,name:B[2],strings:x,ctor:B[1]==="."?oe:B[1]==="?"?ne:B[1]==="@"?ae:P}),s.removeAttribute(h)}else h.startsWith($)&&(l.push({type:6,index:o}),s.removeAttribute(h));if(Te.test(s.tagName)){let h=s.textContent.split($),y=h.length-1;if(y>0){s.textContent=Y?Y.emptyScript:"";for(let x=0;x<y;x++)s.append(h[x],D()),_.nextNode(),l.push({type:2,index:++o});s.append(h[y],D())}}}else if(s.nodeType===8)if(s.data===Me)l.push({type:2,index:o});else{let h=-1;for(;(h=s.data.indexOf($,h+1))!==-1;)l.push({type:7,index:o}),h+=$.length-1}o++}}static createElement(e,t){let r=k.createElement("template");return r.innerHTML=e,r}};function C(i,e,t=i,r){if(e===A)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl,o=N(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,r)),r!==void 0?(t._$Co??=[])[r]=s:t._$Cl=s),s!==void 0&&(e=C(i,s._$AS(i,e.values),s,r)),e}var se=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??k).importNode(t,!0);_.currentNode=s;let o=_.nextNode(),n=0,a=0,l=r[0];for(;l!==void 0;){if(n===l.index){let g;l.type===2?g=new z(o,o.nextSibling,this,e):l.type===1?g=new l.ctor(o,l.name,l.strings,this,e):l.type===6&&(g=new le(o,this,e)),this._$AV.push(g),l=r[++a]}n!==l?.index&&(o=_.nextNode(),n++)}return _.currentNode=k,s}p(e){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},z=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=C(this,e,t),N(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):yt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=I.createElement(Re(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{let o=new se(s,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=Ce.get(e.strings);return t===void 0&&Ce.set(e.strings,t=new I(e)),t}k(e){ce(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,s=0;for(let o of e)s===t.length?t.push(r=new i(this.O(D()),this.O(D()),this,this.options)):r=t[s],r._$AI(o),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let r=we(e).nextSibling;we(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,o){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=c}_$AI(e,t=this,r,s){let o=this.strings,n=!1;if(o===void 0)e=C(this,e,t,0),n=!N(e)||e!==this._$AH&&e!==A,n&&(this._$AH=e);else{let a=e,l,g;for(e=o[0],l=0;l<o.length-1;l++)g=C(this,a[r+l],t,l),g===A&&(g=this._$AH[l]),n||=!N(g)||g!==this._$AH[l],g===c?e=c:e!==c&&(e+=(g??"")+o[l+1]),this._$AH[l]=g}n&&!s&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},oe=class extends P{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}},ne=class extends P{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}},ae=class extends P{constructor(e,t,r,s,o){super(e,t,r,s,o),this.type=5}_$AI(e,t=this){if((e=C(this,e,t,0)??c)===A)return;let r=this._$AH,s=e===c&&r!==c||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==c&&(r===c||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},le=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}};var xt=de.litHtmlPolyfillSupport;xt?.(I,z),(de.litHtmlVersions??=[]).push("3.3.3");var Oe=(i,e,t)=>{let r=t?.renderBefore??e,s=r._$litPart$;if(s===void 0){let o=t?.renderBefore??null;r._$litPart$=s=new z(e.insertBefore(D(),o),o,void 0,t??{})}return s._$AI(i),s};var pe=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};b._$litElement$=!0,b.finalized=!0,pe.litElementHydrateSupport?.({LitElement:b});var $t=pe.litElementPolyfillSupport;$t?.({LitElement:b});(pe.litElementVersions??=[]).push("4.2.2");var G=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};var wt={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:F},_t=(i=wt,e,t)=>{let{kind:r,metadata:s}=t,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),r==="accessor"){let{name:n}=t;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,l,i,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,i,a),a}}}if(r==="setter"){let{name:n}=t;return function(a){let l=this[n];e.call(this,a),this.requestUpdate(n,l,i,!0,a)}}throw Error("Unsupported decorator location: "+r)};function M(i){return(e,t)=>typeof t=="object"?_t(i,e,t):((r,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(i,e,t)}function m(i){return M({...i,state:!0,attribute:!1})}async function Ue(i,e,t){let r=new FormData;r.append("file",e,"recording.wav"),r.append("duration",String(t));let s=await fetch("/api/hass_broadcast/upload",{method:"POST",body:r,headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!s.ok)throw new Error(`Upload failed (${s.status})`);return(await s.json()).message_id}async function Le(i){return(await i.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function De(i,e){return(await i.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function Ne(i,e,t,r,s){return{failed:(await i.connection.sendMessagePromise({type:"hass_broadcast/send",message_id:e,targets:t,mode:r,...s!==void 0?{volume:s}:{}})).failed}}var Ie="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function ze(i){return i?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${i?.message??i?.name??"unknown error"}`}function He(i,e){let t=i.length*2,r=new ArrayBuffer(44+t),s=new DataView(r),o=(n,a)=>{for(let l=0;l<a.length;l++)s.setUint8(n+l,a.charCodeAt(l))};return o(0,"RIFF"),s.setUint32(4,36+t,!0),o(8,"WAVE"),o(12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,e,!0),s.setUint32(28,e*2,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),o(36,"data"),s.setUint32(40,t,!0),new Int16Array(r,44).set(i),new Blob([r],{type:"audio/wav"})}var je=16e3,kt="/api/hass_broadcast/static/recorder-worklet.js",S=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:je}),await this.context.audioWorklet.addModule(kt);let e=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=t=>{this.chunks.push(t.data),this.levelCallback&&this.levelCallback(At(t.data))},e.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(e){throw await this.release(),e}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let e=this.context?.sampleRate??je,t=this.chunks;await this.release();let r=t.reduce((n,a)=>n+a.length,0),s=new Int16Array(r),o=0;for(let n of t)s.set(n,o),o+=n.length;return{blob:He(s,e),duration:r/e}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function At(i){let e=0;for(let t of i)e=Math.max(e,Math.abs(t));return e/32768}function X(i){return i?.states?Object.keys(i.states).filter(e=>e.startsWith("media_player.")).filter(e=>(i.states[e].attributes.supported_features&512)!==0).sort():[]}function Be(i,e,t){let r=e?.length?[...new Set(e)]:i;if(!t?.length)return r;let s=new Set(t);return r.filter(o=>!s.has(o))}function qe(i,e,t){let r=e?.length?new Set(e):void 0,s=new Set(t??[]);return i.filter(o=>(r===void 0||r.has(o))&&!s.has(o))}function St(i,e){let t=n=>i?.states?.[n]?.attributes?.friendly_name??n,r=X(i),s=new Set(r),o=[...new Set([...e.show_players??[],...e.hide_players??[]])].filter(n=>!s.has(n)).sort();return[...r,...o].map(n=>({entityId:n,name:t(n),available:s.has(n)}))}var We=3;function Et(i,e,t){if(!i?.length)return t;let r=i.map(n=>e.find(a=>a.entityId===n)?.name??n),s=r.slice(0,We).join(", "),o=r.length-We;return o>0?`${s} +${o} more`:s}function Ct(i,e,t){let r=i??[];if(t)return r.includes(e)?r:[...r,e];let s=r.filter(o=>o!==e);return s.length?s:void 0}function ue(i){if(i===""||i===null||i===void 0)return 60;let e=Number(i);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var E=class extends b{constructor(){super(...arguments);this.config={type:""}}setConfig(t){this.config=t}emit(t){this.config={...this.config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}get currentRecordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}setRecordMode(t){this.emit({record_mode:t})}playerSection(t,r,s,o){let n=this.config[t]??[];return d`
      <details class="players">
        <summary>
          ${r} — ${Et(n,o,s)}
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
                @change=${n=>this.emit({[t]:Ct(this.config[t],o.entityId,n.target.checked)})}
              />
              <span class=${o.available?"":"missing"}>
                ${o.name}${o.available?"":" (not available)"}
              </span>
            </label>
          `)}
      </div>
    `}render(){let t=St(this.hass,this.config);return d`
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
  `,p([M({attribute:!1})],E.prototype,"hass",2),p([m()],E.prototype,"config",2),E=p([G("hass-broadcast-card-editor")],E);function Ve(i){return Number.isFinite(i)?Math.min(1,Math.max(0,i)):0}function Q(i){return new Array(Math.max(0,i)).fill(0)}function Fe(i,e){if(e<=0)return[];if(i.length===0)return Q(e);let t=[];for(let r=0;r<e;r++){let s=Math.floor(r*i.length/e),o=Math.max(s+1,Math.floor((r+1)*i.length/e)),n=0;for(let a=s;a<o&&a<i.length;a++)n=Math.max(n,i[a]);t.push(n)}return t}function ge(i){let e=i.reduce((t,r)=>Math.max(t,r),0);return e<=0?[...i]:i.map(t=>t/e)}var Z=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,t){if(this.windowStart===void 0)return this.windowStart=t,this.pending=Ve(e),!1;let r=!1;return t-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=t,r=!0),this.pending=Math.max(this.pending,Ve(e)),r}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let t=this.peaks.slice(-e);return[...Q(e-t.length),...t]}};function Ye(i,e,t){return{source:{kind:"fresh",blob:i},url:URL.createObjectURL(i),duration:e,peaks:ge(Fe(t,48))}}function fe(i){return i.source.kind==="stored"?i.source.id:void 0}var Pt=async(i,e)=>{let t=globalThis.AudioContext??globalThis.webkitAudioContext;if(!t)return[];let r=new t;try{let o=(await r.decodeAudioData(await i.arrayBuffer())).getChannelData(0),n=[];for(let a=0;a<e;a++){let l=Math.floor(a*o.length/e),g=Math.floor((a+1)*o.length/e),f=0;for(let h=l;h<g;h++)f=Math.max(f,Math.abs(o[h]));n.push(f)}return ge(n)}finally{await r.close?.()}};async function Ke(i,e,t=Pt){let r=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!r.ok)throw new Error(`Could not load that recording (${r.status})`);let s=await r.blob(),o=[];try{o=await t(s,48)}catch{o=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(s),duration:e.duration,peaks:o}}function ee(i){i&&URL.revokeObjectURL(i.url)}var Ge=R`
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

  /* --- volume override ---------------------------------------------- */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
  }
  .volume-toggle {
    padding: 6px 12px;
    font: inherit;
    font-size: 0.85em;
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 14px;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .volume-toggle[data-on="true"] {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .volume-slider {
    flex: 1;
  }
  .volume-value {
    min-width: 3ch;
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
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
  /* The card's height must not depend on how many messages are stored, so
     the three slots are reserved whether or not a message fills them. */
  .history-slots {
    display: flex;
    flex-direction: column;
  }
  .history-slot {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;
  }
  .history-slot > * {
    flex: 1;
    min-width: 0;
  }
  .history-slot .empty {
    padding: 0;
  }
  .history-all {
    padding: 2px 6px;
    margin: -2px -6px;
    font: inherit;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--primary-color);
    cursor: pointer;
  }
  .history-all[data-disabled="true"] {
    color: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }

  /* --- history dialog ---------------------------------------------- */
  .history-dialog {
    width: min(420px, calc(100vw - 32px));
    padding: 8px 12px 12px;
    border: none;
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  }
  .history-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .dialog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.8em;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  /* Retention runs to 200, so the full list scrolls — a modal owns the
     viewport, so this is the one scroller with no page scroll to fight. */
  .dialog-list {
    max-height: min(60vh, 420px);
    overflow-y: auto;
  }
`;function j(i){let e=Number.isFinite(i)&&i>0?Math.floor(i):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function Je(i,e){return i.getFullYear()===e.getFullYear()&&i.getMonth()===e.getMonth()&&i.getDate()===e.getDate()}function me(i){return i.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Xe(i,e=new Date){let t=new Date(i);if(Number.isNaN(t.getTime()))return"Unknown time";let r=(e.getTime()-t.getTime())/1e3;if(r<60)return"Just now";if(r<3600){let n=Math.round(r/60);return`${n} minute${n===1?"":"s"} ago`}if(Je(t,e))return`Today ${me(t)}`;let s=new Date(e);return s.setDate(e.getDate()-1),Je(t,s)?`Yesterday ${me(t)}`:`${t.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${me(t)}`}var Ze=3;function Qe(i,e,t){return d`
    <div
      class="history-row"
      data-loaded="${e.loadedId===i.id}"
      data-loading="${e.loadingId===i.id}"
    >
      <button class="history-load" @click=${()=>e.onLoad(i)}>
        <span class="history-when">${Xe(i.created,t)}</span>
        <span class="history-length">${j(i.duration)}</span>
      </button>
      ${i.can_delete?d`
            <button
              class="icon"
              title="Delete"
              aria-label="Delete"
              @click=${()=>e.onDelete(i.id)}
            >
              ✕
            </button>
          `:c}
    </div>
  `}function Mt(i,e){let t=()=>i.onDialogOpenChange?.(!1);return d`
    <dialog class="history-dialog" @close=${t} @cancel=${t}>
      <div class="dialog-head">
        <span>Recent messages</span>
        <button class="icon" title="Close" aria-label="Close" @click=${t}>✕</button>
      </div>
      <div class="dialog-list">
        ${i.messages.length===0?d`<div class="empty">Nothing recorded yet</div>`:i.messages.map(r=>Qe(r,i,e))}
      </div>
    </dialog>
  `}function et(i){let e=i.now??new Date,t=i.messages.length===0,r=i.messages.slice(0,Ze);return d`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <button
          class="history-all"
          data-disabled="${t}"
          ?disabled=${t}
          @click=${()=>i.onDialogOpenChange?.(!0)}
        >
          ${t?"Show all":`Show all \xB7 ${i.messages.length}`}
        </button>
      </div>
      <div class="history-slots">
        ${Array.from({length:Ze},(s,o)=>d`
            <div class="history-slot">
              ${r[o]?Qe(r[o],i,e):o===0&&t?d`<div class="empty">Nothing recorded yet</div>`:c}
            </div>
          `)}
      </div>
      ${i.dialogOpen?Mt(i,e):c}
    </div>
  `}var Tt=K`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path fill="currentColor" d="M8 5v14l11-7z" />
</svg>`,Rt=K`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" />
</svg>`,Ot=K`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
</svg>`;function tt(i){let e=i.playing?"Pause":"Play";return d`
    <div class="player" data-enabled=${i.enabled}>
      <button
        class="icon"
        ?disabled=${!i.enabled}
        title=${e}
        aria-label=${e}
        @click=${i.onToggle}
      >
        ${i.playing?Rt:Tt}
      </button>
      <span class="time"
        >${j(i.position)} / ${j(i.duration)}</span
      >
      <button
        class="icon"
        ?disabled=${!i.enabled}
        title="Clear"
        aria-label="Clear"
        @click=${i.onClear}
      >
        ${Ot}
      </button>
    </div>
  `}var rt=2;function Ut(i,e){if(e.length===0)return"No speakers selected";let t=e.map(o=>i.find(n=>n.entityId===o)?.name??o),r=t.slice(0,rt).join(", "),s=t.length-rt;return s>0?`${r} +${s}`:r}function it(i,e){let t=i.selected.includes(e.entityId);return d`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?c:d`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${t?"\u2713":""}</span>
    </button>
  `}function Lt(i,e){let t=i.selected.includes(e.entityId);return d`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function st(i){let e=d`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${i.selected.length} of ${i.players.length}</span>
    </div>
  `;return i.players.length===0?d`${e}<div class="empty">No speakers found</div>`:i.style==="chips"?d`
      ${e}
      <div class="chips">${i.players.map(t=>Lt(i,t))}</div>
    `:i.style==="dropdown"?d`
      ${e}
      <div class="dropdown">
        <button
          class="dropdown-summary"
          aria-expanded=${i.open}
          @click=${()=>i.onOpenChange(!i.open)}
        >
          <span>${Ut(i.players,i.selected)}</span>
          <span aria-hidden="true">${i.open?"\u25B4":"\u25BE"}</span>
        </button>
        ${i.open?d`
              <!-- Absolutely positioned: an inline panel would push the
                   broadcast button and the history list down the card. -->
              <div class="dropdown-panel">
                ${i.players.map(t=>it(i,t))}
              </div>
            `:c}
      </div>
    `:d`
    ${e}
    <div class="target-rows">${i.players.map(t=>it(i,t))}</div>
  `}function Dt(i){let t=i.currentTarget.getBoundingClientRect();return t.width===0?0:Math.min(1,Math.max(0,(i.clientX-t.left)/t.width))}function ot(i){let e=r=>i.progress!==void 0&&r/i.bars.length<i.progress,t=r=>{i.seekable&&i.onSeek(Dt(r))};return d`
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
  `}function nt(i){return d`
    <div class="volume-row">
      <button
        class="volume-toggle"
        role="checkbox"
        aria-checked=${i.enabled}
        data-on=${i.enabled}
        @click=${()=>i.onToggle()}
      >
        Set volume
      </button>
      ${i.enabled?d`
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.01"
              .value=${String(i.value)}
              aria-label="Broadcast volume"
              @input=${e=>i.onChange(Number(e.target.value))}
            />
            <span class="volume-value">${Math.round(i.value*100)}%</span>
          `:c}
    </div>
  `}var Nt="Voice Broadcast",It=.4,u=class extends b{constructor(){super(...arguments);this.config={type:""};this.phase="idle";this.elapsed=0;this.selected=[];this.history=[];this.bars=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.historyOpen=!1;this.volumeOverride=!1;this.volume=1;this.recorder=new S;this.envelope=new Z;this.busy=!1;this.disconnected=!1;this.stopRequested=!1}setConfig(t){this.config=t,this.selected=t.targets?[...t.targets]:[]}getCardSize(){return this.config.show_history===!1?3:6}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain",record_mode:"push_to_talk",player_list:"rows"}}connectedCallback(){super.connectedCallback(),this.disconnected=!1,S.isSupported()||(this.status={kind:"error",text:Ie}),this.refreshHistory()}updated(){let t=this.renderRoot?.querySelector?.("dialog");t&&!t.open&&t.showModal?.()}disconnectedCallback(){super.disconnectedCallback(),this.disconnected=!0,this.clearTimer(),this.stopPlayback(),ee(this.clip),this.clip=void 0,this.bars=[],this.historyOpen=!1,this.phase==="recording"&&!this.busy&&(this.phase="idle",this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1}))}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}async refreshHistory(){if(!(!this.hass||this.config.show_history===!1))try{this.history=await Le(this.hass)}catch{this.history=[]}}get players(){return Be(X(this.hass),this.config.show_players,this.config.hide_players)}get targets(){return qe(this.selected,this.config.show_players,this.config.hide_players)}get recordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}async onPressStart(t){if(!(this.phase==="sending"||!S.isSupported())){if(this.recordMode==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}t.preventDefault(),!this.busy&&(this.stopRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await this.stopRecording())}}async onPressEnd(){if(this.recordMode==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0;return}await this.stopRecording()}}async startRecording(){if(this.busy||this.phase==="recording")return;this.busy=!0,this.status=void 0;try{this.recorder.onLevel(r=>{this.envelope.push(r,Date.now())&&(this.bars=this.envelope.tail(48))}),this.envelope.reset(),await this.recorder.start()}catch(r){this.fail(ze(r));return}finally{this.busy=!1}if(this.disconnected){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1});return}this.phase="recording",this.elapsed=0;let t=ue(this.config.max_duration);this.timer=window.setInterval(()=>{this.elapsed+=1,this.elapsed>=t&&this.stopRecording()},1e3)}async stopRecording(){if(!(this.busy||this.phase!=="recording")){this.busy=!0,this.clearTimer();try{let{blob:t,duration:r}=await this.recorder.stop();if(this.recordMode==="push_to_talk"&&r<It){this.phase="idle",this.fail("Hold the button while you speak.");return}this.setClip(Ye(t,r,this.envelope.all())),this.phase="idle"}catch(t){this.fail(`Could not finish recording: ${t?.message??t}`),this.phase="idle"}finally{this.busy=!1}}}setClip(t){this.stopPlayback(),this.clip&&this.clip!==t&&ee(this.clip),this.clip=t,this.bars=t.peaks.length?t.peaks:[]}clearClip(){this.stopPlayback(),ee(this.clip),this.clip=void 0,this.bars=[]}seek(t){if(!this.clip)return;this.position=t*this.clip.duration;let r=this.ensureAudio();r&&r.src===this.clip.url&&(r.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let t=this.ensureAudio();if(!(!t||!this.clip)){if(this.playing){t.pause(),this.playing=!1;return}t.src!==this.clip.url&&(t.src=this.clip.url,t.currentTime=this.position),t.play().then(()=>{this.playing=!0},r=>{this.fail(`Could not play that here: ${r?.message??r}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}fail(t){this.status={kind:"error",text:t}}toggleTarget(t){this.selected=this.selected.includes(t)?this.selected.filter(r=>r!==t):[...this.selected,t]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.phase==="idle"}async messageId(t){let r=fe(t);if(r!==void 0)return r;let s=t.source.blob,o=await Ue(this.hass,s,t.duration);return this.clip===t&&(this.clip={...t,source:{kind:"stored",id:o}}),o}async broadcast(){if(this.phase!=="idle")return;let t=this.clip;if(!t){this.fail("Record a message or pick one from below first.");return}let r=this.targets;if(r.length===0){this.fail("Pick at least one speaker first.");return}this.phase="sending",this.status=void 0;try{let s=await this.messageId(t),{failed:o}=await Ne(this.hass,s,r,this.config.mode??"plain",this.volumeOverride?this.volume:void 0);this.phase="idle",o.length===0?this.status={kind:"info",text:`Sent to ${this.describe(r)}`}:o.length>=r.length?this.fail(`Could not play on any speaker: ${this.describe(o)}.`):this.fail(`Played, but not on ${this.describe(o)}.`),await this.refreshHistory()}catch(s){this.phase="idle",this.fail(`Could not send: ${s?.message??s}`)}}async loadMessage(t){this.loadingId=t.id,this.historyOpen=!1,this.status=void 0;try{this.setClip(await Ke(this.hass,t))}catch(r){this.fail(r?.message??String(r))}finally{this.loadingId=void 0}}describe(t){return t.map(r=>this.hass?.states?.[r]?.attributes?.friendly_name??r).join(", ")}async deleteRecording(t){try{await De(this.hass,t)&&await this.refreshHistory()}catch(r){r?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${r?.message??r}`)}}get recordHint(){return this.phase==="recording"?`Recording\u2026 ${this.elapsed}s`:this.phase==="sending"?"Broadcasting\u2026":this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}get recordLabel(){return this.phase==="sending"?"Broadcasting":this.phase==="recording"?this.recordMode==="push_to_talk"?"Recording \u2014 release to stop":"Recording \u2014 tap to stop":this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}render(){return d`
      <ha-card .header=${this.config.title?.trim()||Nt}>
        ${ot({bars:this.bars.length?this.bars:Q(48),progress:this.phase==="recording"?void 0:this.clip?this.position/(this.clip.duration||1):void 0,seekable:this.phase==="idle"&&this.clip!==void 0,recording:this.phase==="recording",onSeek:t=>this.seek(t)})}

        ${tt({enabled:this.phase==="idle"&&this.clip!==void 0,playing:this.playing,position:this.position,duration:this.clip?.duration??0,onToggle:()=>this.togglePlay(),onClear:()=>this.clearClip()})}

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

        ${st({players:this.players.map(t=>({entityId:t,name:this.hass?.states?.[t]?.attributes?.friendly_name??t,available:this.hass?.states?.[t]?.state!=="unavailable"})),selected:this.selected,style:this.config.player_list??"rows",open:this.pickerOpen,onToggle:t=>this.toggleTarget(t),onOpenChange:t=>{this.pickerOpen=t}})}

        ${nt({enabled:this.volumeOverride,value:this.volume,onToggle:()=>{this.volumeOverride=!this.volumeOverride},onChange:t=>{this.volume=t}})}

        <button
          class="broadcast"
          ?disabled=${!this.canBroadcast}
          @click=${this.broadcast}
        >
          ${this.phase==="sending"?"Broadcasting\u2026":"Broadcast"}
        </button>

        ${this.config.show_history===!1?c:et({messages:this.history,loadedId:this.clip?fe(this.clip):void 0,loadingId:this.loadingId,dialogOpen:this.historyOpen,onLoad:t=>void this.loadMessage(t),onDelete:t=>void this.deleteRecording(t),onDialogOpenChange:t=>{this.historyOpen=t}})}
      </ha-card>
    `}};u.styles=Ge,p([M({attribute:!1})],u.prototype,"hass",2),p([m()],u.prototype,"config",2),p([m()],u.prototype,"phase",2),p([m()],u.prototype,"elapsed",2),p([m()],u.prototype,"status",2),p([m()],u.prototype,"selected",2),p([m()],u.prototype,"history",2),p([m()],u.prototype,"clip",2),p([m()],u.prototype,"bars",2),p([m()],u.prototype,"loadingId",2),p([m()],u.prototype,"position",2),p([m()],u.prototype,"playing",2),p([m()],u.prototype,"pickerOpen",2),p([m()],u.prototype,"historyOpen",2),p([m()],u.prototype,"volumeOverride",2),p([m()],u.prototype,"volume",2),u=p([G("hass-broadcast-card")],u);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{u as HassBroadcastCard};
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
