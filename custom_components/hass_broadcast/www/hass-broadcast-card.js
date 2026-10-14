var ii=Object.defineProperty;var si=Object.getOwnPropertyDescriptor;var m=(i,e,t,s)=>{for(var o=s>1?void 0:s?si(e,t):e,r=i.length-1,n;r>=0;r--)(n=i[r])&&(o=(s?n(e,t,o):n(o))||o);return s&&o&&ii(e,t,o),o};var F=globalThis,Y=F.ShadowRoot&&(F.ShadyCSS===void 0||F.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ve=Symbol(),Ie=new WeakMap,D=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==ve)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(Y&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=Ie.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Ie.set(t,e))}return e}toString(){return this.cssText}},Ne=i=>new D(typeof i=="string"?i:i+"",void 0,ve),x=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((s,o,r)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+i[r+1],i[0]);return new D(t,i,ve)},ze=(i,e)=>{if(Y)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),o=F.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=t.cssText,i.appendChild(s)}},be=Y?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return Ne(t)})(i):i;var{is:oi,defineProperty:ri,getOwnPropertyDescriptor:ni,getOwnPropertyNames:ai,getOwnPropertySymbols:li,getPrototypeOf:ci}=Object,K=globalThis,He=K.trustedTypes,di=He?He.emptyScript:"",pi=K.reactiveElementPolyfillSupport,U=(i,e)=>i,I={toAttribute(i,e){switch(e){case Boolean:i=i?di:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},G=(i,e)=>!oi(i,e),Be={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:G};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;var $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Be){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),o=this.getPropertyDescriptor(e,s,t);o!==void 0&&ri(this.prototype,e,o)}}static getPropertyDescriptor(e,t,s){let{get:o,set:r}=ni(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:o,set(n){let l=o?.call(this);r?.call(this,n),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Be}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;let e=ci(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){let t=this.properties,s=[...ai(t),...li(t)];for(let o of s)this.createProperty(o,t[o])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,o]of t)this.elementProperties.set(s,o)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let o=this._$Eu(t,s);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let o of s)t.unshift(be(o))}else e!==void 0&&t.push(be(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ze(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,s);if(o!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:I).toAttribute(t,s.type);this._$Em=e,r==null?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(e,t){let s=this.constructor,o=s._$Eh.get(e);if(o!==void 0&&this._$Em!==o){let r=s.getPropertyOptions(o),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:I;this._$Em=o;let l=n.fromAttribute(t,r.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(e,t,s,o=!1,r){if(e!==void 0){let n=this.constructor;if(o===!1&&(r=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??G)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:o,wrapped:r},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),r!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[o,r]of s){let{wrapped:n}=r,l=this[o];n!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,r,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[U("elementProperties")]=new Map,$[U("finalized")]=new Map,pi?.({ReactiveElement:$}),(K.reactiveElementVersions??=[]).push("2.1.2");var $e=globalThis,je=i=>i,X=$e.trustedTypes,Ve=X?X.createPolicy("lit-html",{createHTML:i=>i}):void 0,we="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,_e="?"+w,hi=`<${_e}>`,A=document,z=()=>A.createComment(""),H=i=>i===null||typeof i!="object"&&typeof i!="function",ke=Array.isArray,Ge=i=>ke(i)||typeof i?.[Symbol.iterator]=="function",xe=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,qe=/-->/g,We=/>/g,k=RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Fe=/'/g,Ye=/"/g,Xe=/^(?:script|style|textarea|title)$/i,Se=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),a=Se(1),Je=Se(2),Vi=Se(3),T=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),Ke=new WeakMap,S=A.createTreeWalker(A,129);function Qe(i,e){if(!ke(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ve!==void 0?Ve.createHTML(e):e}var Ze=(i,e)=>{let t=i.length-1,s=[],o,r=e===2?"<svg>":e===3?"<math>":"",n=N;for(let l=0;l<t;l++){let c=i[l],h,u,p=-1,v=0;for(;v<c.length&&(n.lastIndex=v,u=n.exec(c),u!==null);)v=n.lastIndex,n===N?u[1]==="!--"?n=qe:u[1]!==void 0?n=We:u[2]!==void 0?(Xe.test(u[2])&&(o=RegExp("</"+u[2],"g")),n=k):u[3]!==void 0&&(n=k):n===k?u[0]===">"?(n=o??N,p=-1):u[1]===void 0?p=-2:(p=n.lastIndex-u[2].length,h=u[1],n=u[3]===void 0?k:u[3]==='"'?Ye:Fe):n===Ye||n===Fe?n=k:n===qe||n===We?n=N:(n=k,o=void 0);let _=n===k&&i[l+1].startsWith("/>")?" ":"";r+=n===N?c+hi:p>=0?(s.push(h),c.slice(0,p)+we+c.slice(p)+w+_):c+w+(p===-2?l:_)}return[Qe(i,r+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},B=class i{constructor({strings:e,_$litType$:t},s){let o;this.parts=[];let r=0,n=0,l=e.length-1,c=this.parts,[h,u]=Ze(e,t);if(this.el=i.createElement(h,s),S.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=S.nextNode())!==null&&c.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(we)){let v=u[n++],_=o.getAttribute(p).split(w),W=/([.?@])?(.*)/.exec(v);c.push({type:1,index:r,name:W[2],strings:_,ctor:W[1]==="."?Q:W[1]==="?"?Z:W[1]==="@"?ee:C}),o.removeAttribute(p)}else p.startsWith(w)&&(c.push({type:6,index:r}),o.removeAttribute(p));if(Xe.test(o.tagName)){let p=o.textContent.split(w),v=p.length-1;if(v>0){o.textContent=X?X.emptyScript:"";for(let _=0;_<v;_++)o.append(p[_],z()),S.nextNode(),c.push({type:2,index:++r});o.append(p[v],z())}}}else if(o.nodeType===8)if(o.data===_e)c.push({type:2,index:r});else{let p=-1;for(;(p=o.data.indexOf(w,p+1))!==-1;)c.push({type:7,index:r}),p+=w.length-1}r++}}static createElement(e,t){let s=A.createElement("template");return s.innerHTML=e,s}};function E(i,e,t=i,s){if(e===T)return e;let o=s!==void 0?t._$Co?.[s]:t._$Cl,r=H(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),r===void 0?o=void 0:(o=new r(i),o._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=o:t._$Cl=o),o!==void 0&&(e=E(i,o._$AS(i,e.values),o,s)),e}var J=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,o=(e?.creationScope??A).importNode(t,!0);S.currentNode=o;let r=S.nextNode(),n=0,l=0,c=s[0];for(;c!==void 0;){if(n===c.index){let h;c.type===2?h=new R(r,r.nextSibling,this,e):c.type===1?h=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(h=new te(r,this,e)),this._$AV.push(h),c=s[++l]}n!==c?.index&&(r=S.nextNode(),n++)}return S.currentNode=A,o}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},R=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,o){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),H(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ge(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&H(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,o=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=B.createElement(Qe(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(t);else{let r=new J(o,this),n=r.u(this.options);r.p(t),this.T(n),this._$AH=r}}_$AC(e){let t=Ke.get(e.strings);return t===void 0&&Ke.set(e.strings,t=new B(e)),t}k(e){ke(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,o=0;for(let r of e)o===t.length?t.push(s=new i(this.O(z()),this.O(z()),this,this.options)):s=t[o],s._$AI(r),o++;o<t.length&&(this._$AR(s&&s._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=je(e).nextSibling;je(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},C=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,o,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(e,t=this,s,o){let r=this.strings,n=!1;if(r===void 0)e=E(this,e,t,0),n=!H(e)||e!==this._$AH&&e!==T,n&&(this._$AH=e);else{let l=e,c,h;for(e=r[0],c=0;c<r.length-1;c++)h=E(this,l[s+c],t,c),h===T&&(h=this._$AH[c]),n||=!H(h)||h!==this._$AH[c],h===d?e=d:e!==d&&(e+=(h??"")+r[c+1]),this._$AH[c]=h}n&&!o&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Q=class extends C{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},Z=class extends C{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}},ee=class extends C{constructor(e,t,s,o,r){super(e,t,s,o,r),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??d)===T)return;let s=this._$AH,o=e===d&&s!==d||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==d&&(s===d||o);o&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},te=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}},et={M:we,P:w,A:_e,C:1,L:Ze,R:J,D:Ge,V:E,I:R,H:C,N:Z,U:ee,B:Q,F:te},ui=$e.litHtmlPolyfillSupport;ui?.(B,R),($e.litHtmlVersions??=[]).push("3.3.3");var tt=(i,e,t)=>{let s=t?.renderBefore??e,o=s._$litPart$;if(o===void 0){let r=t?.renderBefore??null;s._$litPart$=o=new R(e.insertBefore(z(),r),r,void 0,t??{})}return o._$AI(i),o};var Ae=globalThis,b=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=tt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};b._$litElement$=!0,b.finalized=!0,Ae.litElementHydrateSupport?.({LitElement:b});var mi=Ae.litElementPolyfillSupport;mi?.({LitElement:b});(Ae.litElementVersions??=[]).push("4.2.2");var ie=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};var gi={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:G},fi=(i=gi,e,t)=>{let{kind:s,metadata:o}=t,r=globalThis.litPropertyMetadata.get(o);if(r===void 0&&globalThis.litPropertyMetadata.set(o,r=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),r.set(t.name,i),s==="accessor"){let{name:n}=t;return{set(l){let c=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,c,i,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,i,l),l}}}if(s==="setter"){let{name:n}=t;return function(l){let c=this[n];e.call(this,l),this.requestUpdate(n,c,i,!0,l)}}throw Error("Unsupported decorator location: "+s)};function O(i){return(e,t)=>typeof t=="object"?fi(i,e,t):((s,o,r)=>{let n=o.hasOwnProperty(r);return o.constructor.createProperty(r,s),n?Object.getOwnPropertyDescriptor(o,r):void 0})(i,e,t)}function f(i){return O({...i,state:!0,attribute:!1})}var it=i=>(...e)=>({_$litDirective$:i,values:e}),oe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var{I:Ms}=et;var yi={},st=(i,e=yi)=>i._$AH=e;var ot=it(class extends oe{constructor(){super(...arguments),this.key=d}render(i,e){return this.key=i,e}update(i,[e,t]){return e!==this.key&&(st(i),this.key=e),t}});async function rt(i,e,t){let s=new FormData;s.append("file",e,"recording.wav"),s.append("duration",String(t));let o=await fetch("/api/hass_broadcast/upload",{method:"POST",body:s,headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!o.ok)throw new Error(`Upload failed (${o.status})`);return(await o.json()).message_id}async function nt(i){return(await i.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function at(i,e){return(await i.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function lt(i,e,t,s,o){return{failed:(await i.connection.sendMessagePromise({type:"hass_broadcast/send",message_id:e,targets:t,mode:s,...o!==void 0?{volume:o}:{}})).failed}}var ct="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function dt(i){return i?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${i?.message??i?.name??"unknown error"}`}function re(i){return i?.states?Object.keys(i.states).filter(e=>e.startsWith("media_player.")).filter(e=>(i.states[e].attributes.supported_features&512)!==0).sort():[]}function pt(i,e,t){let s=e?.length?[...new Set(e)]:i;if(!t?.length)return s;let o=new Set(t);return s.filter(r=>!o.has(r))}function ht(i,e,t){let s=e?.length?new Set(e):void 0,o=new Set(t??[]);return i.filter(r=>(s===void 0||s.has(r))&&!o.has(r))}function ut(i,e){let t=n=>i?.states?.[n]?.attributes?.friendly_name??n,s=re(i),o=new Set(s),r=[...new Set(e.flat())].filter(n=>!o.has(n)).sort();return[...s,...r].map(n=>({entityId:n,name:t(n),available:o.has(n)}))}function mt(i,e,t){let s=i??[];if(t)return s.includes(e)?s:[...s,e];let o=s.filter(r=>r!==e);return o.length?o:void 0}function L(i){if(i===""||i===null||i===void 0)return 60;let e=Number(i);return isNaN(e)?60:Math.min(300,Math.max(5,e))}function Te(i,e,t){return a`
    <div class="segmented">
      ${e.map(([s,o])=>a`
          <button
            type="button"
            data-on=${i===s}
            aria-pressed=${i===s}
            @click=${()=>t(s)}
          >
            ${o}
          </button>
        `)}
    </div>
  `}function gt(i,e,t){return a`
    <div class="rows">
      ${i.map(s=>a`
          <label>
            <input
              type="checkbox"
              .checked=${e.includes(s.entityId)}
              @change=${o=>t(s.entityId,o.target.checked)}
            />
            <span class=${s.available?"":"missing"}>
              ${s.name}${s.available?"":" (not available)"}
            </span>
          </label>
        `)}
    </div>
  `}function ft(i,e){return a`
    <div class="field">
      <label for="mode">Playback mode</label>
      <select
        id="mode"
        .value=${i??"plain"}
        @change=${t=>e(t.target.value)}
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
  `}function yt(i,e){return a`
    <div class="field">
      <label for="max">Maximum recording length (seconds)</label>
      <input
        id="max"
        type="number"
        min="5"
        max="300"
        .value=${String(i??60)}
        @change=${t=>e(L(t.target.value))}
      />
    </div>
  `}var vt=x`
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
  .rows label { display: flex; align-items: center; gap: 8px; font-weight: normal;
    margin: 0; padding: 4px 0; }
  .missing { color: var(--secondary-text-color); }
  .segmented { display: flex; gap: 6px; }
  .segmented button { flex: 1; padding: 8px; font: inherit; cursor: pointer;
    border: 1px solid var(--divider-color, #ddd); border-radius: 6px;
    background: none; color: var(--primary-text-color); }
  .segmented button[data-on="true"] { background: var(--primary-color);
    color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
`;var Ee=["speakers","history","volume"],Ce={speakers:"pill",history:"list",volume:"icon"},Pe={speakers:["pill","chips","rows"],history:["list","icon"],volume:["icon"]};function P(i){return i.layout==="compact"?"compact":"full"}function vi(i){return Ee.includes(i)}function bi(i,e){return Pe[i].includes(e)?e:Ce[i]}function xi(i){let t=[{type:"speakers",style:i.player_list==="chips"?"chips":i.player_list==="dropdown"?"pill":"rows"}];return i.show_history!==!1&&t.push({type:"history",style:"list"}),t.push({type:"volume",style:"icon"}),t}function ne(i){let e;if(Array.isArray(i.sections)){let t=new Set;e=[];for(let s of i.sections){let o=s?.type;!vi(o)||t.has(o)||(t.add(o),e.push({type:o,style:bi(o,s.style)}))}}else e=xi(i);return e.some(t=>t.type==="speakers")||e.unshift({type:"speakers",style:"pill"}),P(i)==="compact"&&(e=e.map(t=>t.type==="speakers"?{type:"speakers",style:"pill"}:t)),e}function bt(i,e){return i.find(t=>t.type===e)}function $i(i,e){return ut(i,[e.show_players??[],e.hide_players??[]])}var xt=3;function wi(i,e,t){if(!i?.length)return t;let s=i.map(n=>e.find(l=>l.entityId===n)?.name??n),o=s.slice(0,xt).join(", "),r=s.length-xt;return r>0?`${o} +${r} more`:o}function $t(i){let e=ne({...i,layout:"full"}).map(s=>({...s,visible:!0})),t=Ee.filter(s=>!e.some(o=>o.type===s)).map(s=>({type:s,style:Ce[s],visible:!1}));return[...e,...t]}function wt(i){return i.filter(e=>e.visible).map(e=>({type:e.type,style:e.style}))}function _t(i,e,t){let s=e+t;if(!i[e]?.visible||s<0||s>=i.length||!i[s].visible)return i;let o=[...i];return[o[e],o[s]]=[o[s],o[e]],o}function _i(i,e){let t=i[e];if(!t||t.type==="speakers")return i;let s=i.filter((n,l)=>l!==e),o={...t,visible:!t.visible},r=s.filter(n=>n.visible).length;return o.visible?[...s.slice(0,r),o,...s.slice(r)]:[...s,o]}var j={speakers:"Speakers",history:"Recent messages",volume:"Volume"},kt={pill:"Pill \u2014 one line",chips:"Chips",rows:"List \u2014 a row each",list:"List below",icon:"Icon in the header"},M=class extends b{constructor(){super(...arguments);this.config={type:""}}setConfig(t){this.config=t}emit(t){let s={...this.config,...t};s.layout=P(s),"sections"in t||(s.sections=wt($t(s))),delete s.player_list,delete s.show_history;for(let o of Object.keys(s))s[o]===void 0&&delete s[o];this.config=s,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}get currentRecordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}setRecordMode(t){this.emit({record_mode:t})}setRows(t){this.emit({sections:wt(t)})}playerSection(t,s,o,r){let n=this.config[t]??[];return a`
      <details class="players">
        <summary>
          ${s} — ${wi(n,r,o)}
        </summary>
        ${r.length===0?a`<div class="hint">No media players found.</div>`:gt(r,n,(l,c)=>this.emit({[t]:mt(this.config[t],l,c)}))}
      </details>
    `}sectionList(){let t=P(this.config)==="compact",s=$t(this.config),o=s.filter(r=>r.visible).length;return a`
      <div class="section-list">
        ${s.map((r,n)=>{let l=Pe[r.type],c=l.length>1&&!t;return a`
            <div class="section-row" data-visible=${r.visible}>
              <span class="section-name">${j[r.type]}</span>
              <button
                class="mini"
                title="Move up"
                aria-label="Move ${j[r.type]} up"
                ?disabled=${!r.visible||n===0}
                @click=${()=>this.setRows(_t(s,n,-1))}
              >
                ↑
              </button>
              <button
                class="mini"
                title="Move down"
                aria-label="Move ${j[r.type]} down"
                ?disabled=${!r.visible||n>=o-1}
                @click=${()=>this.setRows(_t(s,n,1))}
              >
                ↓
              </button>
              <button
                class="mini"
                title=${r.type==="speakers"?"The card needs a way to pick speakers":r.visible?"Hide":"Show"}
                aria-label="${r.visible?"Hide":"Show"} ${j[r.type]}"
                aria-pressed=${r.visible}
                ?disabled=${r.type==="speakers"}
                @click=${()=>this.setRows(_i(s,n))}
              >
                ${r.visible?"\u25C9":"\u25CB"}
              </button>
              ${c&&r.visible?a`
                    <!-- The chosen option is marked with ?selected rather than
                         the select's .value: with mapped options, .value is
                         set before the options exist and silently falls back
                         to the first one. -->
                    <select
                      class="section-style"
                      aria-label="${j[r.type]} style"
                      @change=${h=>{let u=h.target.value;this.setRows(s.map((p,v)=>v===n?{...p,style:u}:p))}}
                    >
                      ${l.map(h=>a`<option value=${h} ?selected=${h===r.style}>
                            ${kt[h]}
                          </option>`)}
                    </select>
                  `:r.visible&&!t?a`<span class="section-style section-fixed">${kt[r.style]}</span>`:d}
            </div>
          `})}
      </div>
      <div class="hint">
        ${t?"In Compact the speakers are a single pill, and the other sections are in the \u22EE menu, in this order.":"Icon sections sit in the header; the rest stack below the record button, in this order."}
      </div>
    `}render(){let t=$i(this.hass,this.config);return a`
      <div class="field">
        <label for="title">Card name</label>
        <input
          id="title"
          type="text"
          placeholder="Voice Broadcast"
          .value=${this.config.title??""}
          @change=${s=>this.emit({title:s.target.value.trim()||void 0})}
        />
      </div>

      <div class="field">
        <label>Layout</label>
        ${Te(P(this.config),[["full","Full"],["compact","Compact"]],s=>this.emit({layout:s}))}
      </div>

      <div class="field">
        <label>Card sections</label>
        ${this.sectionList()}
      </div>

      <div class="field">
        <label>Recording</label>
        ${Te(this.currentRecordMode,[["push_to_talk","Push to talk"],["start_stop","Tap to start and stop"]],s=>this.setRecordMode(s))}
        <div class="hint">
          Push to talk records only while the button is held.
        </div>
      </div>

      ${ft(this.config.mode,s=>this.emit({mode:s}))}

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

      ${yt(this.config.max_duration,s=>this.emit({max_duration:s}))}
    `}};M.styles=[vt,x`
      .section-list { display: flex; flex-direction: column; gap: 6px; }
      .section-row { display: grid; grid-template-columns: 1fr auto auto auto; align-items: center;
        gap: 2px 4px; padding: 4px 6px 6px 10px;
        border: 1px solid var(--divider-color, #ddd); border-radius: 8px; }
      .section-row[data-visible="false"] { opacity: 0.55; }
      .section-name { min-width: 0; }
      .section-style { grid-column: 1 / -1; }
      .section-row select { padding: 6px; }
      .section-fixed { font-size: 0.85em; color: var(--secondary-text-color); }
      .mini { width: 30px; height: 30px; padding: 0; font: inherit; border: none;
        border-radius: 6px; background: none; color: var(--primary-text-color); cursor: pointer; }
      .mini:hover:not([disabled]) { background: var(--secondary-background-color, rgba(0,0,0,.06)); }
      .mini[disabled] { opacity: 0.3; cursor: default; }
    `],m([O({attribute:!1})],M.prototype,"hass",2),m([f()],M.prototype,"config",2),M=m([ie("hass-broadcast-card-editor")],M);function St(i){return Number.isFinite(i)?Math.min(1,Math.max(0,i)):0}function le(i){return new Array(Math.max(0,i)).fill(0)}function At(i,e){if(e<=0)return[];if(i.length===0)return le(e);let t=[];for(let s=0;s<e;s++){let o=Math.floor(s*i.length/e),r=Math.max(o+1,Math.floor((s+1)*i.length/e)),n=0;for(let l=o;l<r&&l<i.length;l++)n=Math.max(n,i[l]);t.push(n)}return t}function Me(i){let e=i.reduce((t,s)=>Math.max(t,s),0);return e<=0?[...i]:i.map(t=>t/e)}var ae=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,t){if(this.windowStart===void 0)return this.windowStart=t,this.pending=St(e),!1;let s=!1;return t-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=t,s=!0),this.pending=Math.max(this.pending,St(e)),s}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let t=this.peaks.slice(-e);return[...le(e-t.length),...t]}};function Tt(i,e,t){return{source:{kind:"fresh",blob:i},url:URL.createObjectURL(i),duration:e,peaks:Me(At(t,48))}}function de(i){return i.source.kind==="stored"?i.source.id:void 0}var ki=async(i,e)=>{let t=globalThis.AudioContext??globalThis.webkitAudioContext;if(!t)return[];let s=new t;try{let r=(await s.decodeAudioData(await i.arrayBuffer())).getChannelData(0),n=[];for(let l=0;l<e;l++){let c=Math.floor(l*r.length/e),h=Math.floor((l+1)*r.length/e),u=0;for(let p=c;p<h;p++)u=Math.max(u,Math.abs(r[p]));n.push(u)}return Me(n)}finally{await s.close?.()}};async function Et(i,e,t=ki){let s=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!s.ok)throw new Error(`Could not load that recording (${s.status})`);let o=await s.blob(),r=[];try{r=await t(o,48)}catch{r=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(o),duration:e.duration,peaks:r}}function pe(i){i&&URL.revokeObjectURL(i.url)}function V(i){let e=Number.isFinite(i)&&i>0?Math.floor(i):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function Ct(i,e){return i.getFullYear()===e.getFullYear()&&i.getMonth()===e.getMonth()&&i.getDate()===e.getDate()}function Re(i){return i.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Pt(i,e=new Date){let t=new Date(i);if(Number.isNaN(t.getTime()))return"Unknown time";let s=(e.getTime()-t.getTime())/1e3;if(s<60)return"Just now";if(s<3600){let n=Math.round(s/60);return`${n} minute${n===1?"":"s"} ago`}if(Ct(t,e))return`Today ${Re(t)}`;let o=new Date(e);return o.setDate(e.getDate()-1),Ct(t,o)?`Yesterday ${Re(t)}`:`${t.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${Re(t)}`}function Mt(i,e){let t=i.length*2,s=new ArrayBuffer(44+t),o=new DataView(s),r=(n,l)=>{for(let c=0;c<l.length;c++)o.setUint8(n+c,l.charCodeAt(c))};return r(0,"RIFF"),o.setUint32(4,36+t,!0),r(8,"WAVE"),r(12,"fmt "),o.setUint32(16,16,!0),o.setUint16(20,1,!0),o.setUint16(22,1,!0),o.setUint32(24,e,!0),o.setUint32(28,e*2,!0),o.setUint16(32,2,!0),o.setUint16(34,16,!0),r(36,"data"),o.setUint32(40,t,!0),new Int16Array(s,44).set(i),new Blob([s],{type:"audio/wav"})}var Rt=16e3,Si="/api/hass_broadcast/static/recorder-worklet.js",q=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:Rt}),await this.context.audioWorklet.addModule(Si);let e=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=t=>{this.chunks.push(t.data),this.levelCallback&&this.levelCallback(Ai(t.data))},e.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(e){throw await this.release(),e}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let e=this.context?.sampleRate??Rt,t=this.chunks;await this.release();let s=t.reduce((n,l)=>n+l.length,0),o=new Int16Array(s),r=0;for(let n of t)o.set(n,r),r+=n.length;return{blob:Mt(o,e),duration:s/e}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function Ai(i){let e=0;for(let t of i)e=Math.max(e,Math.abs(t));return e/32768}var Ti=.4,he=class{constructor(e,t){this.host=e;this.options=t;this.phase="idle";this.elapsed=0;this.level=0;this.recorder=new q;this.envelope=new ae;this.busy=!1;this.disconnected=!1;this.stopRequested=!1;e.addController(this)}get supported(){return q.isSupported()}hostConnected(){this.disconnected=!1}hostDisconnected(){this.disconnected=!0,this.clearTimer(),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.level=0,this.release())}setSending(e){this.phase=e?"sending":"idle",this.host.requestUpdate()}async onPressStart(e){if(!(this.phase==="sending"||!this.supported)){if(this.options.recordMode()==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}e.preventDefault(),!this.busy&&(this.stopRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await this.stopRecording())}}async onPressEnd(){if(this.options.recordMode()==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0;return}await this.stopRecording()}}async startRecording(){if(this.busy||this.phase!=="idle")return;this.busy=!0,this.options.onStart?.();try{this.recorder.onLevel(t=>{this.envelope.push(t,Date.now())&&(this.level=this.envelope.tail(1)[0],this.host.requestUpdate())}),this.envelope.reset(),await this.recorder.start()}catch(t){this.options.onError(dt(t),t?.name==="NotAllowedError"),this.host.requestUpdate();return}finally{this.busy=!1}if(this.disconnected){this.release();return}this.phase="recording",this.elapsed=0,this.level=0,this.host.requestUpdate();let e=this.options.maxDuration();this.timer=window.setInterval(()=>{this.elapsed+=1,this.host.requestUpdate(),this.elapsed>=e&&this.stopRecording()},1e3)}async stopRecording(){if(this.busy||this.phase!=="recording")return;this.busy=!0,this.clearTimer();let e;try{let{blob:t,duration:s}=await this.recorder.stop();this.phase="idle",this.options.recordMode()==="push_to_talk"&&s<Ti?this.options.onError("Hold the button while you speak.",!1):e={blob:t,duration:s,peaks:this.envelope.all()}}catch(t){this.phase="idle",this.options.onError(`Could not finish recording: ${t?.message??t}`,!1)}finally{this.busy=!1,this.level=0,this.host.requestUpdate()}e&&await this.options.onTake(e)}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}release(){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1})}};async function Ot(i){let{hass:e,clip:t,targets:s}=i,o=de(t);if(o===void 0){let n=t.source.blob;o=await rt(e,n,t.duration),i.onStored?.(o)}let{failed:r}=await lt(e,o,s,i.mode,i.volume);return r.length===0?{kind:"sent",targets:s}:r.length>=s.length?{kind:"failed",failed:r}:{kind:"partial",failed:r}}function Oe(i,e){return e.map(t=>i?.states?.[t]?.attributes?.friendly_name??t).join(", ")}function Lt(i,e){switch(e.kind){case"sent":return{kind:"info",text:`Sent to ${Oe(i,e.targets)}`};case"partial":return{kind:"error",text:`Played, but not on ${Oe(i,e.failed)}.`};case"failed":return{kind:"error",text:`Could not play on any speaker: ${Oe(i,e.failed)}.`}}}var Ei=x`
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
`,Ci=x`
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
`,Dt=[Ei,Ci,x`
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
    .section-speakers[data-style="pill"] {
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
  `];var y=i=>Je`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d=${i} /></svg>`,Ut=y("M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z"),It=y("M7 7h10v10H7z"),Nt=y("M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"),zt=y("M8 5v14l11-7z"),Ht=y("M6 5h4v14H6zm8 0h4v14h-4z"),Bt=y("M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"),ue=y("M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"),me=y("M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"),jt=y("M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"),Le=y("M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2a2 2 0 0 1 0-4zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"),_o=y("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"),ko=y("M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"),Vt=y("M7 10l5 5 5-5z");function ge(i){return i?a`<span class="status ${i.kind}" title=${i.text}>${i.text}</span>`:d}function fe(i,e){return a`<span class="timer" data-warning=${e}>${i}</span>`}function ye(i,e,t){return a`
    <div class="layers slot ${i}" data-active=${e}>
      ${Object.keys(t).map(s=>a`
          <div
            class="layer layer-${s}"
            data-on=${s===e}
            ?inert=${s!==e}
            aria-hidden=${s!==e}
          >
            ${t[s]}
          </div>
        `)}
    </div>
  `}function qt(i){let e=i.sections.find(s=>s.type==="speakers"),t=i.sections.filter(s=>s.type!=="speakers");return a`
    <div class="card compact">
      <div class="compact-mic slot">${i.mic(72)}</div>
      <div class="compact-body">
        <div class="compact-row">
          ${ye("compact-status",i.view,{idle:a`
              <span class="title">${i.title}</span>
              <span class="hint">${i.hint}</span>
            `,recording:fe(i.timer,i.timerWarning),review:a`
              ${i.play()} ${i.waveform("wave-mini")} ${i.discard()}
            `,status:ge(i.status)})}
          ${t.length?a`
                <div class="popover-wrap slot">
                  <button
                    class="icon"
                    title="More"
                    aria-label="More"
                    aria-expanded=${i.menuOpen}
                    @click=${()=>i.onMenuOpenChange(!i.menuOpen)}
                  >
                    ${jt}
                  </button>
                  ${i.menuOpen?Pi(i,t):d}
                </div>
              `:d}
        </div>
        <div class="compact-row">
          <div class="compact-speakers slot">
            ${e?.type==="speakers"?i.speakers(e):d}
          </div>
          <div class="slot">${i.send("pill")}</div>
        </div>
      </div>
      ${i.historyDialog()}
    </div>
  `}function Pi(i,e){return a`
    <div class="popover menu" role="menu">
      ${e.map(t=>t.type==="history"?a`
              <button
                class="menu-item"
                role="menuitem"
                @click=${()=>{i.onMenuOpenChange(!1),i.onOpenHistory()}}
              >
                ${ue}<span>Recent messages</span>
              </button>
            `:t.type==="volume"?a`
                <div class="menu-item menu-volume">
                  ${me}${i.volumePanel()}
                </div>
              `:d)}
    </div>
  `}function Wt(i){let e=i.sections.filter(s=>s.style==="icon"),t=i.sections.filter(s=>s.style!=="icon");return a`
    <div class="card full">
      <div class="head slot">
        <span class="title">${i.title}</span>
        <span class="head-actions">
          ${e.map(s=>s.type==="history"?i.historyButton():s.type==="volume"?i.volumeButton():"")}
        </span>
      </div>

      ${ye("strip",i.view,{idle:a`<span class="hint">${i.hint}</span>`,recording:fe(i.timer,i.timerWarning),review:a`
          ${i.play()} ${i.waveform("wave-strip")}
          <span class="clip-length">${i.clipLength}</span>
        `,status:ge(i.status)})}

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

      ${t.map(s=>s.type==="speakers"?a`<div class="section section-speakers slot" data-style=${s.style}>
              ${i.speakers(s)}
            </div>`:s.type==="history"?a`<div class="section slot">${i.historyList()}</div>`:"")}
      ${i.historyDialog()}
    </div>
  `}var Ft=3;function Yt(i,e,t){return a`
    <div
      class="history-row"
      data-loaded="${e.loadedId===i.id}"
      data-loading="${e.loadingId===i.id}"
    >
      <button class="history-load" @click=${()=>e.onLoad(i)}>
        <span class="history-when">${Pt(i.created,t)}</span>
        <span class="history-length">${V(i.duration)}</span>
      </button>
      ${i.can_delete?a`
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
  `}function De(i,e=i.now??new Date){let t=()=>i.onDialogOpenChange?.(!1);return a`
    <dialog class="history-dialog" @close=${t} @cancel=${t}>
      <div class="dialog-head">
        <span>Recent messages</span>
        <button class="icon" title="Close" aria-label="Close" @click=${t}>✕</button>
      </div>
      <div class="dialog-list">
        ${i.messages.length===0?a`<div class="empty">Nothing recorded yet</div>`:i.messages.map(s=>Yt(s,i,e))}
      </div>
    </dialog>
  `}function Kt(i){let e=i.now??new Date,t=i.messages.length===0,s=i.messages.slice(0,Ft);return a`
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
        ${Array.from({length:Ft},(o,r)=>a`
            <div class="history-slot">
              ${s[r]?Yt(s[r],i,e):r===0&&t?a`<div class="empty">Nothing recorded yet</div>`:d}
            </div>
          `)}
      </div>
      ${i.dialogOpen?De(i,e):d}
    </div>
  `}var Mi=.35;function Gt(i){let e=Math.min(1,Math.max(0,i.level||0));return a`
    <div
      class="mic-wrap"
      data-recording=${i.recording}
      data-mode=${i.recordMode}
      style="--mic:${i.size}px;--grow:${(1+e*Mi).toFixed(3)};--limit:${i.maxDuration}s"
    >
      <div class="mic-level" aria-hidden="true">
        <span class="blob blob-outer"></span>
        <span class="blob blob-inner"></span>
      </div>
      <button
        class="mic"
        ?disabled=${i.disabled}
        @pointerdown=${i.onPressStart}
        @pointerup=${i.onPressEnd}
        @pointercancel=${i.onPressEnd}
        @pointerleave=${i.onPressEnd}
        @contextmenu=${t=>t.preventDefault()}
        @keydown=${t=>{!t.repeat&&(t.key===" "||t.key==="Enter")&&i.onPressStart(t)}}
        @keyup=${t=>{(t.key===" "||t.key==="Enter")&&i.onPressEnd()}}
        title=${i.label}
        aria-label=${i.label}
      >
        <span class="mic-glyph mic-glyph-mic">${Ut}</span>
        <span class="mic-glyph mic-glyph-stop">${It}</span>
      </button>
      <svg class="mic-arc" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="mic-arc-track" cx="50" cy="50" r="46" pathLength="100" />
        <circle class="mic-arc-fill" cx="50" cy="50" r="46" pathLength="100" />
      </svg>
    </div>
  `}var Xt=2;function Jt(i,e){if(e.length===0)return"No speakers selected";let t=e.map(r=>i.find(n=>n.entityId===r)?.name??r),s=t.slice(0,Xt).join(", "),o=t.length-Xt;return o>0?`${s} +${o}`:s}function Qt(i,e){let t=i.selected.includes(e.entityId);return a`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?d:a`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${t?"\u2713":""}</span>
    </button>
  `}function Ri(i,e){let t=i.selected.includes(e.entityId);return a`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${t}
      data-on=${t}
      @click=${()=>i.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function Zt(i){let e=a`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${i.selected.length} of ${i.players.length}</span>
    </div>
  `;return i.players.length===0?i.style==="pill"?a`<div class="pill-wrap">
          <button class="pill" disabled>
            <span class="pill-icon">${Le}</span>
            <span class="pill-text">No speakers found</span>
          </button>
        </div>`:a`${e}<div class="empty">No speakers found</div>`:i.style==="chips"?a`
      ${e}
      <div class="chips">${i.players.map(t=>Ri(i,t))}</div>
    `:i.style==="pill"?a`
      <div class="pill-wrap">
        <button
          class="pill"
          aria-expanded=${i.open}
          aria-haspopup="true"
          title=${Jt(i.players,i.selected)}
          @click=${()=>i.onOpenChange(!i.open)}
        >
          <span class="pill-icon">${Le}</span>
          <span class="pill-text">${Jt(i.players,i.selected)}</span>
          <span class="pill-chevron">${Vt}</span>
        </button>
        ${i.open?a`
              <!-- Absolutely positioned: an inline panel would push
                   everything below it down the card. -->
              <div class="pill-panel">
                ${e}
                ${i.players.map(t=>Qt(i,t))}
              </div>
            `:d}
      </div>
    `:a`
    ${e}
    <div class="target-rows">${i.players.map(t=>Qt(i,t))}</div>
  `}function Oi(i){let t=i.currentTarget.getBoundingClientRect();return t.width===0?0:Math.min(1,Math.max(0,(i.clientX-t.left)/t.width))}function ei(i){let e=s=>i.progress!==void 0&&s/i.bars.length<i.progress,t=s=>{i.seekable&&i.onSeek(Oi(s))};return a`
    <div
      class="wave ${i.seekable?"seekable":""} ${i.className??""}"
      @pointerdown=${s=>{i.seekable&&(s.currentTarget.setPointerCapture(s.pointerId),t(s))}}
      @pointermove=${s=>{i.seekable&&s.buttons>0&&t(s)}}
      @pointerup=${s=>{i.seekable&&s.currentTarget.releasePointerCapture(s.pointerId)}}
      @pointercancel=${s=>{i.seekable&&s.currentTarget.releasePointerCapture(s.pointerId)}}
    >
      ${i.bars.map((s,o)=>a`
          <div
            class="bar ${e(o)?"played":i.recording?"live":""}"
            style="height:${Math.max(2,Math.round(s*100))}%;--i:${o}"
          ></div>
        `)}
    </div>
  `}function Ue(i){return a`
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
      ${i.enabled?a`
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
  `}function ti(i){return a`
    <div class="popover-wrap">
      <button
        class="icon"
        data-active=${i.enabled}
        aria-expanded=${i.open}
        title="Broadcast volume"
        aria-label="Broadcast volume"
        @click=${()=>i.onOpenChange(!i.open)}
      >
        ${me}
      </button>
      ${i.open?a`<div class="popover">${Ue(i)}</div>`:d}
    </div>
  `}var Li="Voice Broadcast",Di=4e3,Ui=10,Ii=.25,g=class extends b{constructor(){super(...arguments);this.config={type:""};this.selected=[];this.history=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.historyOpen=!1;this.volumeOpen=!1;this.menuOpen=!1;this.volumeOverride=!1;this.volume=1;this.rec=new he(this,{recordMode:()=>this.recordMode,maxDuration:()=>L(this.config.max_duration),onStart:()=>this.setStatus(void 0),onError:(t,s)=>this.fail(t,s),onTake:t=>{this.setClip(Tt(t.blob,t.duration,t.peaks))}})}setConfig(t){this.config=t,this.selected=t.targets?[...t.targets]:[]}get layout(){return P(this.config)}get sections(){return ne(this.config)}getCardSize(){if(this.layout==="compact")return 2;let t=5;for(let s of this.sections)s.type==="speakers"?t+=s.style==="rows"?4:s.style==="chips"?1:0:s.type==="history"&&s.style==="list"&&(t+=3);return t}getGridOptions(){return{columns:12,min_columns:6}}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain",record_mode:"push_to_talk",layout:"full",sections:[{type:"speakers",style:"pill"},{type:"history",style:"icon"},{type:"volume",style:"icon"}]}}connectedCallback(){super.connectedCallback(),this.rec.supported||(this.status={kind:"error",text:ct,sticky:!0}),this.refreshHistory()}updated(){let t=this.renderRoot?.querySelector?.("dialog");t&&!t.open&&t.showModal?.()}disconnectedCallback(){super.disconnectedCallback(),this.stopPlayback(),this.clearStatusTimer(),pe(this.clip),this.clip=void 0,this.historyOpen=!1,this.menuOpen=!1,this.volumeOpen=!1}async refreshHistory(){if(!(!this.hass||!bt(this.sections,"history")))try{this.history=await nt(this.hass)}catch{this.history=[]}}get players(){return pt(re(this.hass),this.config.show_players,this.config.hide_players)}get targets(){return ht(this.selected,this.config.show_players,this.config.hide_players)}get recordMode(){return this.config.record_mode==="start_stop"?"start_stop":"push_to_talk"}clearStatusTimer(){this.statusTimer!==void 0&&(window.clearTimeout(this.statusTimer),this.statusTimer=void 0)}setStatus(t){this.clearStatusTimer(),this.status=t,t&&!t.sticky&&(this.statusTimer=window.setTimeout(()=>{this.statusTimer=void 0,this.status===t&&(this.status=void 0)},Di))}fail(t,s=!1){this.setStatus({kind:"error",text:t,sticky:s})}setClip(t){this.stopPlayback(),this.clip&&this.clip!==t&&pe(this.clip),this.clip=t}clearClip(){this.stopPlayback(),pe(this.clip),this.clip=void 0}seek(t){if(!this.clip)return;this.position=t*this.clip.duration;let s=this.ensureAudio();s&&s.src===this.clip.url&&(s.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let t=this.ensureAudio();if(!(!t||!this.clip)){if(this.playing){t.pause(),this.playing=!1;return}t.src!==this.clip.url&&(t.src=this.clip.url,t.currentTime=this.position),t.play().then(()=>{this.playing=!0},s=>{this.fail(`Could not play that here: ${s?.message??s}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}toggleTarget(t){this.selected=this.selected.includes(t)?this.selected.filter(s=>s!==t):[...this.selected,t]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.rec.phase==="idle"}async broadcast(){if(this.rec.phase!=="idle")return;let t=this.clip;if(!t){this.fail("Record a message or pick one from below first.");return}let s=this.targets;if(s.length===0){this.fail("Pick at least one speaker first.");return}this.rec.setSending(!0),this.setStatus(void 0);try{let o=await Ot({hass:this.hass,clip:t,targets:s,mode:this.config.mode??"plain",volume:this.volumeOverride?this.volume:void 0,onStored:r=>{this.clip===t&&(this.clip={...t,source:{kind:"stored",id:r}})}});this.rec.setSending(!1),this.setStatus(Lt(this.hass,o)),await this.refreshHistory()}catch(o){this.rec.setSending(!1),this.fail(`Could not send: ${o?.message??o}`)}}async loadMessage(t){this.loadingId=t.id,this.historyOpen=!1,this.setStatus(void 0);try{this.setClip(await Et(this.hass,t))}catch(s){this.fail(s?.message??String(s))}finally{this.loadingId=void 0}}async deleteRecording(t){try{await at(this.hass,t)&&await this.refreshHistory()}catch(s){s?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${s?.message??s}`)}}get hint(){return this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}get recordLabel(){return this.rec.phase==="sending"?"Broadcasting":this.rec.phase==="recording"?this.recordMode==="push_to_talk"?"Recording \u2014 release to stop":"Recording \u2014 tap to stop":this.hint}get view(){return this.rec.phase==="recording"?"recording":this.status?"status":this.clip?"review":"idle"}get timerWarning(){let t=L(this.config.max_duration),s=Math.min(Ui,t*Ii);return this.rec.phase==="recording"&&t-this.rec.elapsed<=s}historyProps(){return{messages:this.history,loadedId:this.clip?de(this.clip):void 0,loadingId:this.loadingId,onLoad:t=>void this.loadMessage(t),onDelete:t=>void this.deleteRecording(t),onDialogOpenChange:t=>{this.historyOpen=t}}}get parts(){let t=this.rec.phase==="recording",s=this.rec.phase==="sending",o=this.clip!==void 0&&!t,r={enabled:this.volumeOverride,value:this.volume,onToggle:()=>{this.volumeOverride=!this.volumeOverride},onChange:n=>{this.volume=n}};return{title:this.config.title?.trim()||Li,view:this.view,sections:this.sections,hint:this.hint,timer:V(this.rec.elapsed),timerWarning:this.timerWarning,status:this.status,reviewing:o,mic:n=>Gt({size:n,recording:t,disabled:!this.rec.supported||s,recordMode:this.recordMode,level:this.rec.level,maxDuration:L(this.config.max_duration),label:this.recordLabel,onPressStart:l=>void this.rec.onPressStart(l),onPressEnd:()=>void this.rec.onPressEnd()}),play:()=>a`
        <button
          class="icon play"
          ?disabled=${!o||s}
          title=${this.playing?"Pause":"Play"}
          aria-label=${this.playing?"Pause":"Play"}
          @click=${()=>this.togglePlay()}
        >
          ${this.playing?Ht:zt}
        </button>
      `,waveform:n=>a`${ot(this.clip?.url??"none",ei({bars:this.clip?.peaks.length?this.clip.peaks:le(48),progress:this.clip?this.position/(this.clip.duration||1):void 0,seekable:o&&!s,recording:!1,onSeek:l=>this.seek(l),className:`${n} reveal`}))}`,clipLength:V(this.clip?.duration??0),discard:()=>a`
        <button
          class="icon discard"
          ?disabled=${!o||s}
          title="Discard"
          aria-label="Discard"
          @click=${()=>this.clearClip()}
        >
          ${Bt}
        </button>
      `,send:n=>{let l=this.targets.length,c=l>1?`Send to ${l}`:"Send";return a`
          <div class="send-wrap send-wrap-${n}">
            <button
              class="send send-${n}"
              ?disabled=${!this.canBroadcast}
              data-sending=${s}
              title=${c}
              aria-label=${s?"Broadcasting":c}
              @click=${()=>void this.broadcast()}
            >
              ${s?a`<span class="spinner" aria-hidden="true"></span>`:Nt}
              ${n==="pill"?a`<span>Send</span>`:d}
            </button>
            ${n==="round"?a`<span class="caption">${c}</span>`:d}
          </div>
        `},speakers:n=>Zt({players:this.players.map(l=>({entityId:l,name:this.hass?.states?.[l]?.attributes?.friendly_name??l,available:this.hass?.states?.[l]?.state!=="unavailable"})),selected:this.selected,style:n.style,open:this.pickerOpen,onToggle:l=>this.toggleTarget(l),onOpenChange:l=>{this.pickerOpen=l}}),historyList:()=>Kt({...this.historyProps(),dialogOpen:!1}),historyButton:()=>a`
        <button
          class="icon"
          title="Recent messages"
          aria-label="Recent messages"
          @click=${()=>{this.historyOpen=!0}}
        >
          ${ue}
        </button>
      `,volumeButton:()=>ti({...r,open:this.volumeOpen,onOpenChange:n=>{this.volumeOpen=n}}),volumePanel:()=>Ue(r),historyDialog:()=>this.historyOpen?De(this.historyProps()):d,menuOpen:this.menuOpen,onMenuOpenChange:n=>{this.menuOpen=n},onOpenHistory:()=>{this.historyOpen=!0}}}render(){let t=this.parts;return a`
      <ha-card>
        ${this.layout==="compact"?qt(t):Wt(t)}
        <div class="sr-only" aria-live="polite">${this.status?.text??""}</div>
      </ha-card>
    `}};g.styles=Dt,m([O({attribute:!1})],g.prototype,"hass",2),m([f()],g.prototype,"config",2),m([f()],g.prototype,"status",2),m([f()],g.prototype,"selected",2),m([f()],g.prototype,"history",2),m([f()],g.prototype,"clip",2),m([f()],g.prototype,"loadingId",2),m([f()],g.prototype,"position",2),m([f()],g.prototype,"playing",2),m([f()],g.prototype,"pickerOpen",2),m([f()],g.prototype,"historyOpen",2),m([f()],g.prototype,"volumeOpen",2),m([f()],g.prototype,"menuOpen",2),m([f()],g.prototype,"volumeOverride",2),m([f()],g.prototype,"volume",2),g=m([ie("hass-broadcast-card")],g);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{g as HassBroadcastCard,Di as STATUS_MS};
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

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/keyed.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
