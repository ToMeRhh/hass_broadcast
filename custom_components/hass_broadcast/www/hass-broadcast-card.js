var ni=Object.defineProperty;var ai=Object.getOwnPropertyDescriptor;var u=(i,e,t,r)=>{for(var s=r>1?void 0:r?ai(e,t):e,o=i.length-1,n;o>=0;o--)(n=i[o])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&ni(e,t,s),s};var ee=globalThis,te=ee.ShadowRoot&&(ee.ShadyCSS===void 0||ee.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Pe=Symbol(),Ke=new WeakMap,j=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==Pe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(te&&e===void 0){let r=t!==void 0&&t.length===1;r&&(e=Ke.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Ke.set(t,e))}return e}toString(){return this.cssText}},Ye=i=>new j(typeof i=="string"?i:i+"",void 0,Pe),S=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new j(t,i,Pe)},Ge=(i,e)=>{if(te)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let r=document.createElement("style"),s=ee.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,i.appendChild(r)}},Ee=te?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let r of e.cssRules)t+=r.cssText;return Ye(t)})(i):i;var{is:li,defineProperty:ci,getOwnPropertyDescriptor:di,getOwnPropertyNames:pi,getOwnPropertySymbols:hi,getPrototypeOf:ui}=Object,ie=globalThis,Xe=ie.trustedTypes,mi=Xe?Xe.emptyScript:"",fi=ie.reactiveElementPolyfillSupport,V=(i,e)=>i,W={toAttribute(i,e){switch(e){case Boolean:i=i?mi:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},re=(i,e)=>!li(i,e),Je={attribute:!0,type:String,converter:W,reflect:!1,useDefault:!1,hasChanged:re};Symbol.metadata??=Symbol("metadata"),ie.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Je){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&ci(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){let{get:s,set:o}=di(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let a=s?.call(this);o?.call(this,n),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Je}static _$Ei(){if(this.hasOwnProperty(V("elementProperties")))return;let e=ui(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(V("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(V("properties"))){let t=this.properties,r=[...pi(t),...hi(t)];for(let s of r)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)t.unshift(Ee(s))}else e!==void 0&&t.push(Ee(e));return t}static _$Eu(e,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ge(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:W).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=r.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:W;this._$Em=s;let a=n.fromAttribute(t,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,r,s=!1,o){if(e!==void 0){let n=this.constructor;if(s===!1&&(o=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??re)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:o},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,o]of r){let{wrapped:n}=o,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[V("elementProperties")]=new Map,x[V("finalized")]=new Map,fi?.({ReactiveElement:x}),(ie.reactiveElementVersions??=[]).push("2.1.2");var Re=globalThis,Qe=i=>i,se=Re.trustedTypes,Ze=se?se.createPolicy("lit-html",{createHTML:i=>i}):void 0,Oe="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,De="?"+w,gi=`<${De}>`,T=document,K=()=>T.createComment(""),Y=i=>i===null||typeof i!="object"&&typeof i!="function",Le=Array.isArray,ot=i=>Le(i)||typeof i?.[Symbol.iterator]=="function",Me=`[ 	
\f\r]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,et=/-->/g,tt=/>/g,A=RegExp(`>|${Me}(?:([^\\s"'>=/]+)(${Me}*=${Me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),it=/'/g,rt=/"/g,nt=/^(?:script|style|textarea|title)$/i,ze=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),l=ze(1),at=ze(2),tr=ze(3),P=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),st=new WeakMap,C=T.createTreeWalker(T,129);function lt(i,e){if(!Le(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ze!==void 0?Ze.createHTML(e):e}var ct=(i,e)=>{let t=i.length-1,r=[],s,o=e===2?"<svg>":e===3?"<math>":"",n=F;for(let a=0;a<t;a++){let c=i[a],h,g,p=-1,y=0;for(;y<c.length&&(n.lastIndex=y,g=n.exec(c),g!==null);)y=n.lastIndex,n===F?g[1]==="!--"?n=et:g[1]!==void 0?n=tt:g[2]!==void 0?(nt.test(g[2])&&(s=RegExp("</"+g[2],"g")),n=A):g[3]!==void 0&&(n=A):n===A?g[0]===">"?(n=s??F,p=-1):g[1]===void 0?p=-2:(p=n.lastIndex-g[2].length,h=g[1],n=g[3]===void 0?A:g[3]==='"'?rt:it):n===rt||n===it?n=A:n===et||n===tt?n=F:(n=A,s=void 0);let k=n===A&&i[a+1].startsWith("/>")?" ":"";o+=n===F?c+gi:p>=0?(r.push(h),c.slice(0,p)+Oe+c.slice(p)+w+k):c+w+(p===-2?a:k)}return[lt(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},G=class i{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let o=0,n=0,a=e.length-1,c=this.parts,[h,g]=ct(e,t);if(this.el=i.createElement(h,r),C.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=C.nextNode())!==null&&c.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let p of s.getAttributeNames())if(p.endsWith(Oe)){let y=g[n++],k=s.getAttribute(p).split(w),Z=/([.?@])?(.*)/.exec(y);c.push({type:1,index:o,name:Z[2],strings:k,ctor:Z[1]==="."?ne:Z[1]==="?"?ae:Z[1]==="@"?le:M}),s.removeAttribute(p)}else p.startsWith(w)&&(c.push({type:6,index:o}),s.removeAttribute(p));if(nt.test(s.tagName)){let p=s.textContent.split(w),y=p.length-1;if(y>0){s.textContent=se?se.emptyScript:"";for(let k=0;k<y;k++)s.append(p[k],K()),C.nextNode(),c.push({type:2,index:++o});s.append(p[y],K())}}}else if(s.nodeType===8)if(s.data===De)c.push({type:2,index:o});else{let p=-1;for(;(p=s.data.indexOf(w,p+1))!==-1;)c.push({type:7,index:o}),p+=w.length-1}o++}}static createElement(e,t){let r=T.createElement("template");return r.innerHTML=e,r}};function E(i,e,t=i,r){if(e===P)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl,o=Y(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,r)),r!==void 0?(t._$Co??=[])[r]=s:t._$Cl=s),s!==void 0&&(e=E(i,s._$AS(i,e.values),s,r)),e}var oe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??T).importNode(t,!0);C.currentNode=s;let o=C.nextNode(),n=0,a=0,c=r[0];for(;c!==void 0;){if(n===c.index){let h;c.type===2?h=new U(o,o.nextSibling,this,e):c.type===1?h=new c.ctor(o,c.name,c.strings,this,e):c.type===6&&(h=new ce(o,this,e)),this._$AV.push(h),c=r[++a]}n!==c?.index&&(o=C.nextNode(),n++)}return C.currentNode=T,s}p(e){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},U=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),Y(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==P&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ot(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&Y(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=G.createElement(lt(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{let o=new oe(s,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=st.get(e.strings);return t===void 0&&st.set(e.strings,t=new G(e)),t}k(e){Le(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,s=0;for(let o of e)s===t.length?t.push(r=new i(this.O(K()),this.O(K()),this,this.options)):r=t[s],r._$AI(o),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let r=Qe(e).nextSibling;Qe(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=d}_$AI(e,t=this,r,s){let o=this.strings,n=!1;if(o===void 0)e=E(this,e,t,0),n=!Y(e)||e!==this._$AH&&e!==P,n&&(this._$AH=e);else{let a=e,c,h;for(e=o[0],c=0;c<o.length-1;c++)h=E(this,a[r+c],t,c),h===P&&(h=this._$AH[c]),n||=!Y(h)||h!==this._$AH[c],h===d?e=d:e!==d&&(e+=(h??"")+o[c+1]),this._$AH[c]=h}n&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ne=class extends M{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},ae=class extends M{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}},le=class extends M{constructor(e,t,r,s,o){super(e,t,r,s,o),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??d)===P)return;let r=this._$AH,s=e===d&&r!==d||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==d&&(r===d||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ce=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}},dt={M:Oe,P:w,A:De,C:1,L:ct,R:oe,D:ot,V:E,I:U,H:M,N:ae,U:le,B:ne,F:ce},vi=Re.litHtmlPolyfillSupport;vi?.(G,U),(Re.litHtmlVersions??=[]).push("3.3.3");var pt=(i,e,t)=>{let r=t?.renderBefore??e,s=r._$litPart$;if(s===void 0){let o=t?.renderBefore??null;r._$litPart$=s=new U(e.insertBefore(K(),o),o,void 0,t??{})}return s._$AI(i),s};var Ue=globalThis,b=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=pt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return P}};b._$litElement$=!0,b.finalized=!0,Ue.litElementHydrateSupport?.({LitElement:b});var bi=Ue.litElementPolyfillSupport;bi?.({LitElement:b});(Ue.litElementVersions??=[]).push("4.2.2");var de=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};var yi={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:re},xi=(i=yi,e,t)=>{let{kind:r,metadata:s}=t,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),r==="accessor"){let{name:n}=t;return{set(a){let c=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,c,i,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,i,a),a}}}if(r==="setter"){let{name:n}=t;return function(a){let c=this[n];e.call(this,a),this.requestUpdate(n,c,i,!0,a)}}throw Error("Unsupported decorator location: "+r)};function I(i){return(e,t)=>typeof t=="object"?xi(i,e,t):((r,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(i,e,t)}function f(i){return I({...i,state:!0,attribute:!1})}var ht=i=>(...e)=>({_$litDirective$:i,values:e}),he=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var{I:jr}=dt;var wi={},ut=(i,e=wi)=>i._$AH=e;var mt=ht(class extends he{constructor(){super(...arguments),this.key=d}render(i,e){return this.key=i,e}update(i,[e,t]){return e!==this.key&&(ut(i),this.key=e),t}});async function ft(i,e,t){let r=new FormData;r.append("file",e,"recording.wav"),r.append("duration",String(t));let s=await fetch("/api/hass_broadcast/upload",{method:"POST",body:r,headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!s.ok)throw new Error(`Upload failed (${s.status})`);return(await s.json()).message_id}async function gt(i){return(await i.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function vt(i,e){return(await i.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function bt(i,e,t,r,s){return{failed:(await i.connection.sendMessagePromise({type:"hass_broadcast/send",message_id:e,targets:t,mode:r,...s!==void 0?{volume:s}:{}})).failed}}var ue="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function yt(i){return i?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${i?.message??i?.name??"unknown error"}`}function X(i){return i?.states?Object.keys(i.states).filter(e=>e.startsWith("media_player.")).filter(e=>(i.states[e].attributes.supported_features&512)!==0).sort():[]}function xt(i,e){return e?[...new Set(e)]:i}function wt(i,e){if(!e)return i;let t=new Set(e);return i.filter(r=>t.has(r))}var me="Voice Broadcast";function N(i,e){return e.includes(i)?i:e[0]}function $t(i){if(i===""||i===null||i===void 0)return 60;let e=Number(i);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var $i=["plain","chime","restore"];function kt(i){return N(i,$i)}function Ie(i){let e=N(i.layout,["full","compact"]),t=Array.isArray(i.speakers)?[...new Set(i.speakers)]:void 0,r=t?new Set(t):void 0,s=(Array.isArray(i.selected)?i.selected:[]).filter(o=>!r||r.has(o));return{title:i.title?.trim()||me,layout:e,speakerPicker:e==="compact"?"dropdown":N(i.speaker_picker,["dropdown","chips","list"]),recentMessages:N(i.recent_messages,["button","off","list"]),volumeControl:i.volume_control!==!1,speakers:t,selected:s,recordMode:N(i.record_mode,["push_to_talk","start_stop"]),maxDuration:$t(i.max_duration),noiseSuppression:i.noise_suppression===!0,mode:kt(i.mode)}}function _t(i){return{name:i.name?.trim()||me,speakers:Array.isArray(i.speakers)?[...new Set(i.speakers)]:[],shape:N(i.shape,["square","horizontal"]),maxDuration:$t(i.max_duration),noiseSuppression:i.noise_suppression===!0,mode:kt(i.mode)}}function R(i){let e=t=>{let r=t?{bg:"#2b2b2b",g:"#5f6368",r:"#e2574c",b:"#4fa3e0"}:{bg:"#eef0f3",g:"#c4cbd4",r:"#db4437",b:"#039be5"},s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64" width="120" height="64"><rect width="120" height="64" rx="6" fill="${r.bg}"/>`+i.replace(/\$g/g,r.g).replace(/\$r/g,r.r).replace(/\$b/g,r.b)+"</svg>";return`data:image/svg+xml,${encodeURIComponent(s)}`};return{src:e(!1),src_dark:e(!0)}}var O={full:R('<rect x="14" y="9" width="40" height="5" rx="2.5" fill="$g"/><circle cx="96" cy="11.5" r="3" fill="$g"/><circle cx="105" cy="11.5" r="3" fill="$g"/><circle cx="60" cy="32" r="11" fill="$r"/><circle cx="84" cy="32" r="5" fill="$g"/><rect x="42" y="50" width="36" height="7" rx="3.5" fill="$g"/>'),compact:R('<circle cx="26" cy="32" r="12" fill="$r"/><rect x="46" y="20" width="40" height="5" rx="2.5" fill="$g"/><rect x="104" y="18" width="3" height="9" rx="1.5" fill="$g"/><rect x="46" y="36" width="42" height="9" rx="4.5" fill="$g"/><rect x="92" y="36" width="18" height="9" rx="4.5" fill="$b"/>'),dropdown:R('<rect x="28" y="24" width="64" height="16" rx="8" fill="none" stroke="$g" stroke-width="2"/><rect x="36" y="30" width="34" height="4" rx="2" fill="$g"/><path d="M78 30l4 4 4-4" stroke="$g" stroke-width="2" fill="none"/>'),chips:R('<rect x="14" y="25" width="30" height="14" rx="7" fill="$b"/><rect x="48" y="25" width="26" height="14" rx="7" fill="$g"/><rect x="78" y="25" width="28" height="14" rx="7" fill="$b"/>'),list:R('<rect x="22" y="14" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="13" width="7" height="7" rx="1.5" fill="$b"/><rect x="22" y="29" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="28" width="7" height="7" rx="1.5" fill="$g"/><rect x="22" y="44" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="43" width="7" height="7" rx="1.5" fill="$b"/>'),square:R('<rect x="38" y="6" width="44" height="52" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="60" cy="26" r="10" fill="$r"/><rect x="47" y="43" width="26" height="5" rx="2.5" fill="$g"/>'),horizontal:R('<rect x="12" y="18" width="96" height="28" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="30" cy="32" r="9" fill="$r"/><rect x="46" y="26" width="36" height="5" rx="2.5" fill="$g"/><rect x="46" y="35" width="24" height="4" rx="2" fill="$g"/>')},Ne=i=>({name:i,selector:{entity:{multiple:!0,filter:{domain:"media_player"}}}}),St={name:"max_duration",selector:{number:{min:5,max:300,step:5,mode:"slider",unit_of_measurement:"s"}}},At={name:"noise_suppression",selector:{boolean:{}}},ki={title:"Leave empty for \u201CVoice Broadcast\u201D",name:"Leave empty for \u201CVoice Broadcast\u201D",noise_suppression:"Filters out background noise such as a TV or fan. Leave it off in a quiet room: it can make a voice sound slightly processed."},Ct=i=>ki[i.name],Tt={type:"expandable",name:"",flatten:!0,title:"Playback",icon:"mdi:volume-high",schema:[{name:"mode",selector:{select:{mode:"box",box_max_columns:1,options:[{value:"plain",label:"Just play it",description:"Interrupts whatever is playing"},{value:"chime",label:"Chime first",description:"A short tone, then the message"},{value:"restore",label:"Pause, then resume",description:"Puts back what was playing and its volume"}]}}}]},_i={title:"Name",name:"Name",layout:"Layout",speaker_picker:"Speaker picker",recent_messages:"Recent messages",volume_control:"Volume control",speakers:"Speakers on the card",selected:"Selected when the card opens",record_mode:"Recording",max_duration:"Time limit",noise_suppression:"Noise suppression",mode:"When it plays",shape:"Shape"},Pt=i=>_i[i.name],Et={schema:[{name:"title",selector:{text:{}}},{type:"expandable",name:"",flatten:!0,title:"Appearance",icon:"mdi:palette-outline",expanded:!0,schema:[{name:"layout",selector:{select:{mode:"box",options:[{value:"full",label:"Full",image:O.full},{value:"compact",label:"Compact",image:O.compact}]}}},{name:"speaker_picker",visible:{field:"layout",value:"full"},selector:{select:{mode:"box",options:[{value:"dropdown",label:"Dropdown",image:O.dropdown},{value:"chips",label:"Chips",image:O.chips},{value:"list",label:"List",image:O.list}]}}},{name:"recent_messages",selector:{select:{mode:"dropdown",options:[{value:"off",label:"Off"},{value:"button",label:"Button in the header"},{value:"list",label:"List below the card"}]}}},{name:"volume_control",selector:{boolean:{}}}]},{type:"expandable",name:"",flatten:!0,title:"Speakers",icon:"mdi:speaker",expanded:!0,schema:[Ne("speakers"),Ne("selected")]},{type:"expandable",name:"",flatten:!0,title:"Recording",icon:"mdi:microphone",schema:[{name:"record_mode",selector:{select:{mode:"box",options:[{value:"push_to_talk",label:"Hold to talk",description:"Records while the button is held"},{value:"start_stop",label:"Tap to start and stop",description:"Tap once to start, again to stop"}]}}},St,At]},Tt],computeLabel:Pt,computeHelper:Ct},Mt={schema:[{name:"name",selector:{text:{}}},{type:"expandable",name:"",flatten:!0,title:"Speakers",icon:"mdi:speaker",expanded:!0,schema:[Ne("speakers")]},{type:"expandable",name:"",flatten:!0,title:"Appearance",icon:"mdi:palette-outline",expanded:!0,schema:[{name:"shape",selector:{select:{mode:"box",options:[{value:"square",label:"Square",image:O.square},{value:"horizontal",label:"Horizontal",image:O.horizontal}]}}}]},{type:"expandable",name:"",flatten:!0,title:"Recording",icon:"mdi:microphone",schema:[St,At]},Tt],computeLabel:i=>i.name==="speakers"?"Sends to":Pt(i),computeHelper:Ct};function _(i){let e=Number.isFinite(i)&&i>0?Math.floor(i):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function Rt(i,e){return i.getFullYear()===e.getFullYear()&&i.getMonth()===e.getMonth()&&i.getDate()===e.getDate()}function Be(i){return i.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Ot(i,e=new Date){let t=new Date(i);if(Number.isNaN(t.getTime()))return"Unknown time";let r=(e.getTime()-t.getTime())/1e3;if(r<60)return"Just now";if(r<3600){let n=Math.round(r/60);return`${n} minute${n===1?"":"s"} ago`}if(Rt(t,e))return`Today ${Be(t)}`;let s=new Date(e);return s.setDate(e.getDate()-1),Rt(t,s)?`Yesterday ${Be(t)}`:`${t.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${Be(t)}`}function Dt(i){return Number.isFinite(i)?Math.min(1,Math.max(0,i)):0}function ge(i){return new Array(Math.max(0,i)).fill(0)}function Lt(i,e){if(e<=0)return[];if(i.length===0)return ge(e);let t=[];for(let r=0;r<e;r++){let s=Math.floor(r*i.length/e),o=Math.max(s+1,Math.floor((r+1)*i.length/e)),n=0;for(let a=s;a<o&&a<i.length;a++)n=Math.max(n,i[a]);t.push(n)}return t}function qe(i){let e=i.reduce((t,r)=>Math.max(t,r),0);return e<=0?[...i]:i.map(t=>t/e)}function ve(i,e){let t=[];for(let r=0;r<e;r++){let s=Math.floor(r*i.length/e),o=Math.floor((r+1)*i.length/e),n=0;for(let a=s;a<o;a++)n=Math.max(n,Math.abs(i[a]));t.push(n)}return qe(t)}var fe=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,t){if(this.windowStart===void 0)return this.windowStart=t,this.pending=Dt(e),!1;let r=!1;return t-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=t,r=!0),this.pending=Math.max(this.pending,Dt(e)),r}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let t=this.peaks.slice(-e);return[...ge(e-t.length),...t]}};function zt(i,e){let t=i.length*2,r=new ArrayBuffer(44+t),s=new DataView(r),o=(n,a)=>{for(let c=0;c<a.length;c++)s.setUint8(n+c,a.charCodeAt(c))};return o(0,"RIFF"),s.setUint32(4,36+t,!0),o(8,"WAVE"),o(12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,e,!0),s.setUint32(28,e*2,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),o(36,"data"),s.setUint32(40,t,!0),new Int16Array(r,44).set(i),new Blob([r],{type:"audio/wav"})}var be=[48e3,32e3,24e3,16e3],Si=10*1024*1024,Ai=44,Ci=1,He=300,Ti=250,Pi=.89*32767,Ei=10,Mi="/api/hass_broadcast/static/recorder-worklet.js",Ri={channelCount:1,echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},J=class{constructor(){this.chunks=[];this.active=!1;this.options={}}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}get trackSettings(){return this.stream?.getAudioTracks()[0]?.getSettings()}async start(e,t={}){this.chunks=[],this.options=t;try{this.stream=await navigator.mediaDevices.getUserMedia({audio:t.constraints??{...Ri,noiseSuppression:t.noiseSuppression??!1}}),this.context=new AudioContext({sampleRate:t.sampleRate??Oi(e)}),await this.context.audioWorklet.addModule(Mi);let r=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=s=>{if(s.data==="flushed"){this.flushed?.();return}this.chunks.push(s.data),this.levelCallback&&this.levelCallback(Li(s.data))},r.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(r){throw await this.release(),r}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");this.active=!1,await new Promise(a=>setTimeout(a,this.options.stopTail??He)),await this.flush();let e=this.context?.sampleRate??be[0],t=this.chunks,r=this.options.normalize??!0;await this.release();let s=t.reduce((a,c)=>a+c.length,0),o=new Int16Array(s),n=0;for(let a of t)o.set(a,n),n+=a.length;return r&&Di(o),{blob:zt(o,e),duration:s/e,peaks:ve(o,48)}}flush(){let e=this.node;return e?new Promise(t=>{let r=setTimeout(t,Ti);this.flushed=()=>{clearTimeout(r),t()},e.port.postMessage("flush")}):Promise.resolve()}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1,this.flushed=void 0}}};function Oi(i){let e=r=>r*2,t=r=>Ai+e(r)*(i+Ci)<=Si;return be.find(t)??be[be.length-1]}function Di(i){let e=0;for(let r of i)e=Math.max(e,Math.abs(r));if(e===0)return;let t=Math.min(Ei,Pi/e);if(!(t<=1))for(let r=0;r<i.length;r++)i[r]=Math.round(i[r]*t)}function Li(i){let e=0;for(let t of i)e=Math.max(e,Math.abs(t));return e/32768}var zi=.4,Ui=zi+He/1e3,q=class{constructor(e,t){this.host=e;this.options=t;this.phase="idle";this.elapsed=0;this.level=0;this.recorder=new J;this.envelope=new fe;this.busy=!1;this.disconnected=!1;this.stopRequested=!1;this.discardRequested=!1;e.addController(this)}get supported(){return J.isSupported()}hostConnected(){this.disconnected=!1}hostDisconnected(){this.disconnected=!0,this.clearTimer(),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.level=0,this.release())}setSending(e){this.phase=e?"sending":"idle",this.host.requestUpdate()}async onPressStart(e){if(!(this.phase==="sending"||!this.supported)){if(this.options.recordMode()==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}e.preventDefault(),!this.busy&&(this.stopRequested=!1,this.discardRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await(this.discardRequested?this.discard():this.stopRecording()))}}async onPressEnd(e=!1){if(this.options.recordMode()==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0,this.discardRequested=e;return}await(e?this.discard():this.stopRecording())}}discard(){this.busy||this.phase!=="recording"||(this.clearTimer(),this.phase="idle",this.level=0,this.release(),this.options.onDiscard?.(),this.host.requestUpdate())}async startRecording(){if(this.busy||this.phase!=="idle")return;this.busy=!0,this.options.onStart?.();try{this.recorder.onLevel(t=>{this.phase==="recording"&&this.envelope.push(t,Date.now())&&(this.level=this.envelope.tail(1)[0],this.host.requestUpdate())}),this.envelope.reset(),await this.recorder.start(this.options.maxDuration(),{noiseSuppression:this.options.noiseSuppression?.()??!1})}catch(t){this.options.onError(yt(t),t?.name==="NotAllowedError"),this.host.requestUpdate();return}finally{this.busy=!1}if(this.disconnected){this.release();return}this.phase="recording",this.elapsed=0,this.level=0,this.host.requestUpdate();let e=this.options.maxDuration();this.timer=window.setInterval(()=>{this.elapsed+=1,this.host.requestUpdate(),this.elapsed>=e&&this.stopRecording()},1e3)}async stopRecording(){if(this.busy||this.phase!=="recording")return;this.busy=!0,this.clearTimer(),this.phase="finishing",this.level=0,this.host.requestUpdate();let e;try{let{blob:t,duration:r,peaks:s}=await this.recorder.stop();this.phase="idle",this.options.recordMode()==="push_to_talk"&&r<Ui?this.options.onError("Hold the button while you speak.",!1):e={blob:t,duration:r,peaks:s}}catch(t){this.phase="idle",this.options.onError(`Could not finish recording: ${t?.message??t}`,!1)}finally{this.busy=!1,this.level=0,this.host.requestUpdate()}e&&await this.options.onTake(e)}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}release(){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1})}};function Ut(i,e,t){return{source:{kind:"fresh",blob:i},url:URL.createObjectURL(i),duration:e,peaks:qe(Lt(t,48))}}function H(i){return i.source.kind==="stored"?i.source.id:void 0}var Ii=async(i,e)=>{let t=globalThis.AudioContext??globalThis.webkitAudioContext;if(!t)return[];let r=new t;try{let s=await r.decodeAudioData(await i.arrayBuffer());return ve(s.getChannelData(0),e)}finally{await r.close?.()}};async function It(i,e,t=Ii){let r=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!r.ok)throw new Error(`Could not load that recording (${r.status})`);let s=await r.blob(),o=[];try{o=await t(s,48)}catch{o=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(s),duration:e.duration,peaks:o}}function ye(i){i&&URL.revokeObjectURL(i.url)}async function xe(i){let{hass:e,clip:t,targets:r}=i,s=H(t);if(s===void 0){let n=t.source.blob;s=await ft(e,n,t.duration),i.onStored?.(s)}let{failed:o}=await bt(e,s,r,i.mode,i.volume);return o.length===0?{kind:"sent",targets:r}:o.length>=r.length?{kind:"failed",failed:o}:{kind:"partial",failed:o}}function D(i,e){return e.map(t=>i?.states?.[t]?.attributes?.friendly_name??t).join(", ")}function we(i,e){switch(e.kind){case"sent":return{kind:"info",text:`Sent to ${D(i,e.targets)}`};case"partial":return{kind:"error",text:`Played, but not on ${D(i,e.failed)}.`};case"failed":return{kind:"error",text:`Could not play on any speaker: ${D(i,e.failed)}.`}}}var je=S`
  .mic-wrap {
    --mic-color: var(--error-color, #db4437);
    position: relative;
    display: grid;
    place-items: center;
    width: var(--mic);
    height: var(--mic);
  }
  .mic-wrap > * {
    grid-area: 1 / 1;
  }

  .mic {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: var(--mic);
    height: var(--mic);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--mic-color);
    color: #fff;
    box-shadow: 0 6px 18px color-mix(in srgb, var(--mic-color) 35%, transparent);
    cursor: pointer;
    /* Stops the browser claiming the gesture as a scroll or a long-press. */
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: box-shadow 180ms ease, background 180ms ease;
  }
  .mic[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    box-shadow: none;
    cursor: default;
  }
  .mic:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 4px;
  }
  .mic-wrap[data-recording="true"] .mic {
    box-shadow: none;
  }
  .mic-glyph {
    grid-area: 1 / 1;
    display: grid;
    place-items: center;
    width: 42%;
    height: 42%;
    transition: opacity 180ms ease, transform 180ms ease;
  }
  .mic-glyph svg {
    width: 100%;
    height: 100%;
  }
  .mic-glyph-stop {
    opacity: 0;
    transform: scale(0.6);
  }
  /* Start-stop needs a visible "tap again to stop"; push-to-talk does not,
     because the finger is already on the button. */
  .mic-wrap[data-mode="start_stop"][data-recording="true"] .mic-glyph-mic {
    opacity: 0;
    transform: scale(0.6);
  }
  .mic-wrap[data-mode="start_stop"][data-recording="true"] .mic-glyph-stop {
    opacity: 1;
    transform: none;
  }

  /* The blob: scale follows the voice (--grow), shape wobbles on its own.
     Two layers so the outline never reads as a plain circle. */
  .mic-level {
    z-index: 1;
    position: relative;
    width: var(--mic);
    height: var(--mic);
    opacity: 0;
    transform: scale(1);
    transition: opacity 200ms ease, transform 90ms linear;
    pointer-events: none;
  }
  .mic-wrap[data-recording="true"] .mic-level {
    opacity: 1;
    transform: scale(var(--grow, 1));
  }
  /* Absolutely centred rather than grid-centred: the blobs are larger than
     the button, and a grid item that overflows its track is aligned to the
     start, not the middle. \`translate\` is kept apart from the \`transform\`
     the spin animates. */
  .blob {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    background: radial-gradient(
      circle at 30% 30%,
      color-mix(in srgb, var(--mic-color) 55%, #fff),
      var(--mic-color) 65%
    );
  }
  .blob-inner {
    width: calc(var(--mic) * 1.12);
    height: calc(var(--mic) * 1.12);
    opacity: 0.32;
    animation: blob-shape 4s ease-in-out infinite, blob-spin 9s linear infinite;
  }
  .blob-outer {
    width: calc(var(--mic) * 1.22);
    height: calc(var(--mic) * 1.22);
    opacity: 0.16;
    animation: blob-shape 5s ease-in-out infinite alternate,
      blob-spin 13s linear infinite reverse;
  }
  @keyframes blob-shape {
    0%,
    100% {
      border-radius: 42% 58% 63% 37% / 45% 40% 60% 55%;
    }
    33% {
      border-radius: 60% 40% 35% 65% / 55% 62% 38% 45%;
    }
    66% {
      border-radius: 38% 62% 55% 45% / 62% 38% 62% 38%;
    }
  }
  @keyframes blob-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* The countdown: a white arc on the button's rim that closes over
     max_duration. Attached only while recording, so it restarts per take. */
  .mic-arc {
    z-index: 3;
    width: var(--mic);
    height: var(--mic);
    transform: rotate(-90deg);
    opacity: 0;
    transition: opacity 200ms ease;
    pointer-events: none;
  }
  .mic-arc circle {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
  }
  .mic-arc-track {
    stroke: rgba(255, 255, 255, 0.25);
  }
  .mic-arc-fill {
    stroke: #fff;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  .mic-wrap[data-recording="true"] .mic-arc {
    opacity: 1;
  }
  .mic-wrap[data-recording="true"] .mic-arc-fill {
    animation: mic-countdown var(--limit, 60s) linear forwards;
  }
  @keyframes mic-countdown {
    from {
      stroke-dashoffset: 100;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .blob {
      animation: none;
      border-radius: 50%;
    }
    .mic-level,
    .mic-wrap[data-recording="true"] .mic-level {
      transform: none;
      transition: none;
    }
    .mic-glyph {
      transition: none;
    }
    /* The countdown keeps running: it carries information, not decoration. */
  }
`,Ve=S`
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .icon svg {
    width: 20px;
    height: 20px;
  }
  .icon:hover:not([disabled]) {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .icon[disabled] {
    color: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .icon[data-active="true"] {
    color: var(--primary-color);
  }
  .icon:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  /* Harness-only: outline every fixed slot. */
  :host([data-show-slots]) .slot {
    outline: 1.5px dashed #d946ef;
    outline-offset: 1px;
  }
`,Nt=[je,Ve,S`
    ha-card {
      padding: 16px;
    }
    .card {
      position: relative;
    }
    .title {
      overflow: hidden;
      font-size: 1.05em;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      white-space: nowrap;
    }
    .caption {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }

    /* --- layered slots ---------------------------------------------- */
    .layers {
      display: grid;
      min-width: 0;
    }
    .layer {
      grid-area: 1 / 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
    }
    .layer[data-on="true"] {
      opacity: 1;
      pointer-events: auto;
    }
    .status {
      overflow: hidden;
      font-size: 0.85em;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .status.error {
      color: var(--error-color, #db4437);
    }
    .status.info {
      color: var(--secondary-text-color);
    }
    .timer {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      color: var(--error-color, #db4437);
      transition: color 300ms ease;
    }
    .timer::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .timer[data-warning="true"] {
      color: var(--warning-color, #ff9800);
    }
    .clip-length {
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }

    /* --- waveform ----------------------------------------------------- */
    .wave {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      gap: 2px;
      min-width: 0;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      /* Seeking is horizontal-only; vertical panning stays with the page. */
      touch-action: pan-y;
    }
    .wave.seekable {
      cursor: pointer;
    }
    .wave-strip {
      height: 36px;
    }
    .wave-mini {
      height: 28px;
      padding: 0 4px;
      border-radius: 8px;
    }
    .bar {
      flex: 1;
      min-width: 1px;
      border-radius: 2px;
      background: var(--divider-color, #ddd);
    }
    .bar.played {
      background: var(--primary-color, #03a9f4);
    }
    .wave .bar:not(.played) {
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 45%, transparent);
    }
    /* Drawn in once per clip (the element is keyed on it): bars grow from
       the centre line, left to right. */
    .wave.reveal .bar {
      animation: bar-in 280ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
      animation-delay: calc(var(--i, 0) * 12ms + 100ms);
    }
    @keyframes bar-in {
      from {
        transform: scaleY(0.05);
      }
      to {
        transform: scaleY(1);
      }
    }

    /* --- send --------------------------------------------------------- */
    /* Both side slots share one shape — a 56px button row, then a caption —
       so Discard and Send line up whatever their button sizes. */
    .send-wrap,
    .pop {
      display: grid;
      grid-template-rows: 56px auto;
      justify-items: center;
      align-items: center;
      gap: 2px;
    }
    .send-wrap-pill {
      display: block;
    }
    .send {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0;
      border: none;
      font: inherit;
      font-weight: 500;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      cursor: pointer;
      transition: background 180ms ease, color 180ms ease;
    }
    .send svg {
      width: 22px;
      height: 22px;
    }
    .send-round {
      width: 56px;
      height: 56px;
      border-radius: 50%;
    }
    .send-pill {
      width: 84px;
      height: 32px;
      border-radius: 16px;
      font-size: 0.9em;
    }
    .send-pill svg {
      width: 16px;
      height: 16px;
    }
    /* Always rendered, so users learn where it is before they need it. */
    .send[disabled] {
      background: var(--secondary-background-color, #e5e8ee);
      color: var(--disabled-text-color, #9aa3af);
      cursor: default;
    }
    .send[data-sending="true"] {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    .send:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 3px;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 800ms linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* --- full layout --------------------------------------------------- */
    .full .head {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 36px;
    }
    .full .head .title {
      flex: 1;
    }
    .head-actions {
      display: flex;
      gap: 2px;
    }
    .full .strip {
      height: 40px;
      margin-top: 8px;
    }
    .full .strip .layer-idle,
    .full .strip .layer-recording,
    .full .strip .layer-status {
      justify-content: center;
    }
    .full .strip .play {
      width: 36px;
      height: 36px;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    }
    .core {
      display: grid;
      grid-template-columns: 1fr 120px 1fr;
      align-items: center;
      height: 132px;
    }
    .core-side {
      display: flex;
      justify-content: center;
    }
    .core-mic {
      display: grid;
      place-items: center;
    }
    .pop {
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 180ms ease, transform 180ms ease;
    }
    .pop[data-on="true"] {
      opacity: 1;
      transform: none;
    }
    .pop .discard {
      width: 44px;
      height: 44px;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    }
    .section {
      margin-top: 8px;
    }
    .section-speakers[data-style="dropdown"] {
      display: flex;
      justify-content: center;
    }

    /* --- compact layout ------------------------------------------------ */
    .compact {
      display: grid;
      grid-template-columns: 72px 1fr;
      gap: 14px;
      align-items: center;
    }
    .compact-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }
    .compact-row {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 32px;
    }
    .compact-status {
      flex: 1;
      height: 32px;
    }
    .compact-status .layer-idle {
      gap: 10px;
    }
    .compact-status .icon {
      width: 30px;
      height: 30px;
    }
    .compact-status .icon svg {
      width: 18px;
      height: 18px;
    }
    .compact-speakers {
      flex: 1;
      min-width: 0;
    }
    .compact .pill-wrap {
      width: 100%;
    }
    .compact .pill {
      width: 100%;
    }

    /* --- popovers and the compact menu --------------------------------- */
    .popover-wrap {
      position: relative;
    }
    .popover {
      position: absolute;
      z-index: 4;
      top: calc(100% + 4px);
      right: 0;
      min-width: 240px;
      padding: 8px;
      border-radius: 12px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    .menu {
      padding: 4px 0;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 44px;
      padding: 4px 14px;
      box-sizing: border-box;
      font: inherit;
      text-align: left;
      border: none;
      background: none;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .menu-item > svg {
      flex: none;
      width: 20px;
      height: 20px;
      color: var(--secondary-text-color);
    }
    button.menu-item:hover {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    }
    .menu-volume {
      cursor: default;
    }
    .menu-volume .volume-row {
      flex: 1;
    }

    /* --- volume override ----------------------------------------------- */
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
      white-space: nowrap;
    }
    .volume-toggle[data-on="true"] {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .volume-slider {
      flex: 1;
      min-width: 0;
    }
    .volume-value {
      min-width: 4ch;
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }

    /* --- section heads ------------------------------------------------- */
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

    /* --- speakers: pill ------------------------------------------------ */
    .pill-wrap {
      position: relative;
      max-width: 100%;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 100%;
      height: 32px;
      padding: 0 8px 0 12px;
      box-sizing: border-box;
      font: inherit;
      font-size: 0.85em;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 16px;
      background: none;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .pill[disabled] {
      color: var(--secondary-text-color);
      cursor: default;
    }
    .pill-icon svg,
    .pill-chevron svg {
      display: block;
      width: 16px;
      height: 16px;
      color: var(--secondary-text-color);
    }
    .pill-text {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pill-panel {
      position: absolute;
      z-index: 4;
      top: calc(100% + 4px);
      left: 50%;
      width: min(300px, 90vw);
      max-height: 260px;
      overflow-y: auto;
      padding: 4px 8px 8px;
      box-sizing: border-box;
      transform: translateX(-50%);
      border-radius: 12px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    .compact .pill-panel {
      left: 0;
      transform: none;
    }

    /* --- speakers: rows ------------------------------------------------ */
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

    /* --- speakers: chips ----------------------------------------------- */
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      padding: 6px 12px;
      font: inherit;
      font-size: 0.9em;
      border-radius: 16px;
      border: 1px solid var(--divider-color, #ddd);
      background: none;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .chip[data-on="true"] {
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent);
      border-color: transparent;
      color: var(--primary-color, #03a9f4);
      font-weight: 500;
    }

    /* --- history ------------------------------------------------------- */
    .history {
      border-top: 1px solid var(--divider-color, #ddd);
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

    /* --- history dialog ------------------------------------------------ */
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

    @media (prefers-reduced-motion: reduce) {
      .layer,
      .pop,
      .send,
      .timer {
        transition: none;
      }
      .wave.reveal .bar {
        animation: none;
      }
    }
  `];var v=i=>at`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d=${i} /></svg>`,Bt=v("M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z"),qt=v("M7 7h10v10H7z"),Ht=v("M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"),jt=v("M8 5v14l11-7z"),Vt=v("M6 5h4v14H6zm8 0h4v14h-4z"),$e=v("M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"),ke=v("M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"),_e=v("M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"),Wt=v("M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"),Q=v("M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2a2 2 0 0 1 0-4zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"),Ft=v("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"),Kt=v("M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"),Se=v("M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5-1-1h-5l-1 1H5v2h14V4h-3.5z"),Yt=v("M7 10l5 5 5-5z");function Ni(i){let e=i.currentTarget;try{e?.setPointerCapture?.(i.pointerId)}catch{}}var Bi=.35;function Ae(i){let e=Math.min(1,Math.max(0,i.level||0)),t=typeof i.size=="number"?`${i.size}px`:i.size;return l`
    <div
      class="mic-wrap"
      data-recording=${i.recording}
      data-mode=${i.recordMode}
      style="--mic:${t};--grow:${(1+e*Bi).toFixed(3)};--limit:${i.maxDuration}s"
    >
      <div class="mic-level" aria-hidden="true">
        <span class="blob blob-outer"></span>
        <span class="blob blob-inner"></span>
      </div>
      <button
        class="mic"
        ?disabled=${i.disabled}
        @pointerdown=${r=>{i.recordMode==="push_to_talk"&&Ni(r),i.onPressStart(r)}}
        @pointermove=${r=>i.onPressMove?.(r)}
        @pointerup=${r=>i.onPressEnd(r)}
        @pointercancel=${r=>i.onPressEnd(r)}
        @contextmenu=${r=>r.preventDefault()}
        @keydown=${r=>{!r.repeat&&(r.key===" "||r.key==="Enter")&&i.onPressStart(r)}}
        @keyup=${r=>{(r.key===" "||r.key==="Enter")&&i.onPressEnd()}}
        title=${i.label}
        aria-label=${i.label}
      >
        <span class="mic-glyph mic-glyph-mic">${Bt}</span>
        <span class="mic-glyph mic-glyph-stop">${qt}</span>
      </button>
      <svg class="mic-arc" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="mic-arc-track" cx="50" cy="50" r="46" pathLength="100" />
        <circle class="mic-arc-fill" cx="50" cy="50" r="46" pathLength="100" />
      </svg>
    </div>
  `}function Ce(i){return i?l`<span class="status ${i.kind}" title=${i.text}>${i.text}</span>`:d}function L(i,e){return l`<span class="timer" data-warning=${e}>${i}</span>`}function z(i,e,t){return l`
    <div class="layers slot ${i}" data-active=${e}>
      ${Object.keys(t).map(r=>l`
          <div
            class="layer layer-${r}"
            data-on=${r===e}
            ?inert=${r!==e}
            aria-hidden=${r!==e}
          >
            ${t[r]}
          </div>
        `)}
    </div>
  `}var qi=2500,Hi="max(52px, min(100cqw, 100cqh) * 0.6)",Te=8,$=class extends b{constructor(){super(...arguments);this.config={type:""};this.overBin=!1;this.rec=new q(this,{recordMode:()=>"push_to_talk",maxDuration:()=>this.resolved.maxDuration,noiseSuppression:()=>this.resolved.noiseSuppression,onStart:()=>this.showResult(void 0),onError:t=>this.showResult({kind:"failed",text:ji(t),detail:t}),onTake:t=>this.send(t),onDiscard:()=>this.showResult({kind:"discarded",text:"Discarded",detail:"Discarded, not sent."})});this.onKeyDown=t=>{t.key==="Escape"&&this.rec.phase==="recording"&&(this.overBin=!1,this.rec.onPressEnd(!0))}}setConfig(t){this.config=t}get resolved(){return _t(this.config)}get shape(){return this.resolved.shape}get targets(){return this.resolved.speakers}getCardSize(){return this.shape==="square"?3:1}getGridOptions(){return this.shape==="square"?{rows:2,columns:3,min_rows:2,min_columns:3}:{rows:1,columns:6,min_rows:1,max_rows:1,min_columns:4}}static getConfigForm(){return Mt}static getStubConfig(t){let r=X(t)[0];return{type:"custom:hass-broadcast-tile",name:me,speakers:r?[r]:[],shape:"square",max_duration:60,mode:"plain"}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this.onKeyDown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onKeyDown),this.clearResultTimer(),this.result=void 0}isOverBin(t){let r=this.renderRoot.querySelector(".bin");if(!r)return!1;let s=r.getBoundingClientRect();return t.clientX>=s.left-Te&&t.clientX<=s.right+Te&&t.clientY>=s.top-Te&&t.clientY<=s.bottom+Te}onPressMove(t){this.overBin=this.rec.phase==="recording"&&this.isOverBin(t)}onPressEnd(t){let r=t!==void 0&&this.isOverBin(t);this.overBin=!1,this.rec.onPressEnd(r)}clearResultTimer(){this.resultTimer!==void 0&&(window.clearTimeout(this.resultTimer),this.resultTimer=void 0)}showResult(t){this.clearResultTimer(),this.result=t,t&&(this.resultTimer=window.setTimeout(()=>{this.resultTimer=void 0,this.result=void 0},qi))}async send(t){if(this.targets.length===0){this.showResult({kind:"failed",text:"No speakers set",detail:"Pick speakers in the card editor."});return}this.rec.setSending(!0);try{let r=await xe({hass:this.hass,clip:{source:{kind:"fresh",blob:t.blob},url:"",duration:t.duration,peaks:[]},targets:this.targets,mode:this.resolved.mode});this.showResult(this.describe(r))}catch(r){let s=`Could not send: ${r?.message??r}`;this.showResult({kind:"failed",text:"Not sent",detail:s})}finally{this.rec.setSending(!1)}}describe(t){let r=we(this.hass,t).text;switch(t.kind){case"sent":return{kind:"sent",text:"Sent",detail:r};case"partial":return{kind:"partial",text:`Not on ${D(this.hass,t.failed)}`,detail:r};case"failed":return{kind:"failed",text:"Not sent",detail:r}}}get idleText(){if(!this.rec.supported)return l`<span>Needs HTTPS</span>`;if(!this.targets.length)return l`<span>Pick speakers in the card editor</span>`;let t=D(this.hass,this.targets);return l`${Q}<span title=${t}>${t}</span>`}render(){let t=this.rec.phase==="recording",r=this.rec.phase==="sending"||this.rec.phase==="finishing",{name:s,maxDuration:o}=this.resolved,n=t&&o-this.rec.elapsed<=Math.min(10,o*.25),a=t&&this.overBin,c=a?"armed":t?"recording":r?"sending":this.result?.kind??"idle",h=p=>l`${p}<span title=${this.result?.detail??""}>${this.result?.text??""}</span>`,g=t?"Recording \u2014 release to send, Escape to discard":this.targets.length?`Hold to talk to ${D(this.hass,this.targets)}`:"Hold to talk";return l`
      <ha-card>
        <div
          class="tile ${this.shape}"
          data-recording=${t}
          data-armed=${a}
          title=${this.rec.supported?"":ue}
        >
          <div class="slot">
            ${Ae({size:this.shape==="square"?Hi:40,recording:t,disabled:!this.rec.supported||r||this.targets.length===0,recordMode:"push_to_talk",level:this.rec.level,maxDuration:o,label:g,onPressStart:p=>{this.rec.onPressStart(p)},onPressEnd:p=>this.onPressEnd(p),onPressMove:p=>this.onPressMove(p)})}
          </div>
          <div class="text">
            ${this.shape==="square"?z("tile-name",t?"timer":"name",{name:l`<span class="name">${s}</span>`,timer:L(_(this.rec.elapsed),n)}):l`<span class="name">${s}</span>`}
            ${z("tile-status",c,{idle:this.idleText,recording:L(_(this.rec.elapsed),n),armed:l`<span>Release to discard</span>`,sending:l`<span>Sending…</span>`,sent:h(Ft),partial:h(Kt),failed:h($e),discarded:h(Se)})}
          </div>
          <div class="bin" data-on=${t} data-armed=${a} aria-hidden="true">
            ${this.shape==="square"?l`${Se}<span>Discard</span>`:Se}
          </div>
        </div>
        <div class="sr-only" aria-live="polite">${this.result?.detail??""}</div>
      </ha-card>
    `}};$.styles=[je,Ve,S`
      ha-card {
        height: 100%;
        box-sizing: border-box;
        overflow: visible;
      }
      .tile {
        position: relative;
        display: grid;
        height: 100%;
        box-sizing: border-box;
        align-items: center;
      }
      /* Button, name, status line. The status line, which the bin covers
         mid-take, grows with a taller tile so the bin is easier to reach:
         its 18px at 3×2, 32px at three rows, and 44px from four. Where the
         tile's height is not fixed (masonry) the percentage cannot resolve
         and the row is just its content. */
      .tile.square {
        grid-template-rows: 1fr auto clamp(18px, 18px + (100% - 100px) / 4.5, 44px);
        justify-items: center;
        row-gap: 4px;
        padding: 12px 8px 8px;
        text-align: center;
      }
      .square > .text {
        display: contents;
      }
      .square .tile-name,
      .square .tile-status {
        justify-self: stretch;
        min-width: 0;
      }
      /* Placed, since the bin claims the same cell. */
      .square .tile-status {
        grid-row: 3;
        grid-column: 1;
      }
      /* The button's cell is a size container, so the button can follow the
         tile as it is resized; see SQUARE_MIC. */
      .tile.square > .slot {
        container-type: size;
        align-self: stretch;
        justify-self: stretch;
        display: grid;
        place-items: center;
        margin-bottom: 2px;
      }
      .tile.horizontal {
        grid-template-columns: auto 1fr;
        gap: 12px;
        padding: 8px 12px;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 100%;
      }
      .name {
        overflow: hidden;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .layers {
        display: grid;
      }
      .tile-status {
        min-height: 18px;
        transition: opacity 180ms ease;
      }
      .horizontal .tile-status {
        height: 18px;
      }
      /* Under a square tile's bin; the name line shows the timer instead.
         Hidden, not just covered: a bin still fading in, or one whose
         background a browser without color-mix() drops, would show it
         through. */
      .square[data-recording="true"] .tile-status {
        opacity: 0;
        transition: none;
      }
      /* A square tile's name line, which turns into the timer mid-take. */
      .tile-name > .layer {
        font-size: inherit;
        color: inherit;
      }
      .layer {
        grid-area: 1 / 1;
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
        overflow: hidden;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 180ms ease;
      }
      .square .layer {
        justify-content: center;
      }
      .layer[data-on="true"] {
        opacity: 1;
      }
      .layer span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .layer svg {
        flex: none;
        width: 14px;
        height: 14px;
      }
      .layer-sent {
        color: var(--success-color, #43a047);
      }
      .layer-partial {
        color: var(--warning-color, #ff9800);
      }
      .layer-failed,
      .layer-armed {
        color: var(--error-color, #db4437);
      }
      /* Reserved in both shapes and only shown mid-take, so nothing moves:
         over a square tile's status line, at the end of a horizontal one.
         Opaque, since it covers text. */
      .bin {
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        box-sizing: border-box;
        border: 1.5px dashed var(--divider-color, #bdbdbd);
        background: color-mix(
          in srgb,
          var(--secondary-text-color, #727272) 12%,
          var(--card-background-color, var(--ha-card-background, #fff))
        );
        color: var(--secondary-text-color, #727272);
        opacity: 0;
        pointer-events: none;
        transition: opacity 180ms ease, background 180ms ease, color 180ms ease;
      }
      .bin[data-on="true"] {
        opacity: 1;
      }
      .bin[data-armed="true"] {
        border-color: transparent;
        background: var(--error-color, #db4437);
        color: #fff;
      }
      .bin svg {
        flex: none;
        width: 18px;
        height: 18px;
      }
      /* The status line's row and 2px past it each way, so its text sits
         where the line's does and it grows with the row: no further, since
         the blob around a 3×2 tile's button reaches past the name. */
      .square > .bin {
        grid-row: 3;
        grid-column: 1;
        align-self: stretch;
        justify-self: stretch;
        margin: -2px 0;
        gap: 3px;
        border-radius: 24px;
        font-size: 0.8em;
        white-space: nowrap;
      }
      .square > .bin svg {
        width: 14px;
        height: 14px;
      }
      .horizontal > .bin {
        position: absolute;
        top: 50%;
        right: 12px;
        width: 36px;
        height: 36px;
        margin-top: -18px;
        border-radius: 50%;
      }
      .tile[data-armed="true"] .mic-wrap {
        --mic-color: var(--disabled-text-color, #9e9e9e);
      }
      .timer {
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        color: var(--error-color, #db4437);
      }
      .timer[data-warning="true"] {
        color: var(--warning-color, #ff9800);
      }
      @media (prefers-reduced-motion: reduce) {
        .tile-status,
        .layer,
        .bin {
          transition: none;
        }
      }
    `],u([I({attribute:!1})],$.prototype,"hass",2),u([f()],$.prototype,"config",2),u([f()],$.prototype,"result",2),u([f()],$.prototype,"overBin",2),$=u([de("hass-broadcast-tile")],$);function ji(i){return i.split(/(?<=\.) /)[0]}window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-tile",name:"Voice Broadcast Tile",description:"Hold to talk, let go to send to the speakers you chose.",preview:!0});function Gt(i){let e=i.recentMessages!=="off"||i.volumeControl;return l`
    <div class="card compact">
      <div class="compact-mic slot">${i.mic(72)}</div>
      <div class="compact-body">
        <div class="compact-row">
          ${z("compact-status",i.view,{idle:l`
              <span class="title">${i.title}</span>
              <span class="hint">${i.hint}</span>
            `,recording:L(i.timer,i.timerWarning),review:l`
              ${i.play()} ${i.waveform("wave-mini")} ${i.discard()}
            `,status:Ce(i.status)})}
          ${e?l`
                <div class="popover-wrap slot" data-popover="menu">
                  <button
                    class="icon"
                    title="More"
                    aria-label="More"
                    aria-expanded=${i.menuOpen}
                    @click=${()=>i.onMenuOpenChange(!i.menuOpen)}
                  >
                    ${Wt}
                  </button>
                  ${i.menuOpen?Vi(i):d}
                </div>
              `:d}
        </div>
        <div class="compact-row">
          <div class="compact-speakers slot">${i.speakers()}</div>
          <div class="slot">${i.send("pill")}</div>
        </div>
      </div>
      ${i.historyDialog()}
    </div>
  `}function Vi(i){return l`
    <div class="popover menu" role="menu">
      ${i.recentMessages!=="off"?l`
            <button
              class="menu-item"
              role="menuitem"
              @click=${()=>{i.onMenuOpenChange(!1),i.onOpenHistory()}}
            >
              ${ke}<span>Recent messages</span>
            </button>
          `:d}
      ${i.volumeControl?l`<div class="menu-item menu-volume">${_e}${i.volumePanel()}</div>`:d}
    </div>
  `}function Xt(i){return l`
    <div class="card full">
      <div class="head slot">
        <span class="title">${i.title}</span>
        <span class="head-actions">
          ${i.recentMessages==="button"?i.historyButton():d}
          ${i.volumeControl?i.volumeButton():d}
        </span>
      </div>

      ${z("strip",i.view,{idle:l`<span class="hint">${i.hint}</span>`,recording:L(i.timer,i.timerWarning),review:l`
          ${i.play()} ${i.waveform("wave-strip")}
          <span class="clip-length">${i.clipLength}</span>
        `,status:Ce(i.status)})}

      <div class="core">
        <div class="core-side slot">
          <div class="pop" data-on=${i.reviewing} ?inert=${!i.reviewing}>
            ${i.discard()}
            <span class="caption">Discard</span>
          </div>
        </div>
        <div class="core-mic slot">${i.mic(96)}</div>
        <div class="core-side slot">${i.send("round")}</div>
      </div>

      <div class="section section-speakers slot" data-style=${i.speakerPicker}>
        ${i.speakers()}
      </div>
      ${i.recentMessages==="list"?l`<div class="section slot">${i.historyList()}</div>`:d}
      ${i.historyDialog()}
    </div>
  `}var Jt=3;function Qt(i,e,t){return l`
    <div
      class="history-row"
      data-loaded="${e.loadedId===i.id}"
      data-loading="${e.loadingId===i.id}"
    >
      <button class="history-load" @click=${()=>e.onLoad(i)}>
        <span class="history-when">${Ot(i.created,t)}</span>
        <span class="history-length">${_(i.duration)}</span>
      </button>
      ${i.can_delete?l`
            <button
              class="icon"
              title="Delete"
              aria-label="Delete"
              @click=${()=>e.onDelete(i.id)}
            >
              ✕
            </button>
          `:d}
    </div>
  `}function We(i,e=i.now??new Date){let t=()=>i.onDialogOpenChange?.(!1);return l`
    <dialog
      class="history-dialog"
      @close=${t}
      @cancel=${t}
      @click=${s=>{let o=s.currentTarget;if(s.target!==o)return;let n=o.getBoundingClientRect();(s.clientX<n.left||s.clientX>n.right||s.clientY<n.top||s.clientY>n.bottom)&&t()}}
    >
      <div class="dialog-head">
        <span>Recent messages</span>
        <button class="icon" title="Close" aria-label="Close" @click=${t}>✕</button>
      </div>
      <div class="dialog-list">
        ${i.messages.length===0?l`<div class="empty">Nothing recorded yet</div>`:i.messages.map(s=>Qt(s,i,e))}
      </div>
    </dialog>
  `}function Zt(i){let e=i.now??new Date,t=i.messages.length===0,r=i.messages.slice(0,Jt);return l`
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
        ${Array.from({length:Jt},(s,o)=>l`
            <div class="history-slot">
              ${r[o]?Qt(r[o],i,e):o===0&&t?l`<div class="empty">Nothing recorded yet</div>`:d}
            </div>
          `)}
      </div>
      ${i.dialogOpen?We(i,e):d}
    </div>
  `}var ei=2;function ti(i,e){if(e.length===0)return"No speakers selected";let t=e.map(o=>i.find(n=>n.entityId===o)?.name??o),r=t.slice(0,ei).join(", "),s=t.length-ei;return s>0?`${r} +${s}`:r}function ii(i,e){let t=i.selected.includes(e.entityId);return l`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?d:l`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${t?"\u2713":""}</span>
    </button>
  `}function Wi(i,e){let t=i.selected.includes(e.entityId);return l`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function ri(i){let e=l`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${i.selected.length} of ${i.players.length}</span>
    </div>
  `;return i.players.length===0?i.style==="dropdown"?l`<div class="pill-wrap">
          <button class="pill" disabled>
            <span class="pill-icon">${Q}</span>
            <span class="pill-text">No speakers found</span>
          </button>
        </div>`:l`${e}<div class="empty">No speakers found</div>`:i.style==="chips"?l`
      ${e}
      <div class="chips">${i.players.map(t=>Wi(i,t))}</div>
    `:i.style==="dropdown"?l`
      <div class="pill-wrap" data-popover="picker">
        <button
          class="pill"
          aria-expanded=${i.open}
          aria-haspopup="true"
          title=${ti(i.players,i.selected)}
          @click=${()=>i.onOpenChange(!i.open)}
        >
          <span class="pill-icon">${Q}</span>
          <span class="pill-text">${ti(i.players,i.selected)}</span>
          <span class="pill-chevron">${Yt}</span>
        </button>
        ${i.open?l`
              <!-- Absolutely positioned: an inline panel would push
                   everything below it down the card. -->
              <div class="pill-panel">
                ${e}
                ${i.players.map(t=>ii(i,t))}
              </div>
            `:d}
      </div>
    `:l`
    ${e}
    <div class="target-rows">${i.players.map(t=>ii(i,t))}</div>
  `}function Fi(i){let t=i.currentTarget.getBoundingClientRect();return t.width===0?0:Math.min(1,Math.max(0,(i.clientX-t.left)/t.width))}function si(i){let e=r=>i.progress!==void 0&&r/i.bars.length<i.progress,t=r=>{i.seekable&&i.onSeek(Fi(r))};return l`
    <div
      class="wave ${i.seekable?"seekable":""} ${i.className??""}"
      @pointerdown=${r=>{i.seekable&&(r.currentTarget.setPointerCapture(r.pointerId),t(r))}}
      @pointermove=${r=>{i.seekable&&r.buttons>0&&t(r)}}
      @pointerup=${r=>{i.seekable&&r.currentTarget.releasePointerCapture(r.pointerId)}}
      @pointercancel=${r=>{i.seekable&&r.currentTarget.releasePointerCapture(r.pointerId)}}
    >
      ${i.bars.map((r,s)=>l`
          <div
            class="bar ${e(s)?"played":i.recording?"live":""}"
            style="height:${Math.max(2,Math.round(r*100))}%;--i:${s}"
          ></div>
        `)}
    </div>
  `}function Fe(i){return l`
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
      ${i.enabled?l`
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
          `:d}
    </div>
  `}function oi(i){return l`
    <div class="popover-wrap" data-popover="volume">
      <button
        class="icon"
        data-active=${i.enabled}
        aria-expanded=${i.open}
        title="Broadcast volume"
        aria-label="Broadcast volume"
        @click=${()=>i.onOpenChange(!i.open)}
      >
        ${_e}
      </button>
      ${i.open?l`<div class="popover">${Fe(i)}</div>`:d}
    </div>
  `}var Ki=4e3,Yi=10,Gi=.25,m=class extends b{constructor(){super(...arguments);this.config={type:""};this.selected=[];this.history=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.historyOpen=!1;this.volumeOpen=!1;this.menuOpen=!1;this.volumeOverride=!1;this.volume=1;this.rec=new q(this,{recordMode:()=>this.recordMode,maxDuration:()=>this.resolved.maxDuration,noiseSuppression:()=>this.resolved.noiseSuppression,onStart:()=>this.setStatus(void 0),onError:(t,r)=>this.fail(t,r),onTake:t=>{this.setClip(Ut(t.blob,t.duration,t.peaks))}});this.onDocumentPointerDown=t=>{let r=t.composedPath().map(s=>s.dataset?.popover).find(s=>s!==void 0);r!=="picker"&&(this.pickerOpen=!1),r!=="volume"&&(this.volumeOpen=!1),r!=="menu"&&(this.menuOpen=!1)};this.onDocumentKeyDown=t=>{t.key==="Escape"&&this.closePopovers()};this.listening=!1}setConfig(t){this.config=t,this.selected=[...Ie(t).selected]}get resolved(){return Ie(this.config)}getCardSize(){let t=this.resolved;if(t.layout==="compact")return 2;let r=5;return r+=t.speakerPicker==="list"?4:t.speakerPicker==="chips"?1:0,t.recentMessages==="list"&&(r+=3),r}getGridOptions(){return{columns:12,min_columns:6}}static getConfigForm(){return Et}static getStubConfig(t){return{type:"custom:hass-broadcast-card",layout:"full",speaker_picker:"dropdown",recent_messages:"button",volume_control:!0,speakers:X(t),selected:[],record_mode:"push_to_talk",max_duration:60,mode:"plain"}}connectedCallback(){super.connectedCallback(),this.rec.supported||(this.status={kind:"error",text:ue,sticky:!0}),this.refreshHistory()}closePopovers(){this.pickerOpen=!1,this.volumeOpen=!1,this.menuOpen=!1}listen(t){t!==this.listening&&(this.listening=t,t?(document.addEventListener("pointerdown",this.onDocumentPointerDown,!0),document.addEventListener("keydown",this.onDocumentKeyDown,!0)):(document.removeEventListener("pointerdown",this.onDocumentPointerDown,!0),document.removeEventListener("keydown",this.onDocumentKeyDown,!0)))}updated(){this.listen(this.pickerOpen||this.volumeOpen||this.menuOpen);let t=this.renderRoot?.querySelector?.("dialog");t&&!t.open&&t.showModal?.()}disconnectedCallback(){super.disconnectedCallback(),this.stopPlayback(),this.clearStatusTimer(),ye(this.clip),this.clip=void 0,this.historyOpen=!1,this.closePopovers(),this.listen(!1)}async refreshHistory(){if(!(!this.hass||this.resolved.recentMessages==="off"))try{this.history=await gt(this.hass)}catch{this.history=[]}}get players(){return xt(X(this.hass),this.resolved.speakers)}get targets(){return wt(this.selected,this.resolved.speakers)}get recordMode(){return this.resolved.recordMode}clearStatusTimer(){this.statusTimer!==void 0&&(window.clearTimeout(this.statusTimer),this.statusTimer=void 0)}setStatus(t){this.clearStatusTimer(),this.status=t,t&&!t.sticky&&(this.statusTimer=window.setTimeout(()=>{this.statusTimer=void 0,this.status===t&&(this.status=void 0)},Ki))}fail(t,r=!1){this.setStatus({kind:"error",text:t,sticky:r})}setClip(t){this.stopPlayback(),this.clip&&this.clip!==t&&ye(this.clip),this.clip=t}clearClip(){this.stopPlayback(),ye(this.clip),this.clip=void 0}seek(t){if(!this.clip)return;this.position=t*this.clip.duration;let r=this.ensureAudio();r&&r.src===this.clip.url&&(r.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let t=this.ensureAudio();if(!(!t||!this.clip)){if(this.playing){t.pause(),this.playing=!1;return}t.src!==this.clip.url&&(t.src=this.clip.url,t.currentTime=this.position),t.play().then(()=>{this.playing=!0},r=>{this.fail(`Could not play that here: ${r?.message??r}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}toggleTarget(t){this.selected=this.selected.includes(t)?this.selected.filter(r=>r!==t):[...this.selected,t]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.rec.phase==="idle"}async broadcast(){if(this.rec.phase!=="idle")return;let t=this.clip;if(!t){this.fail("Record a message or pick one from below first.");return}let r=this.targets;if(r.length===0){this.fail("Pick at least one speaker first.");return}this.rec.setSending(!0),this.setStatus(void 0);try{let s=await xe({hass:this.hass,clip:t,targets:r,mode:this.resolved.mode,volume:this.volumeOverride?this.volume:void 0,onStored:o=>{this.clip===t&&(this.clip={...t,source:{kind:"stored",id:o}})}});this.rec.setSending(!1),this.setStatus(we(this.hass,s)),await this.refreshHistory()}catch(s){if(this.rec.setSending(!1),s?.code==="not_found"&&H(t)!==void 0){this.clip===t&&this.clearClip(),this.fail("That recording was deleted."),await this.refreshHistory();return}this.fail(`Could not send: ${s?.message??s}`)}}async loadMessage(t){this.loadingId=t.id,this.historyOpen=!1,this.setStatus(void 0);try{this.setClip(await It(this.hass,t))}catch(r){this.fail(r?.message??String(r))}finally{this.loadingId=void 0}}async deleteRecording(t){try{let r=await vt(this.hass,t);this.clip&&H(this.clip)===t&&this.clearClip(),r&&await this.refreshHistory()}catch(r){r?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${r?.message??r}`)}}get hint(){return this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}get recordLabel(){return this.rec.phase==="sending"?"Broadcasting":this.rec.phase==="recording"?this.recordMode==="push_to_talk"?"Recording \u2014 release to stop":"Recording \u2014 tap to stop":this.hint}get view(){return this.rec.phase==="recording"||this.rec.phase==="finishing"?"recording":this.status?"status":this.clip?"review":"idle"}get timerWarning(){let t=this.resolved.maxDuration,r=Math.min(Yi,t*Gi);return this.view==="recording"&&t-this.rec.elapsed<=r}historyProps(){return{messages:this.history,loadedId:this.clip?H(this.clip):void 0,loadingId:this.loadingId,onLoad:t=>{this.loadMessage(t)},onDelete:t=>{this.deleteRecording(t)},onDialogOpenChange:t=>{this.historyOpen=t}}}get parts(){let t=this.rec.phase==="recording",r=this.rec.phase==="sending",s=this.clip!==void 0&&this.view!=="recording",o={enabled:this.volumeOverride,value:this.volume,onToggle:()=>{this.volumeOverride=!this.volumeOverride},onChange:a=>{this.volume=a}},n=this.resolved;return{title:n.title,view:this.view,speakerPicker:n.speakerPicker,recentMessages:n.recentMessages,volumeControl:n.volumeControl,hint:this.hint,timer:_(this.rec.elapsed),timerWarning:this.timerWarning,status:this.status,reviewing:s,mic:a=>Ae({size:a,recording:t,disabled:!this.rec.supported||r,recordMode:this.recordMode,level:this.rec.level,maxDuration:this.resolved.maxDuration,label:this.recordLabel,onPressStart:c=>{this.rec.onPressStart(c)},onPressEnd:()=>{this.rec.onPressEnd()}}),play:()=>l`
        <button
          class="icon play"
          ?disabled=${!s||r}
          title=${this.playing?"Pause":"Play"}
          aria-label=${this.playing?"Pause":"Play"}
          @click=${()=>this.togglePlay()}
        >
          ${this.playing?Vt:jt}
        </button>
      `,waveform:a=>l`${mt(this.clip?.url??"none",si({bars:this.clip?.peaks.length?this.clip.peaks:ge(48),progress:this.clip?this.position/(this.clip.duration||1):void 0,seekable:s&&!r,recording:!1,onSeek:c=>this.seek(c),className:`${a} reveal`}))}`,clipLength:_(this.clip?.duration??0),discard:()=>l`
        <button
          class="icon discard"
          ?disabled=${!s||r}
          title="Discard"
          aria-label="Discard"
          @click=${()=>this.clearClip()}
        >
          ${$e}
        </button>
      `,send:a=>{let c=this.targets.length,h=c>1?`Send to ${c}`:"Send";return l`
          <div class="send-wrap send-wrap-${a}">
            <button
              class="send send-${a}"
              ?disabled=${!this.canBroadcast}
              data-sending=${r}
              title=${h}
              aria-label=${r?"Broadcasting":h}
              @click=${()=>{this.broadcast()}}
            >
              ${r?l`<span class="spinner" aria-hidden="true"></span>`:Ht}
              ${a==="pill"?l`<span>Send</span>`:d}
            </button>
            ${a==="round"?l`<span class="caption">${h}</span>`:d}
          </div>
        `},speakers:()=>ri({players:this.players.map(a=>({entityId:a,name:this.hass?.states?.[a]?.attributes?.friendly_name??a,available:this.hass?.states?.[a]?.state!=="unavailable"})),selected:this.selected,style:n.speakerPicker,open:this.pickerOpen,onToggle:a=>this.toggleTarget(a),onOpenChange:a=>{this.pickerOpen=a}}),historyList:()=>Zt({...this.historyProps(),dialogOpen:!1}),historyButton:()=>l`
        <button
          class="icon"
          title="Recent messages"
          aria-label="Recent messages"
          @click=${()=>{this.historyOpen=!0}}
        >
          ${ke}
        </button>
      `,volumeButton:()=>oi({...o,open:this.volumeOpen,onOpenChange:a=>{this.volumeOpen=a}}),volumePanel:()=>Fe(o),historyDialog:()=>this.historyOpen?We(this.historyProps()):d,menuOpen:this.menuOpen,onMenuOpenChange:a=>{this.menuOpen=a},onOpenHistory:()=>{this.historyOpen=!0}}}render(){let t=this.parts;return l`
      <ha-card>
        ${this.resolved.layout==="compact"?Gt(t):Xt(t)}
        <div class="sr-only" aria-live="polite">${this.status?.text??""}</div>
      </ha-card>
    `}};m.styles=Nt,u([I({attribute:!1})],m.prototype,"hass",2),u([f()],m.prototype,"config",2),u([f()],m.prototype,"status",2),u([f()],m.prototype,"selected",2),u([f()],m.prototype,"history",2),u([f()],m.prototype,"clip",2),u([f()],m.prototype,"loadingId",2),u([f()],m.prototype,"position",2),u([f()],m.prototype,"playing",2),u([f()],m.prototype,"pickerOpen",2),u([f()],m.prototype,"historyOpen",2),u([f()],m.prototype,"volumeOpen",2),u([f()],m.prototype,"menuOpen",2),u([f()],m.prototype,"volumeOverride",2),u([f()],m.prototype,"volume",2),m=u([de("hass-broadcast-card")],m);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!0});export{m as HassBroadcastCard,Ki as STATUS_MS};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
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

@lit/reactive-element/decorators/query-assigned-elements.js:
lit-html/directives/keyed.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
