var er=Object.defineProperty;var tr=Object.getOwnPropertyDescriptor;var u=(t,e,r,i)=>{for(var s=i>1?void 0:i?tr(e,r):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(i?n(e,r,s):n(s))||s);return i&&s&&er(e,r,s),s};var J=globalThis,Q=J.ShadowRoot&&(J.ShadyCSS===void 0||J.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Se=Symbol(),Ve=new WeakMap,N=class{constructor(e,r,i){if(this._$cssResult$=!0,i!==Se)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=r}get styleSheet(){let e=this.o,r=this.t;if(Q&&e===void 0){let i=r!==void 0&&r.length===1;i&&(e=Ve.get(r)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Ve.set(r,e))}return e}toString(){return this.cssText}},We=t=>new N(typeof t=="string"?t:t+"",void 0,Se),_=(t,...e)=>{let r=t.length===1?t[0]:e.reduce((i,s,o)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new N(r,t,Se)},Fe=(t,e)=>{if(Q)t.adoptedStyleSheets=e.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of e){let i=document.createElement("style"),s=J.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=r.cssText,t.appendChild(i)}},Ae=Q?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let r="";for(let i of e.cssRules)r+=i.cssText;return We(r)})(t):t;var{is:rr,defineProperty:ir,getOwnPropertyDescriptor:sr,getOwnPropertyNames:or,getOwnPropertySymbols:nr,getPrototypeOf:ar}=Object,Z=globalThis,Ke=Z.trustedTypes,lr=Ke?Ke.emptyScript:"",cr=Z.reactiveElementPolyfillSupport,B=(t,e)=>t,H={toAttribute(t,e){switch(e){case Boolean:t=t?lr:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=t!==null;break;case Number:r=t===null?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch{r=null}}return r}},ee=(t,e)=>!rr(t,e),Ye={attribute:!0,type:String,converter:H,reflect:!1,useDefault:!1,hasChanged:ee};Symbol.metadata??=Symbol("metadata"),Z.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,r=Ye){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(e,r),!r.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(e,i,r);s!==void 0&&ir(this.prototype,e,s)}}static getPropertyDescriptor(e,r,i){let{get:s,set:o}=sr(this.prototype,e)??{get(){return this[r]},set(n){this[r]=n}};return{get:s,set(n){let a=s?.call(this);o?.call(this,n),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ye}static _$Ei(){if(this.hasOwnProperty(B("elementProperties")))return;let e=ar(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(B("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(B("properties"))){let r=this.properties,i=[...or(r),...nr(r)];for(let s of i)this.createProperty(s,r[s])}let e=this[Symbol.metadata];if(e!==null){let r=litPropertyMetadata.get(e);if(r!==void 0)for(let[i,s]of r)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[r,i]of this.elementProperties){let s=this._$Eu(r,i);s!==void 0&&this._$Eh.set(s,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let r=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)r.unshift(Ae(s))}else e!==void 0&&r.push(Ae(e));return r}static _$Eu(e,r){let i=r.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,r=this.constructor.elementProperties;for(let i of r.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Fe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,r,i){this._$AK(e,i)}_$ET(e,r){let i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){let o=(i.converter?.toAttribute!==void 0?i.converter:H).toAttribute(r,i.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,r){let i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=i.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:H;this._$Em=s;let a=n.fromAttribute(r,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,r,i,s=!1,o){if(e!==void 0){let n=this.constructor;if(s===!1&&(o=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??ee)(o,r)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,r,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,r,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??r??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(r=void 0),this._$AL.set(e,r)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,o]of i){let{wrapped:n}=o,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1,r=this._$AL;try{e=this.shouldUpdate(r),e?(this.willUpdate(r),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(r)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(r)}willUpdate(e){}_$AE(e){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[B("elementProperties")]=new Map,x[B("finalized")]=new Map,cr?.({ReactiveElement:x}),(Z.reactiveElementVersions??=[]).push("2.1.2");var Te=globalThis,Ge=t=>t,te=Te.trustedTypes,Xe=te?te.createPolicy("lit-html",{createHTML:t=>t}):void 0,Me="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Pe="?"+w,dr=`<${Pe}>`,C=document,q=()=>C.createComment(""),V=t=>t===null||typeof t!="object"&&typeof t!="function",Ee=Array.isArray,rt=t=>Ee(t)||typeof t?.[Symbol.iterator]=="function",Ce=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Je=/-->/g,Qe=/>/g,S=RegExp(`>|${Ce}(?:([^\\s"'>=/]+)(${Ce}*=${Ce}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ze=/'/g,et=/"/g,it=/^(?:script|style|textarea|title)$/i,Re=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),l=Re(1),st=Re(2),Fr=Re(3),T=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),tt=new WeakMap,A=C.createTreeWalker(C,129);function ot(t,e){if(!Ee(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Xe!==void 0?Xe.createHTML(e):e}var nt=(t,e)=>{let r=t.length-1,i=[],s,o=e===2?"<svg>":e===3?"<math>":"",n=j;for(let a=0;a<r;a++){let c=t[a],p,m,h=-1,b=0;for(;b<c.length&&(n.lastIndex=b,m=n.exec(c),m!==null);)b=n.lastIndex,n===j?m[1]==="!--"?n=Je:m[1]!==void 0?n=Qe:m[2]!==void 0?(it.test(m[2])&&(s=RegExp("</"+m[2],"g")),n=S):m[3]!==void 0&&(n=S):n===S?m[0]===">"?(n=s??j,h=-1):m[1]===void 0?h=-2:(h=n.lastIndex-m[2].length,p=m[1],n=m[3]===void 0?S:m[3]==='"'?et:Ze):n===et||n===Ze?n=S:n===Je||n===Qe?n=j:(n=S,s=void 0);let $=n===S&&t[a+1].startsWith("/>")?" ":"";o+=n===j?c+dr:h>=0?(i.push(p),c.slice(0,h)+Me+c.slice(h)+w+$):c+w+(h===-2?a:$)}return[ot(t,o+(t[r]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},W=class t{constructor({strings:e,_$litType$:r},i){let s;this.parts=[];let o=0,n=0,a=e.length-1,c=this.parts,[p,m]=nt(e,r);if(this.el=t.createElement(p,i),A.currentNode=this.el.content,r===2||r===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=A.nextNode())!==null&&c.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(Me)){let b=m[n++],$=s.getAttribute(h).split(w),X=/([.?@])?(.*)/.exec(b);c.push({type:1,index:o,name:X[2],strings:$,ctor:X[1]==="."?ie:X[1]==="?"?se:X[1]==="@"?oe:P}),s.removeAttribute(h)}else h.startsWith(w)&&(c.push({type:6,index:o}),s.removeAttribute(h));if(it.test(s.tagName)){let h=s.textContent.split(w),b=h.length-1;if(b>0){s.textContent=te?te.emptyScript:"";for(let $=0;$<b;$++)s.append(h[$],q()),A.nextNode(),c.push({type:2,index:++o});s.append(h[b],q())}}}else if(s.nodeType===8)if(s.data===Pe)c.push({type:2,index:o});else{let h=-1;for(;(h=s.data.indexOf(w,h+1))!==-1;)c.push({type:7,index:o}),h+=w.length-1}o++}}static createElement(e,r){let i=C.createElement("template");return i.innerHTML=e,i}};function M(t,e,r=t,i){if(e===T)return e;let s=i!==void 0?r._$Co?.[i]:r._$Cl,o=V(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(t),s._$AT(t,r,i)),i!==void 0?(r._$Co??=[])[i]=s:r._$Cl=s),s!==void 0&&(e=M(t,s._$AS(t,e.values),s,i)),e}var re=class{constructor(e,r){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:r},parts:i}=this._$AD,s=(e?.creationScope??C).importNode(r,!0);A.currentNode=s;let o=A.nextNode(),n=0,a=0,c=i[0];for(;c!==void 0;){if(n===c.index){let p;c.type===2?p=new D(o,o.nextSibling,this,e):c.type===1?p=new c.ctor(o,c.name,c.strings,this,e):c.type===6&&(p=new ne(o,this,e)),this._$AV.push(p),c=i[++a]}n!==c?.index&&(o=A.nextNode(),n++)}return A.currentNode=C,s}p(e){let r=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,r),r+=i.strings.length-2):i._$AI(e[r])),r++}},D=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,r,i,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=r,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,r=this._$AM;return r!==void 0&&e?.nodeType===11&&(e=r.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,r=this){e=M(this,e,r),V(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):rt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&V(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){let{values:r,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=W.createElement(ot(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(r);else{let o=new re(s,this),n=o.u(this.options);o.p(r),this.T(n),this._$AH=o}}_$AC(e){let r=tt.get(e.strings);return r===void 0&&tt.set(e.strings,r=new W(e)),r}k(e){Ee(this._$AH)||(this._$AH=[],this._$AR());let r=this._$AH,i,s=0;for(let o of e)s===r.length?r.push(i=new t(this.O(q()),this.O(q()),this,this.options)):i=r[s],i._$AI(o),s++;s<r.length&&(this._$AR(i&&i._$AB.nextSibling,s),r.length=s)}_$AR(e=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);e!==this._$AB;){let i=Ge(e).nextSibling;Ge(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,r,i,s,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=r,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,r=this,i,s){let o=this.strings,n=!1;if(o===void 0)e=M(this,e,r,0),n=!V(e)||e!==this._$AH&&e!==T,n&&(this._$AH=e);else{let a=e,c,p;for(e=o[0],c=0;c<o.length-1;c++)p=M(this,a[i+c],r,c),p===T&&(p=this._$AH[c]),n||=!V(p)||p!==this._$AH[c],p===d?e=d:e!==d&&(e+=(p??"")+o[c+1]),this._$AH[c]=p}n&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ie=class extends P{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},se=class extends P{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}},oe=class extends P{constructor(e,r,i,s,o){super(e,r,i,s,o),this.type=5}_$AI(e,r=this){if((e=M(this,e,r,0)??d)===T)return;let i=this._$AH,s=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==d&&(i===d||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ne=class{constructor(e,r,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=r,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}},at={M:Me,P:w,A:Pe,C:1,L:nt,R:re,D:rt,V:M,I:D,H:P,N:se,U:oe,B:ie,F:ne},pr=Te.litHtmlPolyfillSupport;pr?.(W,D),(Te.litHtmlVersions??=[]).push("3.3.3");var lt=(t,e,r)=>{let i=r?.renderBefore??e,s=i._$litPart$;if(s===void 0){let o=r?.renderBefore??null;i._$litPart$=s=new D(e.insertBefore(q(),o),o,void 0,r??{})}return s._$AI(t),s};var Oe=globalThis,y=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=lt(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};y._$litElement$=!0,y.finalized=!0,Oe.litElementHydrateSupport?.({LitElement:y});var hr=Oe.litElementPolyfillSupport;hr?.({LitElement:y});(Oe.litElementVersions??=[]).push("4.2.2");var ae=t=>(e,r)=>{r!==void 0?r.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};var ur={attribute:!0,type:String,converter:H,reflect:!1,hasChanged:ee},mr=(t=ur,e,r)=>{let{kind:i,metadata:s}=r,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),i==="setter"&&((t=Object.create(t)).wrapped=!0),o.set(r.name,t),i==="accessor"){let{name:n}=r;return{set(a){let c=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,c,t,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,t,a),a}}}if(i==="setter"){let{name:n}=r;return function(a){let c=this[n];e.call(this,a),this.requestUpdate(n,c,t,!0,a)}}throw Error("Unsupported decorator location: "+i)};function L(t){return(e,r)=>typeof r=="object"?mr(t,e,r):((i,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,i),n?Object.getOwnPropertyDescriptor(s,o):void 0})(t,e,r)}function f(t){return L({...t,state:!0,attribute:!1})}var ct=t=>(...e)=>({_$litDirective$:t,values:e}),ce=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,r,i){this._$Ct=e,this._$AM=r,this._$Ci=i}_$AS(e,r){return this.update(e,r)}update(e,r){return this.render(...r)}};var{I:Di}=at;var gr={},dt=(t,e=gr)=>t._$AH=e;var pt=ct(class extends ce{constructor(){super(...arguments),this.key=d}render(t,e){return this.key=t,e}update(t,[e,r]){return e!==this.key&&(dt(t),this.key=e),r}});async function ht(t,e,r){let i=new FormData;i.append("file",e,"recording.wav"),i.append("duration",String(r));let s=await fetch("/api/hass_broadcast/upload",{method:"POST",body:i,headers:{Authorization:`Bearer ${t.auth.data.access_token}`}});if(!s.ok)throw new Error(`Upload failed (${s.status})`);return(await s.json()).message_id}async function ut(t){return(await t.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function mt(t,e){return(await t.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function gt(t,e,r,i,s){return{failed:(await t.connection.sendMessagePromise({type:"hass_broadcast/send",message_id:e,targets:r,mode:i,...s!==void 0?{volume:s}:{}})).failed}}var de="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function ft(t){return t?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${t?.message??t?.name??"unknown error"}`}function F(t){return t?.states?Object.keys(t.states).filter(e=>e.startsWith("media_player.")).filter(e=>(t.states[e].attributes.supported_features&512)!==0).sort():[]}function vt(t,e){return e?[...new Set(e)]:t}function yt(t,e){if(!e)return t;let r=new Set(e);return t.filter(i=>r.has(i))}var fr="Voice Broadcast";function K(t,e){return e.includes(t)?t:e[0]}function pe(t){if(t===""||t===null||t===void 0)return 60;let e=Number(t);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var vr=["plain","chime","restore"];function De(t){return K(t,vr)}function Le(t){let e=K(t.layout,["full","compact"]),r=Array.isArray(t.speakers)?[...new Set(t.speakers)]:void 0,i=r?new Set(r):void 0,s=(Array.isArray(t.selected)?t.selected:[]).filter(o=>!i||i.has(o));return{title:t.title?.trim()||fr,layout:e,speakerPicker:e==="compact"?"dropdown":K(t.speaker_picker,["dropdown","chips","list"]),recentMessages:K(t.recent_messages,["button","off","list"]),volumeControl:t.volume_control!==!1,speakers:r,selected:s,recordMode:K(t.record_mode,["push_to_talk","start_stop"]),maxDuration:pe(t.max_duration),noiseSuppression:t.noise_suppression===!0,mode:De(t.mode)}}function E(t){let e=r=>{let i=r?{bg:"#2b2b2b",g:"#5f6368",r:"#e2574c",b:"#4fa3e0"}:{bg:"#eef0f3",g:"#c4cbd4",r:"#db4437",b:"#039be5"},s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64" width="120" height="64"><rect width="120" height="64" rx="6" fill="${i.bg}"/>`+t.replace(/\$g/g,i.g).replace(/\$r/g,i.r).replace(/\$b/g,i.b)+"</svg>";return`data:image/svg+xml,${encodeURIComponent(s)}`};return{src:e(!1),src_dark:e(!0)}}var R={full:E('<rect x="14" y="9" width="40" height="5" rx="2.5" fill="$g"/><circle cx="96" cy="11.5" r="3" fill="$g"/><circle cx="105" cy="11.5" r="3" fill="$g"/><circle cx="60" cy="32" r="11" fill="$r"/><circle cx="84" cy="32" r="5" fill="$g"/><rect x="42" y="50" width="36" height="7" rx="3.5" fill="$g"/>'),compact:E('<circle cx="26" cy="32" r="12" fill="$r"/><rect x="46" y="20" width="40" height="5" rx="2.5" fill="$g"/><rect x="104" y="18" width="3" height="9" rx="1.5" fill="$g"/><rect x="46" y="36" width="42" height="9" rx="4.5" fill="$g"/><rect x="92" y="36" width="18" height="9" rx="4.5" fill="$b"/>'),dropdown:E('<rect x="28" y="24" width="64" height="16" rx="8" fill="none" stroke="$g" stroke-width="2"/><rect x="36" y="30" width="34" height="4" rx="2" fill="$g"/><path d="M78 30l4 4 4-4" stroke="$g" stroke-width="2" fill="none"/>'),chips:E('<rect x="14" y="25" width="30" height="14" rx="7" fill="$b"/><rect x="48" y="25" width="26" height="14" rx="7" fill="$g"/><rect x="78" y="25" width="28" height="14" rx="7" fill="$b"/>'),list:E('<rect x="22" y="14" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="13" width="7" height="7" rx="1.5" fill="$b"/><rect x="22" y="29" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="28" width="7" height="7" rx="1.5" fill="$g"/><rect x="22" y="44" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="43" width="7" height="7" rx="1.5" fill="$b"/>'),square:E('<rect x="38" y="6" width="44" height="52" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="60" cy="26" r="10" fill="$r"/><rect x="47" y="43" width="26" height="5" rx="2.5" fill="$g"/>'),horizontal:E('<rect x="12" y="18" width="96" height="28" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="30" cy="32" r="9" fill="$r"/><rect x="46" y="26" width="36" height="5" rx="2.5" fill="$g"/><rect x="46" y="35" width="24" height="4" rx="2" fill="$g"/>')},Ue=t=>({name:t,selector:{entity:{multiple:!0,filter:{domain:"media_player"}}}}),bt={name:"max_duration",selector:{number:{min:5,max:300,step:5,mode:"slider",unit_of_measurement:"s"}}},xt={name:"noise_suppression",selector:{boolean:{}}},yr={title:"Leave empty for \u201CVoice Broadcast\u201D",name:"Leave empty for \u201CIntercom\u201D",noise_suppression:"Filters out background noise such as a TV or fan. Leave it off in a quiet room: it can make a voice sound slightly processed."},wt=t=>yr[t.name],$t={type:"expandable",name:"",flatten:!0,title:"Playback",icon:"mdi:volume-high",schema:[{name:"mode",selector:{select:{mode:"box",box_max_columns:1,options:[{value:"plain",label:"Just play it",description:"Interrupts whatever is playing"},{value:"chime",label:"Chime first",description:"A short tone, then the message"},{value:"restore",label:"Pause, then resume",description:"Puts back what was playing and its volume"}]}}}]},br={title:"Name",name:"Name",layout:"Layout",speaker_picker:"Speaker picker",recent_messages:"Recent messages",volume_control:"Volume control",speakers:"Speakers on the card",selected:"Selected when the card opens",record_mode:"Recording",max_duration:"Time limit",noise_suppression:"Noise suppression",mode:"When it plays",shape:"Shape"},kt=t=>br[t.name],_t={schema:[{name:"title",selector:{text:{}}},{type:"expandable",name:"",flatten:!0,title:"Appearance",icon:"mdi:palette-outline",expanded:!0,schema:[{name:"layout",selector:{select:{mode:"box",options:[{value:"full",label:"Full",image:R.full},{value:"compact",label:"Compact",image:R.compact}]}}},{name:"speaker_picker",visible:{field:"layout",value:"full"},selector:{select:{mode:"box",options:[{value:"dropdown",label:"Dropdown",image:R.dropdown},{value:"chips",label:"Chips",image:R.chips},{value:"list",label:"List",image:R.list}]}}},{name:"recent_messages",selector:{select:{mode:"dropdown",options:[{value:"off",label:"Off"},{value:"button",label:"Button in the header"},{value:"list",label:"List below the card"}]}}},{name:"volume_control",selector:{boolean:{}}}]},{type:"expandable",name:"",flatten:!0,title:"Speakers",icon:"mdi:speaker",expanded:!0,schema:[Ue("speakers"),Ue("selected")]},{type:"expandable",name:"",flatten:!0,title:"Recording",icon:"mdi:microphone",schema:[{name:"record_mode",selector:{select:{mode:"box",options:[{value:"push_to_talk",label:"Hold to talk",description:"Records while the button is held"},{value:"start_stop",label:"Tap to start and stop",description:"Tap once to start, again to stop"}]}}},bt,xt]},$t],computeLabel:kt,computeHelper:wt},St={schema:[{name:"name",selector:{text:{}}},{type:"expandable",name:"",flatten:!0,title:"Speakers",icon:"mdi:speaker",expanded:!0,schema:[Ue("speakers")]},{type:"expandable",name:"",flatten:!0,title:"Appearance",icon:"mdi:palette-outline",expanded:!0,schema:[{name:"shape",selector:{select:{mode:"box",options:[{value:"square",label:"Square",image:R.square},{value:"horizontal",label:"Horizontal",image:R.horizontal}]}}}]},{type:"expandable",name:"",flatten:!0,title:"Recording",icon:"mdi:microphone",schema:[bt,xt]},$t],computeLabel:t=>t.name==="speakers"?"Sends to":kt(t),computeHelper:wt};function O(t){let e=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function At(t,e){return t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}function ze(t){return t.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}function Ct(t,e=new Date){let r=new Date(t);if(Number.isNaN(r.getTime()))return"Unknown time";let i=(e.getTime()-r.getTime())/1e3;if(i<60)return"Just now";if(i<3600){let n=Math.round(i/60);return`${n} minute${n===1?"":"s"} ago`}if(At(r,e))return`Today ${ze(r)}`;let s=new Date(e);return s.setDate(e.getDate()-1),At(r,s)?`Yesterday ${ze(r)}`:`${r.toLocaleDateString(void 0,{month:"short",day:"numeric"})} ${ze(r)}`}function Tt(t){return Number.isFinite(t)?Math.min(1,Math.max(0,t)):0}function ue(t){return new Array(Math.max(0,t)).fill(0)}function Mt(t,e){if(e<=0)return[];if(t.length===0)return ue(e);let r=[];for(let i=0;i<e;i++){let s=Math.floor(i*t.length/e),o=Math.max(s+1,Math.floor((i+1)*t.length/e)),n=0;for(let a=s;a<o&&a<t.length;a++)n=Math.max(n,t[a]);r.push(n)}return r}function Ie(t){let e=t.reduce((r,i)=>Math.max(r,i),0);return e<=0?[...t]:t.map(r=>r/e)}var he=class{constructor(){this.peaks=[];this.pending=0}get length(){return this.peaks.length}push(e,r){if(this.windowStart===void 0)return this.windowStart=r,this.pending=Tt(e),!1;let i=!1;return r-this.windowStart>=50&&(this.peaks.push(this.pending),this.pending=0,this.windowStart=r,i=!0),this.pending=Math.max(this.pending,Tt(e)),i}reset(){this.peaks=[],this.pending=0,this.windowStart=void 0}all(){return[...this.peaks]}tail(e){let r=this.peaks.slice(-e);return[...ue(e-r.length),...r]}};function Pt(t,e){let r=t.length*2,i=new ArrayBuffer(44+r),s=new DataView(i),o=(n,a)=>{for(let c=0;c<a.length;c++)s.setUint8(n+c,a.charCodeAt(c))};return o(0,"RIFF"),s.setUint32(4,36+r,!0),o(8,"WAVE"),o(12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,e,!0),s.setUint32(28,e*2,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),o(36,"data"),s.setUint32(40,r,!0),new Int16Array(i,44).set(t),new Blob([i],{type:"audio/wav"})}var me=[48e3,32e3,24e3,16e3],xr=10*1024*1024,wr=44,$r=1,kr=.89*32767,_r=10,Sr="/api/hass_broadcast/static/recorder-worklet.js",Ar={channelCount:1,echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},Y=class{constructor(){this.chunks=[];this.active=!1;this.options={}}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}get trackSettings(){return this.stream?.getAudioTracks()[0]?.getSettings()}async start(e,r={}){this.chunks=[],this.options=r;try{this.stream=await navigator.mediaDevices.getUserMedia({audio:r.constraints??{...Ar,noiseSuppression:r.noiseSuppression??!1}}),this.context=new AudioContext({sampleRate:r.sampleRate??Cr(e)}),await this.context.audioWorklet.addModule(Sr);let i=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=s=>{this.chunks.push(s.data),this.levelCallback&&this.levelCallback(Mr(s.data))},i.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(i){throw await this.release(),i}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let e=this.context?.sampleRate??me[0],r=this.chunks,i=this.options.normalize??!0;await this.release();let s=r.reduce((a,c)=>a+c.length,0),o=new Int16Array(s),n=0;for(let a of r)o.set(a,n),n+=a.length;return i&&Tr(o),{blob:Pt(o,e),duration:s/e}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function Cr(t){let e=i=>i*2,r=i=>wr+e(i)*(t+$r)<=xr;return me.find(r)??me[me.length-1]}function Tr(t){let e=0;for(let i of t)e=Math.max(e,Math.abs(i));if(e===0)return;let r=Math.min(_r,kr/e);if(!(r<=1))for(let i=0;i<t.length;i++)t[i]=Math.round(t[i]*r)}function Mr(t){let e=0;for(let r of t)e=Math.max(e,Math.abs(r));return e/32768}var Pr=.4,U=class{constructor(e,r){this.host=e;this.options=r;this.phase="idle";this.elapsed=0;this.level=0;this.recorder=new Y;this.envelope=new he;this.busy=!1;this.disconnected=!1;this.stopRequested=!1;e.addController(this)}get supported(){return Y.isSupported()}hostConnected(){this.disconnected=!1}hostDisconnected(){this.disconnected=!0,this.clearTimer(),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.level=0,this.release())}setSending(e){this.phase=e?"sending":"idle",this.host.requestUpdate()}async onPressStart(e){if(!(this.phase==="sending"||!this.supported)){if(this.options.recordMode()==="start_stop"){await(this.phase==="recording"?this.stopRecording():this.startRecording());return}e.preventDefault(),!this.busy&&(this.stopRequested=!1,await this.startRecording(),this.stopRequested&&this.phase==="recording"&&await this.stopRecording())}}async onPressEnd(){if(this.options.recordMode()==="push_to_talk"){if(this.phase!=="recording"){this.stopRequested=!0;return}await this.stopRecording()}}async startRecording(){if(this.busy||this.phase!=="idle")return;this.busy=!0,this.options.onStart?.();try{this.recorder.onLevel(r=>{this.envelope.push(r,Date.now())&&(this.level=this.envelope.tail(1)[0],this.host.requestUpdate())}),this.envelope.reset(),await this.recorder.start(this.options.maxDuration(),{noiseSuppression:this.options.noiseSuppression?.()??!1})}catch(r){this.options.onError(ft(r),r?.name==="NotAllowedError"),this.host.requestUpdate();return}finally{this.busy=!1}if(this.disconnected){this.release();return}this.phase="recording",this.elapsed=0,this.level=0,this.host.requestUpdate();let e=this.options.maxDuration();this.timer=window.setInterval(()=>{this.elapsed+=1,this.host.requestUpdate(),this.elapsed>=e&&this.stopRecording()},1e3)}async stopRecording(){if(this.busy||this.phase!=="recording")return;this.busy=!0,this.clearTimer();let e;try{let{blob:r,duration:i}=await this.recorder.stop();this.phase="idle",this.options.recordMode()==="push_to_talk"&&i<Pr?this.options.onError("Hold the button while you speak.",!1):e={blob:r,duration:i,peaks:this.envelope.all()}}catch(r){this.phase="idle",this.options.onError(`Could not finish recording: ${r?.message??r}`,!1)}finally{this.busy=!1,this.level=0,this.host.requestUpdate()}e&&await this.options.onTake(e)}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}release(){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1})}};function Et(t,e,r){return{source:{kind:"fresh",blob:t},url:URL.createObjectURL(t),duration:e,peaks:Ie(Mt(r,48))}}function fe(t){return t.source.kind==="stored"?t.source.id:void 0}var Er=async(t,e)=>{let r=globalThis.AudioContext??globalThis.webkitAudioContext;if(!r)return[];let i=new r;try{let o=(await i.decodeAudioData(await t.arrayBuffer())).getChannelData(0),n=[];for(let a=0;a<e;a++){let c=Math.floor(a*o.length/e),p=Math.floor((a+1)*o.length/e),m=0;for(let h=c;h<p;h++)m=Math.max(m,Math.abs(o[h]));n.push(m)}return Ie(n)}finally{await i.close?.()}};async function Rt(t,e,r=Er){let i=await fetch(`/api/hass_broadcast/media/${e.id}.${e.extension}`,{headers:{Authorization:`Bearer ${t.auth.data.access_token}`}});if(!i.ok)throw new Error(`Could not load that recording (${i.status})`);let s=await i.blob(),o=[];try{o=await r(s,48)}catch{o=[]}return{source:{kind:"stored",id:e.id},url:URL.createObjectURL(s),duration:e.duration,peaks:o}}function ve(t){t&&URL.revokeObjectURL(t.url)}async function ye(t){let{hass:e,clip:r,targets:i}=t,s=fe(r);if(s===void 0){let n=r.source.blob;s=await ht(e,n,r.duration),t.onStored?.(s)}let{failed:o}=await gt(e,s,i,t.mode,t.volume);return o.length===0?{kind:"sent",targets:i}:o.length>=i.length?{kind:"failed",failed:o}:{kind:"partial",failed:o}}function G(t,e){return e.map(r=>t?.states?.[r]?.attributes?.friendly_name??r).join(", ")}function be(t,e){switch(e.kind){case"sent":return{kind:"info",text:`Sent to ${G(t,e.targets)}`};case"partial":return{kind:"error",text:`Played, but not on ${G(t,e.failed)}.`};case"failed":return{kind:"error",text:`Could not play on any speaker: ${G(t,e.failed)}.`}}}var Ne=_`
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
`,Be=_`
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
`,Ot=[Ne,Be,_`
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
  `];var v=t=>st`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d=${t} /></svg>`,Dt=v("M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z"),Lt=v("M7 7h10v10H7z"),Ut=v("M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"),zt=v("M8 5v14l11-7z"),It=v("M6 5h4v14H6zm8 0h4v14h-4z"),xe=v("M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"),we=v("M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"),$e=v("M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"),Nt=v("M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"),He=v("M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2a2 2 0 0 1 0-4zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"),Bt=v("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"),Ht=v("M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"),jt=v("M7 10l5 5 5-5z");var Rr=.35;function ke(t){let e=Math.min(1,Math.max(0,t.level||0));return l`
    <div
      class="mic-wrap"
      data-recording=${t.recording}
      data-mode=${t.recordMode}
      style="--mic:${t.size}px;--grow:${(1+e*Rr).toFixed(3)};--limit:${t.maxDuration}s"
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
        @contextmenu=${r=>r.preventDefault()}
        @keydown=${r=>{!r.repeat&&(r.key===" "||r.key==="Enter")&&t.onPressStart(r)}}
        @keyup=${r=>{(r.key===" "||r.key==="Enter")&&t.onPressEnd()}}
        title=${t.label}
        aria-label=${t.label}
      >
        <span class="mic-glyph mic-glyph-mic">${Dt}</span>
        <span class="mic-glyph mic-glyph-stop">${Lt}</span>
      </button>
      <svg class="mic-arc" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="mic-arc-track" cx="50" cy="50" r="46" pathLength="100" />
        <circle class="mic-arc-fill" cx="50" cy="50" r="46" pathLength="100" />
      </svg>
    </div>
  `}function _e(t){return t?l`<span class="status ${t.kind}" title=${t.text}>${t.text}</span>`:d}function z(t,e){return l`<span class="timer" data-warning=${e}>${t}</span>`}function I(t,e,r){return l`
    <div class="layers slot ${t}" data-active=${e}>
      ${Object.keys(r).map(i=>l`
          <div
            class="layer layer-${i}"
            data-on=${i===e}
            ?inert=${i!==e}
            aria-hidden=${i!==e}
          >
            ${r[i]}
          </div>
        `)}
    </div>
  `}var Or=2500,k=class extends y{constructor(){super(...arguments);this.config={type:""};this.rec=new U(this,{recordMode:()=>"push_to_talk",maxDuration:()=>pe(this.config.max_duration),noiseSuppression:()=>this.config.noise_suppression===!0,onStart:()=>this.showResult(void 0),onError:r=>this.showResult({kind:"failed",text:Dr(r),detail:r}),onTake:r=>this.send(r)})}setConfig(r){this.config=r}get shape(){return this.config.shape==="horizontal"?"horizontal":"square"}get targets(){return Array.isArray(this.config.speakers)?this.config.speakers:[]}getCardSize(){return this.shape==="square"?3:1}getGridOptions(){return this.shape==="square"?{rows:2,columns:3,min_rows:2,min_columns:3}:{rows:1,columns:6,min_rows:1,max_rows:1,min_columns:4}}static getConfigForm(){return St}static getStubConfig(r){let i=F(r)[0];return{type:"custom:hass-broadcast-tile",name:"Intercom",speakers:i?[i]:[],shape:"square",mode:"plain"}}disconnectedCallback(){super.disconnectedCallback(),this.clearResultTimer(),this.result=void 0}clearResultTimer(){this.resultTimer!==void 0&&(window.clearTimeout(this.resultTimer),this.resultTimer=void 0)}showResult(r){this.clearResultTimer(),this.result=r,r&&(this.resultTimer=window.setTimeout(()=>{this.resultTimer=void 0,this.result=void 0},Or))}async send(r){if(this.targets.length===0){this.showResult({kind:"failed",text:"No speakers set",detail:"Pick speakers in the card editor."});return}this.rec.setSending(!0);try{let i=await ye({hass:this.hass,clip:{source:{kind:"fresh",blob:r.blob},url:"",duration:r.duration,peaks:[]},targets:this.targets,mode:De(this.config.mode)});this.showResult(this.describe(i))}catch(i){let s=`Could not send: ${i?.message??i}`;this.showResult({kind:"failed",text:"Not sent",detail:s})}finally{this.rec.setSending(!1)}}describe(r){let i=be(this.hass,r).text;switch(r.kind){case"sent":return{kind:"sent",text:"Sent",detail:i};case"partial":return{kind:"partial",text:`Not on ${G(this.hass,r.failed)}`,detail:i};case"failed":return{kind:"failed",text:"Not sent",detail:i}}}get name(){return this.config.name?.trim()||"Intercom"}get idleText(){return this.rec.supported?this.targets.length?"Hold to talk":"Pick speakers in the card editor":"Needs HTTPS"}render(){let r=this.rec.phase==="recording",i=this.rec.phase==="sending",s=pe(this.config.max_duration),o=r&&s-this.rec.elapsed<=Math.min(10,s*.25),n=r?"recording":i?"sending":this.result?.kind??"idle",a=p=>l`${p}<span title=${this.result?.detail??""}>${this.result?.text??""}</span>`,c=r?"Recording \u2014 release to send":`Hold to talk to ${this.name}`;return l`
      <ha-card>
        <div class="tile ${this.shape}" title=${this.rec.supported?"":de}>
          <div class="slot">
            ${ke({size:this.shape==="square"?52:40,recording:r,disabled:!this.rec.supported||i||this.targets.length===0,recordMode:"push_to_talk",level:this.rec.level,maxDuration:s,label:c,onPressStart:p=>void this.rec.onPressStart(p),onPressEnd:()=>void this.rec.onPressEnd()})}
          </div>
          <div class="text">
            <span class="name">${this.name}</span>
            ${I("tile-status",n,{idle:l`<span>${this.idleText}</span>`,recording:z(O(this.rec.elapsed),o),sending:l`<span>Sending…</span>`,sent:a(Bt),partial:a(Ht),failed:a(xe)})}
          </div>
        </div>
        <div class="sr-only" aria-live="polite">${this.result?.detail??""}</div>
      </ha-card>
    `}};k.styles=[Ne,Be,_`
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
    `],u([L({attribute:!1})],k.prototype,"hass",2),u([f()],k.prototype,"config",2),u([f()],k.prototype,"result",2),k=u([ae("hass-broadcast-tile")],k);function Dr(t){return t.split(/(?<=\.) /)[0]}window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-tile",name:"Voice Broadcast Tile",description:"Hold to talk, let go to send to the speakers you chose.",preview:!1});function qt(t){let e=t.recentMessages!=="off"||t.volumeControl;return l`
    <div class="card compact">
      <div class="compact-mic slot">${t.mic(72)}</div>
      <div class="compact-body">
        <div class="compact-row">
          ${I("compact-status",t.view,{idle:l`
              <span class="title">${t.title}</span>
              <span class="hint">${t.hint}</span>
            `,recording:z(t.timer,t.timerWarning),review:l`
              ${t.play()} ${t.waveform("wave-mini")} ${t.discard()}
            `,status:_e(t.status)})}
          ${e?l`
                <div class="popover-wrap slot">
                  <button
                    class="icon"
                    title="More"
                    aria-label="More"
                    aria-expanded=${t.menuOpen}
                    @click=${()=>t.onMenuOpenChange(!t.menuOpen)}
                  >
                    ${Nt}
                  </button>
                  ${t.menuOpen?Lr(t):d}
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
  `}function Lr(t){return l`
    <div class="popover menu" role="menu">
      ${t.recentMessages!=="off"?l`
            <button
              class="menu-item"
              role="menuitem"
              @click=${()=>{t.onMenuOpenChange(!1),t.onOpenHistory()}}
            >
              ${we}<span>Recent messages</span>
            </button>
          `:d}
      ${t.volumeControl?l`<div class="menu-item menu-volume">${$e}${t.volumePanel()}</div>`:d}
    </div>
  `}function Vt(t){return l`
    <div class="card full">
      <div class="head slot">
        <span class="title">${t.title}</span>
        <span class="head-actions">
          ${t.recentMessages==="button"?t.historyButton():d}
          ${t.volumeControl?t.volumeButton():d}
        </span>
      </div>

      ${I("strip",t.view,{idle:l`<span class="hint">${t.hint}</span>`,recording:z(t.timer,t.timerWarning),review:l`
          ${t.play()} ${t.waveform("wave-strip")}
          <span class="clip-length">${t.clipLength}</span>
        `,status:_e(t.status)})}

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
  `}var Wt=3;function Ft(t,e,r){return l`
    <div
      class="history-row"
      data-loaded="${e.loadedId===t.id}"
      data-loading="${e.loadingId===t.id}"
    >
      <button class="history-load" @click=${()=>e.onLoad(t)}>
        <span class="history-when">${Ct(t.created,r)}</span>
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
  `}function je(t,e=t.now??new Date){let r=()=>t.onDialogOpenChange?.(!1);return l`
    <dialog class="history-dialog" @close=${r} @cancel=${r}>
      <div class="dialog-head">
        <span>Recent messages</span>
        <button class="icon" title="Close" aria-label="Close" @click=${r}>✕</button>
      </div>
      <div class="dialog-list">
        ${t.messages.length===0?l`<div class="empty">Nothing recorded yet</div>`:t.messages.map(i=>Ft(i,t,e))}
      </div>
    </dialog>
  `}function Kt(t){let e=t.now??new Date,r=t.messages.length===0,i=t.messages.slice(0,Wt);return l`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <button
          class="history-all"
          data-disabled="${r}"
          ?disabled=${r}
          @click=${()=>t.onDialogOpenChange?.(!0)}
        >
          ${r?"Show all":`Show all \xB7 ${t.messages.length}`}
        </button>
      </div>
      <div class="history-slots">
        ${Array.from({length:Wt},(s,o)=>l`
            <div class="history-slot">
              ${i[o]?Ft(i[o],t,e):o===0&&r?l`<div class="empty">Nothing recorded yet</div>`:d}
            </div>
          `)}
      </div>
      ${t.dialogOpen?je(t,e):d}
    </div>
  `}var Yt=2;function Gt(t,e){if(e.length===0)return"No speakers selected";let r=e.map(o=>t.find(n=>n.entityId===o)?.name??o),i=r.slice(0,Yt).join(", "),s=r.length-Yt;return s>0?`${i} +${s}`:i}function Xt(t,e){let r=t.selected.includes(e.entityId);return l`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${r}
      data-on=${r}
      @click=${()=>t.onToggle(e.entityId)}
    >
      <span class="target-name">${e.name}</span>
      ${e.available?d:l`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${r?"\u2713":""}</span>
    </button>
  `}function Ur(t,e){let r=t.selected.includes(e.entityId);return l`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${r}
      data-on=${r}
      @click=${()=>t.onToggle(e.entityId)}
    >
      ${e.name}${e.available?"":" (unavailable)"}
    </button>
  `}function Jt(t){let e=l`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${t.selected.length} of ${t.players.length}</span>
    </div>
  `;return t.players.length===0?t.style==="dropdown"?l`<div class="pill-wrap">
          <button class="pill" disabled>
            <span class="pill-icon">${He}</span>
            <span class="pill-text">No speakers found</span>
          </button>
        </div>`:l`${e}<div class="empty">No speakers found</div>`:t.style==="chips"?l`
      ${e}
      <div class="chips">${t.players.map(r=>Ur(t,r))}</div>
    `:t.style==="dropdown"?l`
      <div class="pill-wrap">
        <button
          class="pill"
          aria-expanded=${t.open}
          aria-haspopup="true"
          title=${Gt(t.players,t.selected)}
          @click=${()=>t.onOpenChange(!t.open)}
        >
          <span class="pill-icon">${He}</span>
          <span class="pill-text">${Gt(t.players,t.selected)}</span>
          <span class="pill-chevron">${jt}</span>
        </button>
        ${t.open?l`
              <!-- Absolutely positioned: an inline panel would push
                   everything below it down the card. -->
              <div class="pill-panel">
                ${e}
                ${t.players.map(r=>Xt(t,r))}
              </div>
            `:d}
      </div>
    `:l`
    ${e}
    <div class="target-rows">${t.players.map(r=>Xt(t,r))}</div>
  `}function zr(t){let r=t.currentTarget.getBoundingClientRect();return r.width===0?0:Math.min(1,Math.max(0,(t.clientX-r.left)/r.width))}function Qt(t){let e=i=>t.progress!==void 0&&i/t.bars.length<t.progress,r=i=>{t.seekable&&t.onSeek(zr(i))};return l`
    <div
      class="wave ${t.seekable?"seekable":""} ${t.className??""}"
      @pointerdown=${i=>{t.seekable&&(i.currentTarget.setPointerCapture(i.pointerId),r(i))}}
      @pointermove=${i=>{t.seekable&&i.buttons>0&&r(i)}}
      @pointerup=${i=>{t.seekable&&i.currentTarget.releasePointerCapture(i.pointerId)}}
      @pointercancel=${i=>{t.seekable&&i.currentTarget.releasePointerCapture(i.pointerId)}}
    >
      ${t.bars.map((i,s)=>l`
          <div
            class="bar ${e(s)?"played":t.recording?"live":""}"
            style="height:${Math.max(2,Math.round(i*100))}%;--i:${s}"
          ></div>
        `)}
    </div>
  `}function qe(t){return l`
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
  `}function Zt(t){return l`
    <div class="popover-wrap">
      <button
        class="icon"
        data-active=${t.enabled}
        aria-expanded=${t.open}
        title="Broadcast volume"
        aria-label="Broadcast volume"
        @click=${()=>t.onOpenChange(!t.open)}
      >
        ${$e}
      </button>
      ${t.open?l`<div class="popover">${qe(t)}</div>`:d}
    </div>
  `}var Ir=4e3,Nr=10,Br=.25,g=class extends y{constructor(){super(...arguments);this.config={type:""};this.selected=[];this.history=[];this.position=0;this.playing=!1;this.pickerOpen=!1;this.historyOpen=!1;this.volumeOpen=!1;this.menuOpen=!1;this.volumeOverride=!1;this.volume=1;this.rec=new U(this,{recordMode:()=>this.recordMode,maxDuration:()=>this.resolved.maxDuration,noiseSuppression:()=>this.resolved.noiseSuppression,onStart:()=>this.setStatus(void 0),onError:(r,i)=>this.fail(r,i),onTake:r=>{this.setClip(Et(r.blob,r.duration,r.peaks))}})}setConfig(r){this.config=r,this.selected=[...Le(r).selected]}get resolved(){return Le(this.config)}getCardSize(){let r=this.resolved;if(r.layout==="compact")return 2;let i=5;return i+=r.speakerPicker==="list"?4:r.speakerPicker==="chips"?1:0,r.recentMessages==="list"&&(i+=3),i}getGridOptions(){return{columns:12,min_columns:6}}static getConfigForm(){return _t}static getStubConfig(r){return{type:"custom:hass-broadcast-card",layout:"full",speaker_picker:"dropdown",recent_messages:"button",volume_control:!0,speakers:F(r),selected:[],record_mode:"push_to_talk",max_duration:60,mode:"plain"}}connectedCallback(){super.connectedCallback(),this.rec.supported||(this.status={kind:"error",text:de,sticky:!0}),this.refreshHistory()}updated(){let r=this.renderRoot?.querySelector?.("dialog");r&&!r.open&&r.showModal?.()}disconnectedCallback(){super.disconnectedCallback(),this.stopPlayback(),this.clearStatusTimer(),ve(this.clip),this.clip=void 0,this.historyOpen=!1,this.menuOpen=!1,this.volumeOpen=!1}async refreshHistory(){if(!(!this.hass||this.resolved.recentMessages==="off"))try{this.history=await ut(this.hass)}catch{this.history=[]}}get players(){return vt(F(this.hass),this.resolved.speakers)}get targets(){return yt(this.selected,this.resolved.speakers)}get recordMode(){return this.resolved.recordMode}clearStatusTimer(){this.statusTimer!==void 0&&(window.clearTimeout(this.statusTimer),this.statusTimer=void 0)}setStatus(r){this.clearStatusTimer(),this.status=r,r&&!r.sticky&&(this.statusTimer=window.setTimeout(()=>{this.statusTimer=void 0,this.status===r&&(this.status=void 0)},Ir))}fail(r,i=!1){this.setStatus({kind:"error",text:r,sticky:i})}setClip(r){this.stopPlayback(),this.clip&&this.clip!==r&&ve(this.clip),this.clip=r}clearClip(){this.stopPlayback(),ve(this.clip),this.clip=void 0}seek(r){if(!this.clip)return;this.position=r*this.clip.duration;let i=this.ensureAudio();i&&i.src===this.clip.url&&(i.currentTime=this.position)}ensureAudio(){if(!(typeof Audio>"u"))return this.audio||(this.audio=new Audio,this.audio.addEventListener("timeupdate",()=>{this.position=this.audio?.currentTime??0}),this.audio.addEventListener("ended",()=>{this.playing=!1,this.position=0})),this.audio}togglePlay(){let r=this.ensureAudio();if(!(!r||!this.clip)){if(this.playing){r.pause(),this.playing=!1;return}r.src!==this.clip.url&&(r.src=this.clip.url,r.currentTime=this.position),r.play().then(()=>{this.playing=!0},i=>{this.fail(`Could not play that here: ${i?.message??i}`)})}}stopPlayback(){this.audio?.pause(),this.playing=!1,this.position=0}toggleTarget(r){this.selected=this.selected.includes(r)?this.selected.filter(i=>i!==r):[...this.selected,r]}get canBroadcast(){return this.clip!==void 0&&this.targets.length>0&&this.rec.phase==="idle"}async broadcast(){if(this.rec.phase!=="idle")return;let r=this.clip;if(!r){this.fail("Record a message or pick one from below first.");return}let i=this.targets;if(i.length===0){this.fail("Pick at least one speaker first.");return}this.rec.setSending(!0),this.setStatus(void 0);try{let s=await ye({hass:this.hass,clip:r,targets:i,mode:this.resolved.mode,volume:this.volumeOverride?this.volume:void 0,onStored:o=>{this.clip===r&&(this.clip={...r,source:{kind:"stored",id:o}})}});this.rec.setSending(!1),this.setStatus(be(this.hass,s)),await this.refreshHistory()}catch(s){this.rec.setSending(!1),this.fail(`Could not send: ${s?.message??s}`)}}async loadMessage(r){this.loadingId=r.id,this.historyOpen=!1,this.setStatus(void 0);try{this.setClip(await Rt(this.hass,r))}catch(i){this.fail(i?.message??String(i))}finally{this.loadingId=void 0}}async deleteRecording(r){try{await mt(this.hass,r)&&await this.refreshHistory()}catch(i){i?.code==="not_authorized"?this.fail("You do not have permission to delete this recording."):this.fail(`Could not delete: ${i?.message??i}`)}}get hint(){return this.recordMode==="push_to_talk"?"Hold to talk":"Tap to record"}get recordLabel(){return this.rec.phase==="sending"?"Broadcasting":this.rec.phase==="recording"?this.recordMode==="push_to_talk"?"Recording \u2014 release to stop":"Recording \u2014 tap to stop":this.hint}get view(){return this.rec.phase==="recording"?"recording":this.status?"status":this.clip?"review":"idle"}get timerWarning(){let r=this.resolved.maxDuration,i=Math.min(Nr,r*Br);return this.rec.phase==="recording"&&r-this.rec.elapsed<=i}historyProps(){return{messages:this.history,loadedId:this.clip?fe(this.clip):void 0,loadingId:this.loadingId,onLoad:r=>void this.loadMessage(r),onDelete:r=>void this.deleteRecording(r),onDialogOpenChange:r=>{this.historyOpen=r}}}get parts(){let r=this.rec.phase==="recording",i=this.rec.phase==="sending",s=this.clip!==void 0&&!r,o={enabled:this.volumeOverride,value:this.volume,onToggle:()=>{this.volumeOverride=!this.volumeOverride},onChange:a=>{this.volume=a}},n=this.resolved;return{title:n.title,view:this.view,speakerPicker:n.speakerPicker,recentMessages:n.recentMessages,volumeControl:n.volumeControl,hint:this.hint,timer:O(this.rec.elapsed),timerWarning:this.timerWarning,status:this.status,reviewing:s,mic:a=>ke({size:a,recording:r,disabled:!this.rec.supported||i,recordMode:this.recordMode,level:this.rec.level,maxDuration:this.resolved.maxDuration,label:this.recordLabel,onPressStart:c=>void this.rec.onPressStart(c),onPressEnd:()=>void this.rec.onPressEnd()}),play:()=>l`
        <button
          class="icon play"
          ?disabled=${!s||i}
          title=${this.playing?"Pause":"Play"}
          aria-label=${this.playing?"Pause":"Play"}
          @click=${()=>this.togglePlay()}
        >
          ${this.playing?It:zt}
        </button>
      `,waveform:a=>l`${pt(this.clip?.url??"none",Qt({bars:this.clip?.peaks.length?this.clip.peaks:ue(48),progress:this.clip?this.position/(this.clip.duration||1):void 0,seekable:s&&!i,recording:!1,onSeek:c=>this.seek(c),className:`${a} reveal`}))}`,clipLength:O(this.clip?.duration??0),discard:()=>l`
        <button
          class="icon discard"
          ?disabled=${!s||i}
          title="Discard"
          aria-label="Discard"
          @click=${()=>this.clearClip()}
        >
          ${xe}
        </button>
      `,send:a=>{let c=this.targets.length,p=c>1?`Send to ${c}`:"Send";return l`
          <div class="send-wrap send-wrap-${a}">
            <button
              class="send send-${a}"
              ?disabled=${!this.canBroadcast}
              data-sending=${i}
              title=${p}
              aria-label=${i?"Broadcasting":p}
              @click=${()=>void this.broadcast()}
            >
              ${i?l`<span class="spinner" aria-hidden="true"></span>`:Ut}
              ${a==="pill"?l`<span>Send</span>`:d}
            </button>
            ${a==="round"?l`<span class="caption">${p}</span>`:d}
          </div>
        `},speakers:()=>Jt({players:this.players.map(a=>({entityId:a,name:this.hass?.states?.[a]?.attributes?.friendly_name??a,available:this.hass?.states?.[a]?.state!=="unavailable"})),selected:this.selected,style:n.speakerPicker,open:this.pickerOpen,onToggle:a=>this.toggleTarget(a),onOpenChange:a=>{this.pickerOpen=a}}),historyList:()=>Kt({...this.historyProps(),dialogOpen:!1}),historyButton:()=>l`
        <button
          class="icon"
          title="Recent messages"
          aria-label="Recent messages"
          @click=${()=>{this.historyOpen=!0}}
        >
          ${we}
        </button>
      `,volumeButton:()=>Zt({...o,open:this.volumeOpen,onOpenChange:a=>{this.volumeOpen=a}}),volumePanel:()=>qe(o),historyDialog:()=>this.historyOpen?je(this.historyProps()):d,menuOpen:this.menuOpen,onMenuOpenChange:a=>{this.menuOpen=a},onOpenHistory:()=>{this.historyOpen=!0}}}render(){let r=this.parts;return l`
      <ha-card>
        ${this.resolved.layout==="compact"?qt(r):Vt(r)}
        <div class="sr-only" aria-live="polite">${this.status?.text??""}</div>
      </ha-card>
    `}};g.styles=Ot,u([L({attribute:!1})],g.prototype,"hass",2),u([f()],g.prototype,"config",2),u([f()],g.prototype,"status",2),u([f()],g.prototype,"selected",2),u([f()],g.prototype,"history",2),u([f()],g.prototype,"clip",2),u([f()],g.prototype,"loadingId",2),u([f()],g.prototype,"position",2),u([f()],g.prototype,"playing",2),u([f()],g.prototype,"pickerOpen",2),u([f()],g.prototype,"historyOpen",2),u([f()],g.prototype,"volumeOpen",2),u([f()],g.prototype,"menuOpen",2),u([f()],g.prototype,"volumeOverride",2),u([f()],g.prototype,"volume",2),g=u([ae("hass-broadcast-card")],g);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{g as HassBroadcastCard,Ir as STATUS_MS};
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
