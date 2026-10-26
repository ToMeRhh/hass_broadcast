var ii=Object.defineProperty;var ri=Object.getOwnPropertyDescriptor;var u=(t,e,i,r)=>{for(var s=r>1?void 0:r?ri(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&ii(e,i,s),s};var Z=globalThis,ee=Z.ShadowRoot&&(Z.ShadyCSS===void 0||Z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ae=Symbol(),Fe=new WeakMap,H=class{constructor(e,i,r){if(this._$cssResult$=!0,r!==Ae)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o,i=this.t;if(ee&&e===void 0){let r=i!==void 0&&i.length===1;r&&(e=Fe.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Fe.set(i,e))}return e}toString(){return this.cssText}},Ke=t=>new H(typeof t=="string"?t:t+"",void 0,Ae),_=(t,...e)=>{let i=t.length===1?t[0]:e.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new H(i,t,Ae)},Ye=(t,e)=>{if(ee)t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(let i of e){let r=document.createElement("style"),s=Z.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}},Ce=ee?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(let r of e.cssRules)i+=r.cssText;return Ke(i)})(t):t;var{is:si,defineProperty:oi,getOwnPropertyDescriptor:ni,getOwnPropertyNames:ai,getOwnPropertySymbols:li,getPrototypeOf:ci}=Object,te=globalThis,Ge=te.trustedTypes,di=Ge?Ge.emptyScript:"",pi=te.reactiveElementPolyfillSupport,q=(t,e)=>t,j={toAttribute(t,e){switch(e){case Boolean:t=t?di:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},ie=(t,e)=>!si(t,e),Xe={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??=Symbol("metadata"),te.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=Xe){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,i);s!==void 0&&oi(this.prototype,e,s)}}static getPropertyDescriptor(e,i,r){let{get:s,set:o}=ni(this.prototype,e)??{get(){return this[i]},set(n){this[i]=n}};return{get:s,set(n){let a=s?.call(this);o?.call(this,n),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Xe}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;let e=ci(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){let i=this.properties,r=[...ai(i),...li(i)];for(let s of r)this.createProperty(s,i[s])}let e=this[Symbol.metadata];if(e!==null){let i=litPropertyMetadata.get(e);if(i!==void 0)for(let[r,s]of i)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[i,r]of this.elementProperties){let s=this._$Eu(i,r);s!==void 0&&this._$Eh.set(s,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let i=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)i.unshift(Ce(s))}else e!==void 0&&i.push(Ce(e));return i}static _$Eu(e,i){let r=i.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,i=this.constructor.elementProperties;for(let r of i.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ye(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,i,r){this._$AK(e,r)}_$ET(e,i){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:j).toAttribute(i,r.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,i){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=r.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:j;this._$Em=s;let a=n.fromAttribute(i,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,i,r,s=!1,o){if(e!==void 0){let n=this.constructor;if(s===!1&&(o=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??ie)(o,i)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,i,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:r,reflect:s,wrapped:o},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??i??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(i=void 0),this._$AL.set(e,i)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,o]of r){let{wrapped:n}=o,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1,i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(i)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(i)}willUpdate(e){}_$AE(e){this._$EO?.forEach(i=>i.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(i=>this._$ET(i,this[i])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[q("elementProperties")]=new Map,x[q("finalized")]=new Map,pi?.({ReactiveElement:x}),(te.reactiveElementVersions??=[]).push("2.1.2");var Me=globalThis,Je=t=>t,re=Me.trustedTypes,Qe=re?re.createPolicy("lit-html",{createHTML:t=>t}):void 0,Pe="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Ee="?"+w,hi=`<${Ee}>`,C=document,W=()=>C.createComment(""),F=t=>t===null||typeof t!="object"&&typeof t!="function",Re=Array.isArray,st=t=>Re(t)||typeof t?.[Symbol.iterator]=="function",Te=`[ 	
\f\r]`,V=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ze=/-->/g,et=/>/g,S=RegExp(`>|${Te}(?:([^\\s"'>=/]+)(${Te}*=${Te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),tt=/'/g,it=/"/g,ot=/^(?:script|style|textarea|title)$/i,Oe=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),l=Oe(1),nt=Oe(2),Xi=Oe(3),T=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),rt=new WeakMap,A=C.createTreeWalker(C,129);function at(t,e){if(!Re(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Qe!==void 0?Qe.createHTML(e):e}var lt=(t,e)=>{let i=t.length-1,r=[],s,o=e===2?"<svg>":e===3?"<math>":"",n=V;for(let a=0;a<i;a++){let c=t[a],p,g,h=-1,b=0;for(;b<c.length&&(n.lastIndex=b,g=n.exec(c),g!==null);)b=n.lastIndex,n===V?g[1]==="!--"?n=Ze:g[1]!==void 0?n=et:g[2]!==void 0?(ot.test(g[2])&&(s=RegExp("</"+g[2],"g")),n=S):g[3]!==void 0&&(n=S):n===S?g[0]===">"?(n=s??V,h=-1):g[1]===void 0?h=-2:(h=n.lastIndex-g[2].length,p=g[1],n=g[3]===void 0?S:g[3]==='"'?it:tt):n===it||n===tt?n=S:n===Ze||n===et?n=V:(n=S,s=void 0);let $=n===S&&t[a+1].startsWith("/>")?" ":"";o+=n===V?c+hi:h>=0?(r.push(p),c.slice(0,h)+Pe+c.slice(h)+w+$):c+w+(h===-2?a:$)}return[at(t,o+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},K=class t{constructor({strings:e,_$litType$:i},r){let s;this.parts=[];let o=0,n=0,a=e.length-1,c=this.parts,[p,g]=lt(e,i);if(this.el=t.createElement(p,r),A.currentNode=this.el.content,i===2||i===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=A.nextNode())!==null&&c.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(Pe)){let b=g[n++],$=s.getAttribute(h).split(w),Q=/([.?@])?(.*)/.exec(b);c.push({type:1,index:o,name:Q[2],strings:$,ctor:Q[1]==="."?oe:Q[1]==="?"?ne:Q[1]==="@"?ae:P}),s.removeAttribute(h)}else h.startsWith(w)&&(c.push({type:6,index:o}),s.removeAttribute(h));if(ot.test(s.tagName)){let h=s.textContent.split(w),b=h.length-1;if(b>0){s.textContent=re?re.emptyScript:"";for(let $=0;$<b;$++)s.append(h[$],W()),A.nextNode(),c.push({type:2,index:++o});s.append(h[b],W())}}}else if(s.nodeType===8)if(s.data===Ee)c.push({type:2,index:o});else{let h=-1;for(;(h=s.data.indexOf(w,h+1))!==-1;)c.push({type:7,index:o}),h+=w.length-1}o++}}static createElement(e,i){let r=C.createElement("template");return r.innerHTML=e,r}};function M(t,e,i=t,r){if(e===T)return e;let s=r!==void 0?i._$Co?.[r]:i._$Cl,o=F(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(t),s._$AT(t,i,r)),r!==void 0?(i._$Co??=[])[r]=s:i._$Cl=s),s!==void 0&&(e=M(t,s._$AS(t,e.values),s,r)),e}var se=class{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:i},parts:r}=this._$AD,s=(e?.creationScope??C).importNode(i,!0);A.currentNode=s;let o=A.nextNode(),n=0,a=0,c=r[0];for(;c!==void 0;){if(n===c.index){let p;c.type===2?p=new D(o,o.nextSibling,this,e):c.type===1?p=new c.ctor(o,c.name,c.strings,this,e):c.type===6&&(p=new le(o,this,e)),this._$AV.push(p),c=r[++a]}n!==c?.index&&(o=A.nextNode(),n++)}return A.currentNode=C,s}p(e){let i=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,i),i+=r.strings.length-2):r._$AI(e[i])),i++}},D=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,i,r,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,i=this._$AM;return i!==void 0&&e?.nodeType===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=M(this,e,i),F(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):st(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){let{values:i,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=K.createElement(at(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(i);else{let o=new se(s,this),n=o.u(this.options);o.p(i),this.T(n),this._$AH=o}}_$AC(e){let i=rt.get(e.strings);return i===void 0&&rt.set(e.strings,i=new K(e)),i}k(e){Re(this._$AH)||(this._$AH=[],this._$AR());let i=this._$AH,r,s=0;for(let o of e)s===i.length?i.push(r=new t(this.O(W()),this.O(W()),this,this.options)):r=i[s],r._$AI(o),s++;s<i.length&&(this._$AR(r&&r._$AB.nextSibling,s),i.length=s)}_$AR(e=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);e!==this._$AB;){let r=Je(e).nextSibling;Je(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,r,s,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=i,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=d}_$AI(e,i=this,r,s){let o=this.strings,n=!1;if(o===void 0)e=M(this,e,i,0),n=!F(e)||e!==this._$AH&&e!==T,n&&(this._$AH=e);else{let a=e,c,p;for(e=o[0],c=0;c<o.length-1;c++)p=M(this,a[r+c],i,c),p===T&&(p=this._$AH[c]),n||=!F(p)||p!==this._$AH[c],p===d?e=d:e!==d&&(e+=(p??"")+o[c+1]),this._$AH[c]=p}n&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},oe=class extends P{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},ne=class extends P{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}},ae=class extends P{constructor(e,i,r,s,o){super(e,i,r,s,o),this.type=5}_$AI(e,i=this){if((e=M(this,e,i,0)??d)===T)return;let r=this._$AH,s=e===d&&r!==d||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==d&&(r===d||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},le=class{constructor(e,i,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}},ct={M:Pe,P:w,A:Ee,C:1,L:lt,R:se,D:st,V:M,I:D,H:P,N:ne,U:ae,B:oe,F:le},ui=Me.litHtmlPolyfillSupport;ui?.(K,D),(Me.litHtmlVersions??=[]).push("3.3.3");var dt=(t,e,i)=>{let r=i?.renderBefore??e,s=r._$litPart$;if(s===void 0){let o=i?.renderBefore??null;r._$litPart$=s=new D(e.insertBefore(W(),o),o,void 0,i??{})}return s._$AI(t),s};var De=globalThis,y=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=dt(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};y._$litElement$=!0,y.finalized=!0,De.litElementHydrateSupport?.({LitElement:y});var mi=De.litElementPolyfillSupport;mi?.({LitElement:y});(De.litElementVersions??=[]).push("4.2.2");var ce=t=>(e,i)=>{i!==void 0?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};var fi={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:ie},gi=(t=fi,e,i)=>{let{kind:r,metadata:s}=i,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),r==="accessor"){let{name:n}=i;return{set(a){let c=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,c,t,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,t,a),a}}}if(r==="setter"){let{name:n}=i;return function(a){let c=this[n];e.call(this,a),this.requestUpdate(n,c,t,!0,a)}}throw Error("Unsupported decorator location: "+r)};function L(t){return(e,i)=>typeof i=="object"?gi(t,e,i):((r,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(t,e,i)}function f(t){return L({...t,state:!0,attribute:!1})}var pt=t=>(...e)=>({_$litDirective$:t,values:e}),pe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,r){this._$Ct=e,this._$AM=i,this._$Ci=r}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};var{I:Ir}=ct;var vi={},ht=(t,e=vi)=>t._$AH=e;var ut=pt(class extends pe{constructor(){super(...arguments),this.key=d}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(ht(t),this.key=e),i}});async function mt(t,e,i){let r=new FormData;r.append("file",e,"recording.wav"),r.append("duration",String(i));let s=await fetch("/api/hass_broadcast/upload",{method:"POST",body:r,headers:{Authorization:`Bearer ${t.auth.data.access_token}`}});if(!s.ok)throw new Error(`Upload failed (${s.status})`);return(await s.json()).message_id}async function ft(t){return(await t.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function gt(t,e){return(await t.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function vt(t,e,i,r,s){return{failed:(await t.connection.sendMessagePromise({type:"hass_broadcast/send",message_id:e,targets:i,mode:r,...s!==void 0?{volume:s}:{}})).failed}}var he="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function yt(t){return t?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${t?.message??t?.name??"unknown error"}`}function Y(t){return t?.states?Object.keys(t.states).filter(e=>e.startsWith("media_player.")).filter(e=>(t.states[e].attributes.supported_features&512)!==0).sort():[]}function bt(t,e){return e?[...new Set(e)]:t}function xt(t,e){if(!e)return t;let i=new Set(e);return t.filter(r=>i.has(r))}var yi="Voice Broadcast";function G(t,e){return e.includes(t)?t:e[0]}function ue(t){if(t===""||t===null||t===void 0)return 60;let e=Number(t);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var bi=["plain","chime","restore"];function Le(t){return G(t,bi)}function Ue(t){let e=G(t.layout,["full","compact"]),i=Array.isArray(t.speakers)?[...new Set(t.speakers)]:void 0,r=i?new Set(i):void 0,s=(Array.isArray(t.selected)?t.selected:[]).filter(o=>!r||r.has(o));return{title:t.title?.trim()||yi,layout:e,speakerPicker:e==="compact"?"dropdown":G(t.speaker_picker,["dropdown","chips","list"]),recentMessages:G(t.recent_messages,["button","off","list"]),volumeControl:t.volume_control!==!1,speakers:i,selected:s,recordMode:G(t.record_mode,["push_to_talk","start_stop"]),maxDuration:ue(t.max_duration),noiseSuppression:t.noise_suppression===!0,mode:Le(t.mode)}}function E(t){let e=i=>{let r=i?{bg:"#2b2b2b",g:"#5f6368",r:"#e2574c",b:"#4fa3e0"}:{bg:"#eef0f3",g:"#c4cbd4",r:"#db4437",b:"#039be5"},s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64" width="120" height="64"><rect width="120" height="64" rx="6" fill="${r.bg}"/>`+t.replace(/\$g/g,r.g).replace(/\$r/g,r.r).replace(/\$b/g,r.b)+"</svg>";return`data:image/svg+xml,${encodeURIComponent(s)}`};return{src:e(!1),src_dark:e(!0)}}var R={full:E('<rect x="14" y="9" width="40" height="5" rx="2.5" fill="$g"/><circle cx="96" cy="11.5" r="3" fill="$g"/><circle cx="105" cy="11.5" r="3" fill="$g"/><circle cx="60" cy="32" r="11" fill="$r"/><circle cx="84" cy="32" r="5" fill="$g"/><rect x="42" y="50" width="36" height="7" rx="3.5" fill="$g"/>'),compact:E('<circle cx="26" cy="32" r="12" fill="$r"/><rect x="46" y="20" width="40" height="5" rx="2.5" fill="$g"/><rect x="104" y="18" width="3" height="9" rx="1.5" fill="$g"/><rect x="46" y="36" width="42" height="9" rx="4.5" fill="$g"/><rect x="92" y="36" width="18" height="9" rx="4.5" fill="$b"/>'),dropdown:E('<rect x="28" y="24" width="64" height="16" rx="8" fill="none" stroke="$g" stroke-width="2"/><rect x="36" y="30" width="34" height="4" rx="2" fill="$g"/><path d="M78 30l4 4 4-4" stroke="$g" stroke-width="2" fill="none"/>'),chips:E('<rect x="14" y="25" width="30" height="14" rx="7" fill="$b"/><rect x="48" y="25" width="26" height="14" rx="7" fill="$g"/><rect x="78" y="25" width="28" height="14" rx="7" fill="$b"/>'),list:E('<rect x="22" y="14" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="13" width="7" height="7" rx="1.5" fill="$b"/><rect x="22" y="29" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="28" width="7" height="7" rx="1.5" fill="$g"/><rect x="22" y="44" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="43" width="7" height="7" rx="1.5" fill="$b"/>'),square:E('<rect x="38" y="6" width="44" height="52" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="60" cy="26" r="10" fill="$r"/><rect x="47" y="43" width="26" height="5" rx="2.5" fill="$g"/>'),horizontal:E('<rect x="12" y="18" width="96" height="28" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="30" cy="32" r="9" fill="$r"/><rect x="46" y="26" width="36" height="5" rx="2.5" fill="$g"/><rect x="46" y="35" width="24" height="4" rx="2" fill="$g"/>')},ze=t=>({name:t,selector:{entity:{multiple:!0,filter:{domain:"media_player"}}}}),wt={name:"max_duration",selector:{number:{min:5,max:300,step:5,mode:"slider",unit_of_measurement:"s"}}},$t={name:"noise_suppression",selector:{boolean:{}}},xi={title:"Leave empty for \u201CVoice Broadcast\u201D",name:"Leave empty for \u201CIntercom\u201D",noise_suppression:"Filters out background noise such as a TV or fan. Leave it off in a quiet room: it can make a voice sound slightly processed."},kt=t=>xi[t.name],_t={type:"expandable",name:"",flatten:!0,title:"Playback",icon:"mdi:volume-high",schema:[{name:"mode",selector:{select:{mode:"box",box_max_columns:1,options:[{value:"plain",label:"Just play it",description:"Interrupts whatever is playing"},{value:"chime",label:"Chime first",description:"A short tone, then the message"},{value:"restore",label:"Pause, then resume",description:"Puts back what was playing and its volume"}]}}}]},wi={title:"Name",name:"Name",layout:"Layout",speaker_picker:"Speaker picker",recent_messages:"Recent messages",volume_control:"Volume control",speakers:"Speakers on the card",selected:"Selected when the card opens",record_mode:"Recording",max_duration:"Time limit",noise_suppression:"Noise suppression",mode:"When it plays",shape:"Shape"},St=t=>wi[t.name],At={schema:[{name:"title",selector:{text:{}}},{type:"expandable",name:"",flatten:!0,title:"Appearance",icon:"mdi:palette-outline",expanded:!0,schema:[{name:"layout",selector:{select:{mode:"box",options:[{value:"full",label:"Full",image:R.full},{value:"compact",label:"Compact",image:R.compact}]}}},{name:"speaker_picker",visible:{field:"layout",value:"full"},selector:{select:{mode:"box",options:[{value:"dropdown",label:"Dropdown",image:R.dropdown},{value:"chips",label:"Chips",image:R.chips},{value:"list",label:"List",image:R.list}]}}},{name:"recent_messages",selector:{select:{mode:"dropdown",options:[{value:"off",label:"Off"},{value:"button",label:"Button in the header"},{value:"list",label:"List below the card"}]}}},{name:"volume_control",selector:{boolean:{}}}]},{type:"expandable",name:"",flatten:!0,title:"Speakers",icon:"mdi:speaker",expanded:!0,schema:[ze("speakers"),ze("selected")]},{type:"expandable",name:"",flatten:!0,title:"Recording",icon:"mdi:microphone",schema:[{name:"record_mode",selector:{select:{mode:"box",options:[{value:"push_to_talk",label:"Hold to talk",description:"Records while the button is held"},{value:"start_stop",label:"Tap to start and stop",description:"Tap once to start, again to stop"}]}}},wt,$t]},_t],computeLabel:St,computeHelper:kt},Ct={schema:[{name:"name",selector:{text:{}}},{type:"expandable",name:"",flatten:!0,title:"Speakers",icon:"mdi:speaker",expanded:!0,schema:[ze("speakers")]},{type:"expandable",name:"",flatten:!0,title:"Appearance",icon:"mdi:palette-outline",expanded:!0,schema:[{name:"shape",selector:{select:{mode:"box",options:[{value:"square",label:"Square",image:R.square},{value:"horizontal",label:"Horizontal",image:R.horizontal}]}}}]},{type:"expandable",name:"",flatten:!0,title:"Recording",icon:"mdi:microphone",schema:[wt,$t]},_t],computeLabel:t=>t.name==="speakers"?"Sends to":St(t),computeHelper:kt};function O(t){let e=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function Tt(t,e){return t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}function Ie(t){return t.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Mt(t,e=new Date){let i=new Date(t);if(Number.isNaN(i.getTime()))return"Unknown time";let r=(e.getTime()-i.getTime())/1e3;if(r<60)return"Just now";if(r<3600){let n=Math.round(r/60);return`${n} minute${n===1?"":"s"} ago`}if(Tt(i,e))return`Today ${Ie(i)}`;let s=new Date(e);return s.setDate(e.getDate()-1),Tt(i,s)?`Yesterday ${Ie(i)}`:`${i.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${Ie(i)}`}function Pt(t){return Number.isFinite(t)?Math.min(1,Math.max(0,t)):0}function fe(t){return new Array(Math.max(0,t)).fill(0)}function Et(t,e){if(e<=0)return[];if(t.length===0)return fe(e);let i=[];for(let r=0;r<e;r++){let s=Math.floor(r*t.length/e),o=Math.max(s+1,Math.floor((r+1)*t.length/e)),n=0;for(let a=s;a<o&&a<t.length;a++)n=Math.max(n,t[a]);i.push(n)}return i}function Ne(t){let e=t.reduce((i,r)=>Math.max(i,r),0);return e<=0?[...t]:t.map(i=>i/e)}function ge(t,e){let i=[];for(let r=0;r<e;r++){let s=Math.floor(r*t.length/e),o=Math.floor((r+1)*t.length/e),n=0;for(let a=s;a<o;a++)n=Math.max(n,Math.abs(t[a]));i.push(n)}return Ne(i)}var me=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,i){if(this.windowStart===void 0)return this.windowStart=i,this.pending=Pt(e),!1;let r=!1;return i-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=i,r=!0),this.pending=Math.max(this.pending,Pt(e)),r}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let i=this.peaks.slice(-e);return[...fe(e-i.length),...i]}};function Rt(t,e){let i=t.length*2,r=new ArrayBuffer(44+i),s=new DataView(r),o=(n,a)=>{for(let c=0;c<a.length;c++)s.setUint8(n+c,a.charCodeAt(c))};return o(0,"RIFF"),s.setUint32(4,36+i,!0),o(8,"WAVE"),o(12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,e,!0),s.setUint32(28,e*2,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),o(36,"data"),s.setUint32(40,i,!0),new Int16Array(r,44).set(t),new Blob([r],{type:"audio/wav"})}var ve=[48e3,32e3,24e3,16e3],$i=10*1024*1024,ki=44,_i=1,Be=300,Si=250,Ai=.89*32767,Ci=10,Ti="/api/hass_broadcast/static/recorder-worklet.js",Mi={channelCount:1,echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},X=class{constructor(){this.chunks=[];this.active=!1;this.options={}}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}get trackSettings(){return this.stream?.getAudioTracks()[0]?.getSettings()}async start(e,i={}){this.chunks=[],this.options=i;try{this.stream=await navigator.mediaDevices.getUserMedia({audio:i.constraints??{...Mi,noiseSuppression:i.noiseSuppression??!1}}),this.context=new AudioContext({sampleRate:i.sampleRate??Pi(e)}),await this.context.audioWorklet.addModule(Ti);let r=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=s=>{if(s.data==="flushed"){this.flushed?.();return}this.chunks.push(s.data),this.levelCallback&&this.levelCallback(Ri(s.data))},r.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(r){throw await this.release(),r}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");this.active=!1,await new Promise(a=>setTimeout(a,this.options.stopTail??Be)),await this.flush();let e=this.context?.sampleRate??ve[0],i=this.chunks,r=this.options.normalize??!0;await this.release();let s=i.reduce((a,c)=>a+c.length,0),o=new Int16Array(s),n=0;for(let a of i)o.set(a,n),n+=a.length;return r&&Ei(o),{blob:Rt(o,e),duration:s/e,peaks:ge(o,48)}}flush(){let e=this.node;return e?new Promise(i=>{let r=setTimeout(i,Si);this.flushed=()=>{clearTimeout(r),i()},e.port.postMessage("flush")}):Promise.resolve()}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1,this.flushed=void 0}}};function Pi(t){let e=r=>r*2,i=r=>ki+e(r)*(t+_i)<=$i;return ve.find(i)??ve[ve.length-1]}function Ei(t){let e=0;for(let r of t)e=Math.max(e,Math.abs(r));if(e===0)return;let i=Math.min(Ci,Ai/e);if(!(i<=1))for(let r=0;r<t.length;r++)t[r]=Math.round(t[r]*i)}function Ri(t){let e=0;for(let i of t)e=Math.max(e,Math.abs(i));return e/32768}var Oi=.4,Di=Oi+Be/1e3,z=class{constructor(e,i){this.host=e;this.options=i;this.phase="idle";this.elapsed=0;this.level=0;this.recorder=new X;this.envelope=new me;this.busy=!1;this.disconnected=!1;this.stopRequested=!1;e.addController(this)}get supported(){return X.isSupported()}hostConnected(){this.disconnected=!1}hostDisconnected(){this.disconnected=!0,this.clearTimer(),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.level=0,this.release())}setSending(e){this.phase=e?"sending":"idle",this.host.requestUpdate()}async onPressStart(e){if(!(this.phase==="sending"||!this.supported)){if(this.options.recordMode()==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}e.preventDefault(),!this.busy&&(this.stopRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await this.stopRecording())}}async onPressEnd(){if(this.options.recordMode()==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0;return}await this.stopRecording()}}async startRecording(){if(this.busy||this.phase!=="idle")return;this.busy=!0,this.options.onStart?.();try{this.recorder.onLevel(i=>{this.phase==="recording"&&this.envelope.push(i,Date.now())&&(this.level=this.envelope.tail(1)[0],this.host.requestUpdate())}),this.envelope.reset(),await this.recorder.start(this.options.maxDuration(),{noiseSuppression:this.options.noiseSuppression?.()??!1})}catch(i){this.options.onError(yt(i),i?.name==="NotAllowedError"),this.host.requestUpdate();return}finally{this.busy=!1}if(this.disconnected){this.release();return}this.phase="recording",this.elapsed=0,this.level=0,this.host.requestUpdate();let e=this.options.maxDuration();this.timer=window.setInterval(()=>{this.elapsed+=1,this.host.requestUpdate(),this.elapsed>=e&&this.stopRecording()},1e3)}async stopRecording(){if(this.busy||this.phase!=="recording")return;this.busy=!0,this.clearTimer(),this.phase="finishing",this.level=0,this.host.requestUpdate();let e;try{let{blob:i,duration:r,peaks:s}=await this.recorder.stop();this.phase="idle",this.options.recordMode()==="push_to_talk"&&r<Di?this.options.onError("Hold the button while you speak.",!1):e={blob:i,duration:r,peaks:s}}catch(i){this.phase="idle",this.options.onError(`Could not finish recording: ${i?.message??i}`,!1)}finally{this.busy=!1,this.level=0,this.host.requestUpdate()}e&&await this.options.onTake(e)}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}release(){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1})}};function Ot(t,e,i){return{source:{kind:"fresh",blob:t},url:URL.createObjectURL(t),duration:e,peaks:Ne(Et(i,48))}}function I(t){return t.source.kind==="stored"?t.source.id:void 0}var Li=async(t,e)=>{let i=globalThis.AudioContext??globalThis.webkitAudioContext;if(!i)return[];let r=new i;try{let s=await r.decodeAudioData(await t.arrayBuffer());return ge(s.getChannelData(0),e)}finally{await r.close?.()}};async function Dt(t,e,i=Li){let r=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${t.auth.data.access_token}`}});if(!r.ok)throw new Error(`Could not load that recording (${r.status})`);let s=await r.blob(),o=[];try{o=await i(s,48)}catch{o=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(s),duration:e.duration,peaks:o}}function ye(t){t&&URL.revokeObjectURL(t.url)}async function be(t){let{hass:e,clip:i,targets:r}=t,s=I(i);if(s===void 0){let n=i.source.blob;s=await mt(e,n,i.duration),t.onStored?.(s)}let{failed:o}=await vt(e,s,r,t.mode,t.volume);return o.length===0?{kind:"sent",targets:r}:o.length>=r.length?{kind:"failed",failed:o}:{kind:"partial",failed:o}}function J(t,e){return e.map(i=>t?.states?.[i]?.attributes?.friendly_name??i).join(", ")}function xe(t,e){switch(e.kind){case"sent":return{kind:"info",text:`Sent to ${J(t,e.targets)}`};case"partial":return{kind:"error",text:`Played, but not on ${J(t,e.failed)}.`};case"failed":return{kind:"error",text:`Could not play on any speaker: ${J(t,e.failed)}.`}}}var He=_`
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
`,qe=_`
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
`,Lt=[He,qe,_`
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
  `];var v=t=>nt`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d=${t} /></svg>`,Ut=v("M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z"),zt=v("M7 7h10v10H7z"),It=v("M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"),Nt=v("M8 5v14l11-7z"),Bt=v("M6 5h4v14H6zm8 0h4v14h-4z"),we=v("M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"),$e=v("M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"),ke=v("M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"),Ht=v("M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"),je=v("M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2a2 2 0 0 1 0-4zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"),qt=v("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"),jt=v("M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"),Vt=v("M7 10l5 5 5-5z");var Ui=.35;function _e(t){let e=Math.min(1,Math.max(0,t.level||0));return l`
    <div
      class="mic-wrap"
      data-recording=${t.recording}
      data-mode=${t.recordMode}
      style="--mic:${t.size}px;--grow:${(1+e*Ui).toFixed(3)};--limit:${t.maxDuration}s"
    >
      <div class="mic-level" aria-hidden="true">
        <span class="blob blob-outer"></span>
        <span class="blob blob-inner"></span>
      </div>
      <button
        class="mic"
        ?disabled=${t.disabled}
        @pointerdown=${t.onPressStart}
        @pointerup=${t.onPressEnd}
        @pointercancel=${t.onPressEnd}
        @pointerleave=${t.onPressEnd}
        @contextmenu=${i=>i.preventDefault()}
        @keydown=${i=>{!i.repeat&&(i.key===" "||i.key==="Enter")&&t.onPressStart(i)}}
        @keyup=${i=>{(i.key===" "||i.key==="Enter")&&t.onPressEnd()}}
        title=${t.label}
        aria-label=${t.label}
      >
        <span class="mic-glyph mic-glyph-mic">${Ut}</span>
        <span class="mic-glyph mic-glyph-stop">${zt}</span>
      </button>
      <svg class="mic-arc" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="mic-arc-track" cx="50" cy="50" r="46" pathLength="100" />
        <circle class="mic-arc-fill" cx="50" cy="50" r="46" pathLength="100" />
      </svg>
    </div>
  `}function Se(t){return t?l`<span class="status ${t.kind}" title=${t.text}>${t.text}</span>`:d}function N(t,e){return l`<span class="timer" data-warning=${e}>${t}</span>`}function B(t,e,i){return l`
    <div class="layers slot ${t}" data-active=${e}>
      ${Object.keys(i).map(r=>l`
          <div
            class="layer layer-${r}"
            data-on=${r===e}
            ?inert=${r!==e}
            aria-hidden=${r!==e}
          >
            ${i[r]}
          </div>
        `)}
    </div>
  `}var zi=2500,k=class extends y{constructor(){super(...arguments);this.config={type:""};this.rec=new z(this,{recordMode:()=>"push_to_talk",maxDuration:()=>ue(this.config.max_duration),noiseSuppression:()=>this.config.noise_suppression===!0,onStart:()=>this.showResult(void 0),onError:i=>this.showResult({kind:"failed",text:Ii(i),detail:i}),onTake:i=>this.send(i)})}setConfig(i){this.config=i}get shape(){return this.config.shape==="horizontal"?"horizontal":"square"}get targets(){return Array.isArray(this.config.speakers)?this.config.speakers:[]}getCardSize(){return this.shape==="square"?3:1}getGridOptions(){return this.shape==="square"?{rows:2,columns:3,min_rows:2,min_columns:3}:{rows:1,columns:6,min_rows:1,max_rows:1,min_columns:4}}static getConfigForm(){return Ct}static getStubConfig(i){let r=Y(i)[0];return{type:"custom:hass-broadcast-tile",name:"Intercom",speakers:r?[r]:[],shape:"square",mode:"plain"}}disconnectedCallback(){super.disconnectedCallback(),this.clearResultTimer(),this.result=void 0}clearResultTimer(){this.resultTimer!==void 0&&(window.clearTimeout(this.resultTimer),this.resultTimer=void 0)}showResult(i){this.clearResultTimer(),this.result=i,i&&(this.resultTimer=window.setTimeout(()=>{this.resultTimer=void 0,this.result=void 0},zi))}async send(i){if(this.targets.length===0){this.showResult({kind:"failed",text:"No speakers set",detail:"Pick speakers in the card editor."});return}this.rec.setSending(!0);try{let r=await be({hass:this.hass,clip:{source:{kind:"fresh",blob:i.blob},url:"",duration:i.duration,peaks:[]},targets:this.targets,mode:Le(this.config.mode)});this.showResult(this.describe(r))}catch(r){let s=`Could not send: ${r?.message??r}`;this.showResult({kind:"failed",text:"Not sent",detail:s})}finally{this.rec.setSending(!1)}}describe(i){let r=xe(this.hass,i).text;switch(i.kind){case"sent":return{kind:"sent",text:"Sent",detail:r};case"partial":return{kind:"partial",text:`Not on ${J(this.hass,i.failed)}`,detail:r};case"failed":return{kind:"failed",text:"Not sent",detail:r}}}get name(){return this.config.name?.trim()||"Intercom"}get idleText(){return this.rec.supported?this.targets.length?"Hold to talk":"Pick speakers in the card editor":"Needs HTTPS"}render(){let i=this.rec.phase==="recording",r=this.rec.phase==="sending"||this.rec.phase==="finishing",s=ue(this.config.max_duration),o=i&&s-this.rec.elapsed<=Math.min(10,s*.25),n=i?"recording":r?"sending":this.result?.kind??"idle",a=p=>l`${p}<span title=${this.result?.detail??""}>${this.result?.text??""}</span>`,c=i?"Recording \u2014 release to send":`Hold to talk to ${this.name}`;return l`
      <ha-card>
        <div class="tile ${this.shape}" title=${this.rec.supported?"":he}>
          <div class="slot">
            ${_e({size:this.shape==="square"?52:40,recording:i,disabled:!this.rec.supported||r||this.targets.length===0,recordMode:"push_to_talk",level:this.rec.level,maxDuration:s,label:c,onPressStart:p=>{this.rec.onPressStart(p)},onPressEnd:()=>{this.rec.onPressEnd()}})}
          </div>
          <div class="text">
            <span class="name">${this.name}</span>
            ${B("tile-status",n,{idle:l`<span>${this.idleText}</span>`,recording:N(O(this.rec.elapsed),o),sending:l`<span>Sending…</span>`,sent:a(qt),partial:a(jt),failed:a(we)})}
          </div>
        </div>
        <div class="sr-only" aria-live="polite">${this.result?.detail??""}</div>
      </ha-card>
    `}};k.styles=[He,qe,_`
      ha-card {
        height: 100%;
        box-sizing: border-box;
        overflow: visible;
      }
      .tile {
        display: grid;
        height: 100%;
        box-sizing: border-box;
        align-items: center;
      }
      .tile.square {
        grid-template-rows: 1fr auto;
        justify-items: center;
        gap: 6px;
        padding: 12px 8px;
        text-align: center;
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
        height: 18px;
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
      .layer-failed {
        color: var(--error-color, #db4437);
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
        .layer {
          transition: none;
        }
      }
    `],u([L({attribute:!1})],k.prototype,"hass",2),u([f()],k.prototype,"config",2),u([f()],k.prototype,"result",2),k=u([ce("hass-broadcast-tile")],k);function Ii(t){return t.split(/(?<=\.) /)[0]}window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-tile",name:"Voice Broadcast Tile",description:"Hold to talk, let go to send to the speakers you chose.",preview:!0});function Wt(t){let e=t.recentMessages!=="off"||t.volumeControl;return l`
    <div class="card compact">
      <div class="compact-mic slot">${t.mic(72)}</div>
      <div class="compact-body">
        <div class="compact-row">
          ${B("compact-status",t.view,{idle:l`
              <span class="title">${t.title}</span>
              <span class="hint">${t.hint}</span>
            `,recording:N(t.timer,t.timerWarning),review:l`
              ${t.play()} ${t.waveform("wave-mini")} ${t.discard()}
            `,status:Se(t.status)})}
          ${e?l`
                <div class="popover-wrap slot">
                  <button
                    class="icon"
                    title="More"
                    aria-label="More"
                    aria-expanded=${t.menuOpen}
                    @click=${()=>t.onMenuOpenChange(!t.menuOpen)}
                  >
                    ${Ht}
                  </button>
                  ${t.menuOpen?Ni(t):d}
                </div>
              `:d}
        </div>
        <div class="compact-row">
          <div class="compact-speakers slot">${t.speakers()}</div>
          <div class="slot">${t.send("pill")}</div>
        </div>
      </div>
      ${t.historyDialog()}
    </div>
  `}function Ni(t){return l`
    <div class="popover menu" role="menu">
      ${t.recentMessages!=="off"?l`
            <button
              class="menu-item"
              role="menuitem"
              @click=${()=>{t.onMenuOpenChange(!1),t.onOpenHistory()}}
            >
              ${$e}<span>Recent messages</span>
            </button>
          `:d}
      ${t.volumeControl?l`<div class="menu-item menu-volume">${ke}${t.volumePanel()}</div>`:d}
    </div>
  `}function Ft(t){return l`
    <div class="card full">
      <div class="head slot">
        <span class="title">${t.title}</span>
        <span class="head-actions">
          ${t.recentMessages==="button"?t.historyButton():d}
          ${t.volumeControl?t.volumeButton():d}
        </span>
      </div>

      ${B("strip",t.view,{idle:l`<span class="hint">${t.hint}</span>`,recording:N(t.timer,t.timerWarning),review:l`
          ${t.play()} ${t.waveform("wave-strip")}
          <span class="clip-length">${t.clipLength}</span>
        `,status:Se(t.status)})}

      <div class="core">
        <div class="core-side slot">
          <div class="pop" data-on=${t.reviewing} ?inert=${!t.reviewing}>
            ${t.discard()}
            <span class="caption">Discard</span>
          </div>
        </div>
        <div class="core-mic slot">${t.mic(96)}</div>
        <div class="core-side slot">${t.send("round")}</div>
      </div>

      <div class="section section-speakers slot" data-style=${t.speakerPicker}>
        ${t.speakers()}
      </div>
      ${t.recentMessages==="list"?l`<div class="section slot">${t.historyList()}</div>`:d}
      ${t.historyDialog()}
    </div>
  `}var Kt=3;function Yt(t,e,i){return l`
    <div
      class="history-row"
      data-loaded="${e.loadedId===t.id}"
      data-loading="${e.loadingId===t.id}"
    >
      <button class="history-load" @click=${()=>e.onLoad(t)}>
        <span class="history-when">${Mt(t.created,i)}</span>
        <span class="history-length">${O(t.duration)}</span>
      </button>
      ${t.can_delete?l`
            <button
              class="icon"
              title="Delete"
              aria-label="Delete"
              @click=${()=>e.onDelete(t.id)}
            >
              ✕
            </button>
          `:d}
    </div>
  `}function Ve(t,e=t.now??new Date){let i=()=>t.onDialogOpenChange?.(!1);return l`
    <dialog class="history-dialog" @close=${i} @cancel=${i}>
      <div class="dialog-head">
        <span>Recent messages</span>
        <button class="icon" title="Close" aria-label="Close" @click=${i}>✕</button>
      </div>
      <div class="dialog-list">
        ${t.messages.length===0?l`<div class="empty">Nothing recorded yet</div>`:t.messages.map(r=>Yt(r,t,e))}
      </div>
    </dialog>
  `}function Gt(t){let e=t.now??new Date,i=t.messages.length===0,r=t.messages.slice(0,Kt);return l`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <button
          class="history-all"
          data-disabled="${i}"
          ?disabled=${i}
          @click=${()=>t.onDialogOpenChange?.(!0)}
        >
          ${i?"Show all":`Show all \xB7 ${t.messages.length}`}
        </button>
      </div>
      <div class="history-slots">
        ${Array.from({length:Kt},(s,o)=>l`
            <div class="history-slot">
              ${r[o]?Yt(r[o],t,e):o===0&&i?l`<div class="empty">Nothing recorded yet</div>`:d}
            </div>
          `)}
      </div>
      ${t.dialogOpen?Ve(t,e):d}
    </div>
  `}var Xt=2;function Jt(t,e){if(e.length===0)return"No speakers selected";let i=e.map(o=>t.find(n=>n.entityId===o)?.name??o),r=i.slice(0,Xt).join(", "),s=i.length-Xt;return s>0?`${r} +${s}`:r}function Qt(t,e){let i=t.selected.includes(e.entityId);return l`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${i}
      data-on=${i}
      @click=${()=>t.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?d:l`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${i?"\u2713":""}</span>
    </button>
  `}function Bi(t,e){let i=t.selected.includes(e.entityId);return l`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${i}
      data-on=${i}
      @click=${()=>t.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function Zt(t){let e=l`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${t.selected.length} of ${t.players.length}</span>
    </div>
  `;return t.players.length===0?t.style==="dropdown"?l`<div class="pill-wrap">
          <button class="pill" disabled>
            <span class="pill-icon">${je}</span>
            <span class="pill-text">No speakers found</span>
          </button>
        </div>`:l`${e}<div class="empty">No speakers found</div>`:t.style==="chips"?l`
      ${e}
      <div class="chips">${t.players.map(i=>Bi(t,i))}</div>
    `:t.style==="dropdown"?l`
      <div class="pill-wrap">
        <button
          class="pill"
          aria-expanded=${t.open}
          aria-haspopup="true"
          title=${Jt(t.players,t.selected)}
          @click=${()=>t.onOpenChange(!t.open)}
        >
          <span class="pill-icon">${je}</span>
          <span class="pill-text">${Jt(t.players,t.selected)}</span>
          <span class="pill-chevron">${Vt}</span>
        </button>
        ${t.open?l`
              <!-- Absolutely positioned: an inline panel would push
                   everything below it down the card. -->
              <div class="pill-panel">
                ${e}
                ${t.players.map(i=>Qt(t,i))}
              </div>
            `:d}
      </div>
    `:l`
    ${e}
    <div class="target-rows">${t.players.map(i=>Qt(t,i))}</div>
  `}function Hi(t){let i=t.currentTarget.getBoundingClientRect();return i.width===0?0:Math.min(1,Math.max(0,(t.clientX-i.left)/i.width))}function ei(t){let e=r=>t.progress!==void 0&&r/t.bars.length<t.progress,i=r=>{t.seekable&&t.onSeek(Hi(r))};return l`
    <div
      class="wave ${t.seekable?"seekable":""} ${t.className??""}"
      @pointerdown=${r=>{t.seekable&&(r.currentTarget.setPointerCapture(r.pointerId),i(r))}}
      @pointermove=${r=>{t.seekable&&r.buttons>0&&i(r)}}
      @pointerup=${r=>{t.seekable&&r.currentTarget.releasePointerCapture(r.pointerId)}}
      @pointercancel=${r=>{t.seekable&&r.currentTarget.releasePointerCapture(r.pointerId)}}
    >
      ${t.bars.map((r,s)=>l`
          <div
            class="bar ${e(s)?"played":t.recording?"live":""}"
            style="height:${Math.max(2,Math.round(r*100))}%;--i:${s}"
          ></div>
        `)}
    </div>
  `}function We(t){return l`
    <div class="volume-row">
      <button
        class="volume-toggle"
        role="checkbox"
        aria-checked=${t.enabled}
        data-on=${t.enabled}
        @click=${()=>t.onToggle()}
      >
        Set volume
      </button>
      ${t.enabled?l`
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.01"
              .value=${String(t.value)}
              aria-label="Broadcast volume"
              @input=${e=>t.onChange(Number(e.target.value))}
            />
            <span class="volume-value">${Math.round(t.value*100)}%</span>
          `:d}
    </div>
  `}function ti(t){return l`
    <div class="popover-wrap">
      <button
        class="icon"
        data-active=${t.enabled}
        aria-expanded=${t.open}
        title="Broadcast volume"
        aria-label="Broadcast volume"
        @click=${()=>t.onOpenChange(!t.open)}
      >
        ${ke}
      </button>
      ${t.open?l`<div class="popover">${We(t)}</div>`:d}
    </div>
  `}var qi=4e3,ji=10,Vi=.25,m=class extends y{constructor(){super(...arguments);this.config={type:""};this.selected=[];this.history=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.historyOpen=!1;this.volumeOpen=!1;this.menuOpen=!1;this.volumeOverride=!1;this.volume=1;this.rec=new z(this,{recordMode:()=>this.recordMode,maxDuration:()=>this.resolved.maxDuration,noiseSuppression:()=>this.resolved.noiseSuppression,onStart:()=>this.setStatus(void 0),onError:(i,r)=>this.fail(i,r),onTake:i=>{this.setClip(Ot(i.blob,i.duration,i.peaks))}})}setConfig(i){this.config=i,this.selected=[...Ue(i).selected]}get resolved(){return Ue(this.config)}getCardSize(){let i=this.resolved;if(i.layout==="compact")return 2;let r=5;return r+=i.speakerPicker==="list"?4:i.speakerPicker==="chips"?1:0,i.recentMessages==="list"&&(r+=3),r}getGridOptions(){return{columns:12,min_columns:6}}static getConfigForm(){return At}static getStubConfig(i){return{type:"custom:hass-broadcast-card",layout:"full",speaker_picker:"dropdown",recent_messages:"button",volume_control:!0,speakers:Y(i),selected:[],record_mode:"push_to_talk",max_duration:60,mode:"plain"}}connectedCallback(){super.connectedCallback(),this.rec.supported||(this.status={kind:"error",text:he,sticky:!0}),this.refreshHistory()}updated(){let i=this.renderRoot?.querySelector?.("dialog");i&&!i.open&&i.showModal?.()}disconnectedCallback(){super.disconnectedCallback(),this.stopPlayback(),this.clearStatusTimer(),ye(this.clip),this.clip=void 0,this.historyOpen=!1,this.menuOpen=!1,this.volumeOpen=!1}async refreshHistory(){if(!(!this.hass||this.resolved.recentMessages==="off"))try{this.history=await ft(this.hass)}catch{this.history=[]}}get players(){return bt(Y(this.hass),this.resolved.speakers)}get targets(){return xt(this.selected,this.resolved.speakers)}get recordMode(){return this.resolved.recordMode}clearStatusTimer(){this.statusTimer!==void 0&&(window.clearTimeout(this.statusTimer),this.statusTimer=void 0)}setStatus(i){this.clearStatusTimer(),this.status=i,i&&!i.sticky&&(this.statusTimer=window.setTimeout(()=>{this.statusTimer=void 0,this.status===i&&(this.status=void 0)},qi))}fail(i,r=!1){this.setStatus({kind:"error",text:i,sticky:r})}setClip(i){this.stopPlayback(),this.clip&&this.clip!==i&&ye(this.clip),this.clip=i}clearClip(){this.stopPlayback(),ye(this.clip),this.clip=void 0}seek(i){if(!this.clip)return;this.position=i*this.clip.duration;let r=this.ensureAudio();r&&r.src===this.clip.url&&(r.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let i=this.ensureAudio();if(!(!i||!this.clip)){if(this.playing){i.pause(),this.playing=!1;return}i.src!==this.clip.url&&(i.src=this.clip.url,i.currentTime=this.position),i.play().then(()=>{this.playing=!0},r=>{this.fail(`Could not play that here: ${r?.message??r}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}toggleTarget(i){this.selected=this.selected.includes(i)?this.selected.filter(r=>r!==i):[...this.selected,i]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.rec.phase==="idle"}async broadcast(){if(this.rec.phase!=="idle")return;let i=this.clip;if(!i){this.fail("Record a message or pick one from below first.");return}let r=this.targets;if(r.length===0){this.fail("Pick at least one speaker first.");return}this.rec.setSending(!0),this.setStatus(void 0);try{let s=await be({hass:this.hass,clip:i,targets:r,mode:this.resolved.mode,volume:this.volumeOverride?this.volume:void 0,onStored:o=>{this.clip===i&&(this.clip={...i,source:{kind:"stored",id:o}})}});this.rec.setSending(!1),this.setStatus(xe(this.hass,s)),await this.refreshHistory()}catch(s){if(this.rec.setSending(!1),s?.code==="not_found"&&I(i)!==void 0){this.clip===i&&this.clearClip(),this.fail("That recording was deleted."),await this.refreshHistory();return}this.fail(`Could not send: ${s?.message??s}`)}}async loadMessage(i){this.loadingId=i.id,this.historyOpen=!1,this.setStatus(void 0);try{this.setClip(await Dt(this.hass,i))}catch(r){this.fail(r?.message??String(r))}finally{this.loadingId=void 0}}async deleteRecording(i){try{let r=await gt(this.hass,i);this.clip&&I(this.clip)===i&&this.clearClip(),r&&await this.refreshHistory()}catch(r){r?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${r?.message??r}`)}}get hint(){return this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}get recordLabel(){return this.rec.phase==="sending"?"Broadcasting":this.rec.phase==="recording"?this.recordMode==="push_to_talk"?"Recording \u2014 release to stop":"Recording \u2014 tap to stop":this.hint}get view(){return this.rec.phase==="recording"||this.rec.phase==="finishing"?"recording":this.status?"status":this.clip?"review":"idle"}get timerWarning(){let i=this.resolved.maxDuration,r=Math.min(ji,i*Vi);return this.view==="recording"&&i-this.rec.elapsed<=r}historyProps(){return{messages:this.history,loadedId:this.clip?I(this.clip):void 0,loadingId:this.loadingId,onLoad:i=>{this.loadMessage(i)},onDelete:i=>{this.deleteRecording(i)},onDialogOpenChange:i=>{this.historyOpen=i}}}get parts(){let i=this.rec.phase==="recording",r=this.rec.phase==="sending",s=this.clip!==void 0&&this.view!=="recording",o={enabled:this.volumeOverride,value:this.volume,onToggle:()=>{this.volumeOverride=!this.volumeOverride},onChange:a=>{this.volume=a}},n=this.resolved;return{title:n.title,view:this.view,speakerPicker:n.speakerPicker,recentMessages:n.recentMessages,volumeControl:n.volumeControl,hint:this.hint,timer:O(this.rec.elapsed),timerWarning:this.timerWarning,status:this.status,reviewing:s,mic:a=>_e({size:a,recording:i,disabled:!this.rec.supported||r,recordMode:this.recordMode,level:this.rec.level,maxDuration:this.resolved.maxDuration,label:this.recordLabel,onPressStart:c=>{this.rec.onPressStart(c)},onPressEnd:()=>{this.rec.onPressEnd()}}),play:()=>l`
        <button
          class="icon play"
          ?disabled=${!s||r}
          title=${this.playing?"Pause":"Play"}
          aria-label=${this.playing?"Pause":"Play"}
          @click=${()=>this.togglePlay()}
        >
          ${this.playing?Bt:Nt}
        </button>
      `,waveform:a=>l`${ut(this.clip?.url??"none",ei({bars:this.clip?.peaks.length?this.clip.peaks:fe(48),progress:this.clip?this.position/(this.clip.duration||1):void 0,seekable:s&&!r,recording:!1,onSeek:c=>this.seek(c),className:`${a} reveal`}))}`,clipLength:O(this.clip?.duration??0),discard:()=>l`
        <button
          class="icon discard"
          ?disabled=${!s||r}
          title="Discard"
          aria-label="Discard"
          @click=${()=>this.clearClip()}
        >
          ${we}
        </button>
      `,send:a=>{let c=this.targets.length,p=c>1?`Send to ${c}`:"Send";return l`
          <div class="send-wrap send-wrap-${a}">
            <button
              class="send send-${a}"
              ?disabled=${!this.canBroadcast}
              data-sending=${r}
              title=${p}
              aria-label=${r?"Broadcasting":p}
              @click=${()=>{this.broadcast()}}
            >
              ${r?l`<span class="spinner" aria-hidden="true"></span>`:It}
              ${a==="pill"?l`<span>Send</span>`:d}
            </button>
            ${a==="round"?l`<span class="caption">${p}</span>`:d}
          </div>
        `},speakers:()=>Zt({players:this.players.map(a=>({entityId:a,name:this.hass?.states?.[a]?.attributes?.friendly_name??a,available:this.hass?.states?.[a]?.state!=="unavailable"})),selected:this.selected,style:n.speakerPicker,open:this.pickerOpen,onToggle:a=>this.toggleTarget(a),onOpenChange:a=>{this.pickerOpen=a}}),historyList:()=>Gt({...this.historyProps(),dialogOpen:!1}),historyButton:()=>l`
        <button
          class="icon"
          title="Recent messages"
          aria-label="Recent messages"
          @click=${()=>{this.historyOpen=!0}}
        >
          ${$e}
        </button>
      `,volumeButton:()=>ti({...o,open:this.volumeOpen,onOpenChange:a=>{this.volumeOpen=a}}),volumePanel:()=>We(o),historyDialog:()=>this.historyOpen?Ve(this.historyProps()):d,menuOpen:this.menuOpen,onMenuOpenChange:a=>{this.menuOpen=a},onOpenHistory:()=>{this.historyOpen=!0}}}render(){let i=this.parts;return l`
      <ha-card>
        ${this.resolved.layout==="compact"?Wt(i):Ft(i)}
        <div class="sr-only" aria-live="polite">${this.status?.text??""}</div>
      </ha-card>
    `}};m.styles=Lt,u([L({attribute:!1})],m.prototype,"hass",2),u([f()],m.prototype,"config",2),u([f()],m.prototype,"status",2),u([f()],m.prototype,"selected",2),u([f()],m.prototype,"history",2),u([f()],m.prototype,"clip",2),u([f()],m.prototype,"loadingId",2),u([f()],m.prototype,"position",2),u([f()],m.prototype,"playing",2),u([f()],m.prototype,"pickerOpen",2),u([f()],m.prototype,"historyOpen",2),u([f()],m.prototype,"volumeOpen",2),u([f()],m.prototype,"menuOpen",2),u([f()],m.prototype,"volumeOverride",2),u([f()],m.prototype,"volume",2),m=u([ce("hass-broadcast-card")],m);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!0});export{m as HassBroadcastCard,qi as STATUS_MS};
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
