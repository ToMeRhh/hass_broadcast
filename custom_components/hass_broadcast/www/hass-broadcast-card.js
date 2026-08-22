var Rt=Object.defineProperty;var Tt=Object.getOwnPropertyDescriptor;var u=(i,t,e,s)=>{for(var r=s>1?void 0:s?Tt(t,e):t,o=i.length-1,n;o>=0;o--)(n=i[o])&&(r=(s?n(t,e,r):n(r))||r);return s&&r&&Rt(t,e,r),r};var z=globalThis,q=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ct=new WeakMap,M=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(q&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ct.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ct.set(e,t))}return t}toString(){return this.cssText}},ht=i=>new M(typeof i=="string"?i:i+"",void 0,G),R=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new M(e,i,G)},lt=(i,t)=>{if(q)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=z.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},Y=q?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return ht(e)})(i):i;var{is:Ot,defineProperty:Nt,getOwnPropertyDescriptor:Lt,getOwnPropertyNames:jt,getOwnPropertySymbols:Dt,getPrototypeOf:Ht}=Object,B=globalThis,dt=B.trustedTypes,It=dt?dt.emptyScript:"",zt=B.reactiveElementPolyfillSupport,T=(i,t)=>i,O={toAttribute(i,t){switch(t){case Boolean:i=i?It:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},W=(i,t)=>!Ot(i,t),pt={attribute:!0,type:String,converter:O,reflect:!1,useDefault:!1,hasChanged:W};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=pt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&Nt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:o}=Lt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:r,set(n){let c=r?.call(this);o?.call(this,n),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??pt}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let t=Ht(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let e=this.properties,s=[...jt(e),...Dt(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(Y(r))}else t!==void 0&&e.push(Y(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:O).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:O;this._$Em=r;let c=n.fromAttribute(e,o.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(t,e,s,r=!1,o){if(t!==void 0){let n=this.constructor;if(r===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??W)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,o]of s){let{wrapped:n}=o,c=this[r];n!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,o,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[T("elementProperties")]=new Map,b[T("finalized")]=new Map,zt?.({ReactiveElement:b}),(B.reactiveElementVersions??=[]).push("2.1.2");var st=globalThis,ut=i=>i,V=st.trustedTypes,ft=V?V.createPolicy("lit-html",{createHTML:i=>i}):void 0,$t="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,_t="?"+_,qt=`<${_t}>`,A=document,L=()=>A.createComment(""),j=i=>i===null||typeof i!="object"&&typeof i!="function",rt=Array.isArray,Bt=i=>rt(i)||typeof i?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,mt=/-->/g,gt=/>/g,x=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),yt=/'/g,vt=/"/g,xt=/^(?:script|style|textarea|title)$/i,it=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),g=it(1),ie=it(2),oe=it(3),E=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),bt=new WeakMap,w=A.createTreeWalker(A,129);function wt(i,t){if(!rt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ft!==void 0?ft.createHTML(t):t}var Wt=(i,t)=>{let e=i.length-1,s=[],r,o=t===2?"<svg>":t===3?"<math>":"",n=N;for(let c=0;c<e;c++){let a=i[c],d,p,h=-1,v=0;for(;v<a.length&&(n.lastIndex=v,p=n.exec(a),p!==null);)v=n.lastIndex,n===N?p[1]==="!--"?n=mt:p[1]!==void 0?n=gt:p[2]!==void 0?(xt.test(p[2])&&(r=RegExp("</"+p[2],"g")),n=x):p[3]!==void 0&&(n=x):n===x?p[0]===">"?(n=r??N,h=-1):p[1]===void 0?h=-2:(h=n.lastIndex-p[2].length,d=p[1],n=p[3]===void 0?x:p[3]==='"'?vt:yt):n===vt||n===yt?n=x:n===mt||n===gt?n=N:(n=x,r=void 0);let $=n===x&&i[c+1].startsWith("/>")?" ":"";o+=n===N?a+qt:h>=0?(s.push(d),a.slice(0,h)+$t+a.slice(h)+_+$):a+_+(h===-2?c:$)}return[wt(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},D=class i{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let o=0,n=0,c=t.length-1,a=this.parts,[d,p]=Wt(t,e);if(this.el=i.createElement(d,s),w.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(r=w.nextNode())!==null&&a.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(let h of r.getAttributeNames())if(h.endsWith($t)){let v=p[n++],$=r.getAttribute(h).split(_),I=/([.?@])?(.*)/.exec(v);a.push({type:1,index:o,name:I[2],strings:$,ctor:I[1]==="."?Z:I[1]==="?"?Q:I[1]==="@"?tt:P}),r.removeAttribute(h)}else h.startsWith(_)&&(a.push({type:6,index:o}),r.removeAttribute(h));if(xt.test(r.tagName)){let h=r.textContent.split(_),v=h.length-1;if(v>0){r.textContent=V?V.emptyScript:"";for(let $=0;$<v;$++)r.append(h[$],L()),w.nextNode(),a.push({type:2,index:++o});r.append(h[v],L())}}}else if(r.nodeType===8)if(r.data===_t)a.push({type:2,index:o});else{let h=-1;for(;(h=r.data.indexOf(_,h+1))!==-1;)a.push({type:7,index:o}),h+=_.length-1}o++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function C(i,t,e=i,s){if(t===E)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,o=j(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=C(i,r._$AS(i,t.values),r,s)),t}var X=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??A).importNode(e,!0);w.currentNode=r;let o=w.nextNode(),n=0,c=0,a=s[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new H(o,o.nextSibling,this,t):a.type===1?d=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(d=new et(o,this,t)),this._$AV.push(d),a=s[++c]}n!==a?.index&&(o=w.nextNode(),n++)}return w.currentNode=A,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},H=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=C(this,t,e),j(t)?t===l||t==null||t===""?(this._$AH!==l&&this._$AR(),this._$AH=l):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Bt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==l&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=D.createElement(wt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let o=new X(r,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=bt.get(t.strings);return e===void 0&&bt.set(t.strings,e=new D(t)),e}k(t){rt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let o of t)r===e.length?e.push(s=new i(this.O(L()),this.O(L()),this,this.options)):s=e[r],s._$AI(o),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=ut(t).nextSibling;ut(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,o){this.type=1,this._$AH=l,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=l}_$AI(t,e=this,s,r){let o=this.strings,n=!1;if(o===void 0)t=C(this,t,e,0),n=!j(t)||t!==this._$AH&&t!==E,n&&(this._$AH=t);else{let c=t,a,d;for(t=o[0],a=0;a<o.length-1;a++)d=C(this,c[s+a],e,a),d===E&&(d=this._$AH[a]),n||=!j(d)||d!==this._$AH[a],d===l?t=l:t!==l&&(t+=(d??"")+o[a+1]),this._$AH[a]=d}n&&!r&&this.j(t)}j(t){t===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Z=class extends P{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===l?void 0:t}},Q=class extends P{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==l)}},tt=class extends P{constructor(t,e,s,r,o){super(t,e,s,r,o),this.type=5}_$AI(t,e=this){if((t=C(this,t,e,0)??l)===E)return;let s=this._$AH,r=t===l&&s!==l||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==l&&(s===l||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},et=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}};var Vt=st.litHtmlPolyfillSupport;Vt?.(D,H),(st.litHtmlVersions??=[]).push("3.3.3");var At=(i,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let o=e?.renderBefore??null;s._$litPart$=r=new H(t.insertBefore(L(),o),o,void 0,e??{})}return r._$AI(i),r};var ot=globalThis,y=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=At(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};y._$litElement$=!0,y.finalized=!0,ot.litElementHydrateSupport?.({LitElement:y});var Ft=ot.litElementPolyfillSupport;Ft?.({LitElement:y});(ot.litElementVersions??=[]).push("4.2.2");var F=i=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(i,t)}):customElements.define(i,t)};var Kt={attribute:!0,type:String,converter:O,reflect:!1,hasChanged:W},Gt=(i=Kt,t,e)=>{let{kind:s,metadata:r}=e,o=globalThis.litPropertyMetadata.get(r);if(o===void 0&&globalThis.litPropertyMetadata.set(r,o=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(e.name,i),s==="accessor"){let{name:n}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(n,a,i,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,i,c),c}}}if(s==="setter"){let{name:n}=e;return function(c){let a=this[n];t.call(this,c),this.requestUpdate(n,a,i,!0,c)}}throw Error("Unsupported decorator location: "+s)};function U(i){return(t,e)=>typeof e=="object"?Gt(i,t,e):((s,r,o)=>{let n=r.hasOwnProperty(o);return r.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(r,o):void 0})(i,t,e)}function m(i){return U({...i,state:!0,attribute:!1})}async function Et(i,t,e){let s=new FormData;s.append("file",t,"recording.wav"),s.append("duration",String(e));let r=await fetch("/api/hass_broadcast/upload",{method:"POST",body:s,headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!r.ok)throw new Error(`Upload failed (${r.status})`);return(await r.json()).message_id}async function St(i){return(await i.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function Ct(i,t){return(await i.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:t})).deleted}async function nt(i,t,e,s){let o=(await i.callService("hass_broadcast","send",{message_id:t,targets:e,mode:s},void 0,void 0,!0))?.response?.failed;return{failed:Array.isArray(o)?o:[]}}var Pt="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function Ut(i){return i?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${i?.message??i?.name??"unknown error"}`}function kt(i,t){let e=i.length*2,s=new ArrayBuffer(44+e),r=new DataView(s),o=(n,c)=>{for(let a=0;a<c.length;a++)r.setUint8(n+a,c.charCodeAt(a))};return o(0,"RIFF"),r.setUint32(4,36+e,!0),o(8,"WAVE"),o(12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,t,!0),r.setUint32(28,t*2,!0),r.setUint16(32,2,!0),r.setUint16(34,16,!0),o(36,"data"),r.setUint32(40,e,!0),new Int16Array(s,44).set(i),new Blob([s],{type:"audio/wav"})}var Mt=16e3,Yt="/api/hass_broadcast/static/recorder-worklet.js",k=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(t){this.levelCallback=t}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:Mt}),await this.context.audioWorklet.addModule(Yt);let t=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=e=>{this.chunks.push(e.data),this.levelCallback&&this.levelCallback(Jt(e.data))},t.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(t){throw await this.release(),t}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let t=this.context?.sampleRate??Mt,e=this.chunks;await this.release();let s=e.reduce((n,c)=>n+c.length,0),r=new Int16Array(s),o=0;for(let n of e)r.set(n,o),o+=n.length;return{blob:kt(r,t),duration:s/t}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(t=>t.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function Jt(i){let t=0;for(let e of i)t=Math.max(t,Math.abs(e));return t/32768}function at(i){if(i===""||i===null||i===void 0)return 60;let t=Number(i);return isNaN(t)?60:Math.min(300,Math.max(5,t))}var S=class extends y{constructor(){super(...arguments);this.config={type:""}}setConfig(e){this.config=e}emit(e){this.config={...this.config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}render(){return g`
      <div class="field">
        <label for="title">Card name</label>
        <input
          id="title"
          type="text"
          placeholder="Voice Broadcast"
          .value=${this.config.title??""}
          @change=${e=>this.emit({title:e.target.value.trim()||void 0})}
        />
      </div>

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
    `}};S.styles=R`
    .field { display: block; margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    .hint { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
    input[type="text"], input[type="number"], select { width: 100%; box-sizing: border-box;
      padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color, #ddd);
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      font: inherit; }
  `,u([U({attribute:!1})],S.prototype,"hass",2),u([m()],S.prototype,"config",2),S=u([F("hass-broadcast-card-editor")],S);var Xt=512,Zt="Voice Broadcast",f=class extends y{constructor(){super(...arguments);this.config={type:""};this.phase="idle";this.level=0;this.elapsed=0;this.selected=[];this.history=[];this.recorder=new k;this.duration=0;this.busy=!1;this.disconnected=!1}setConfig(e){this.config=e,this.selected=e.targets?[...e.targets]:[]}getCardSize(){return this.config.show_history===!1?3:6}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain"}}connectedCallback(){super.connectedCallback(),this.disconnected=!1,k.isSupported()||(this.error=Pt),this.refreshHistory()}disconnectedCallback(){super.disconnectedCallback(),this.disconnected=!0,this.clearTimer(),this.previewUrl&&URL.revokeObjectURL(this.previewUrl),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1}))}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}async refreshHistory(){if(!(!this.hass||this.config.show_history===!1))try{this.history=await St(this.hass)}catch{this.history=[]}}get players(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("media_player.")).filter(e=>(this.hass.states[e].attributes.supported_features&Xt)!==0).sort():[]}async startRecording(){if(this.busy||this.phase==="recording")return;this.busy=!0,this.error=void 0;try{this.recorder.onLevel(s=>{this.level=s}),await this.recorder.start()}catch(s){this.error=Ut(s);return}finally{this.busy=!1}if(this.disconnected){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1});return}this.phase="recording",this.elapsed=0;let e=at(this.config.max_duration);this.timer=window.setInterval(()=>{this.elapsed+=1,this.elapsed>=e&&this.stopRecording()},1e3)}async stopRecording(){if(!(this.busy||this.phase!=="recording")){this.busy=!0,this.clearTimer();try{let{blob:e,duration:s}=await this.recorder.stop();this.blob=e,this.duration=s,this.previewUrl&&URL.revokeObjectURL(this.previewUrl),this.previewUrl=URL.createObjectURL(e),this.level=0,this.phase="preview"}catch(e){this.error=`Could not finish recording: ${e?.message??e}`,this.phase="idle"}finally{this.busy=!1}}}discard(){this.blob=void 0,this.previewUrl&&(URL.revokeObjectURL(this.previewUrl),this.previewUrl=void 0),this.phase="idle"}toggleTarget(e){this.selected=this.selected.includes(e)?this.selected.filter(s=>s!==e):[...this.selected,e]}async send(){if(!this.blob||this.selected.length===0){this.error="Pick at least one speaker first.";return}this.phase="sending",this.error=void 0;try{let e=await Et(this.hass,this.blob,this.duration),{failed:s}=await nt(this.hass,e,this.selected,this.config.mode??"plain");if(s.length===0){this.discard(),await this.refreshHistory();return}this.error=s.length>=this.selected.length?`Could not play on any speaker: ${this.describe(s)}. The recording was kept \u2014 try again.`:`Played, but not on ${this.describe(s)}. The recording was kept so you can retry those.`,this.phase="preview",await this.refreshHistory()}catch(e){this.error=`Could not send: ${e?.message??e}`,this.phase="preview"}}describe(e){return e.map(s=>this.hass?.states?.[s]?.attributes?.friendly_name??s).join(", ")}async replay(e){if(this.selected.length===0){this.error="Pick at least one speaker first.";return}try{let{failed:s}=await nt(this.hass,e,this.selected,this.config.mode??"plain");this.error=s.length===0?void 0:`Could not play on ${this.describe(s)}.`}catch(s){this.error=`Could not play: ${s?.message??s}`}}async deleteRecording(e){try{await Ct(this.hass,e)&&await this.refreshHistory()}catch(s){s?.code==="not_authorized"?this.error="You do not have permission to delete this recording.":this.error=`Could not delete: ${s?.message??s}`}}render(){let e=this.phase==="recording";return g`
      <ha-card .header=${this.config.title?.trim()||Zt}>
        ${this.error?g`<div class="error">${this.error}</div>`:l}

        <div class="row">
          <button
            class="record"
            ?disabled=${!k.isSupported()||this.phase==="sending"}
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
              <div class="actions">
                <button class="action send" @click=${this.send}>
                  <span class="play" aria-hidden="true"></span>Send
                </button>
                <button class="action discard" @click=${this.discard}>Discard</button>
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
    `}};f.styles=R`
    ha-card { padding: 16px; }
    .row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .record { border: none; border-radius: 50%; width: 56px; height: 56px;
      background: var(--error-color, #db4437); color: #fff; cursor: pointer; font-size: 22px; }
    .record[disabled] { opacity: 0.5; cursor: not-allowed; }
    .meter { flex: 1; height: 6px; background: var(--divider-color, #ddd); border-radius: 3px; overflow: hidden; }
    .meter > div { height: 100%; background: var(--primary-color); transition: width 80ms linear; }
    .error { color: var(--error-color, #db4437); margin-bottom: 12px; }
    /* Preview actions: centred, and spaced away from the speaker list below. */
    .actions { display: flex; justify-content: center; align-items: center; gap: 12px;
      margin: 4px 0 24px; }
    .action { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      font: inherit; font-size: 0.95em; font-weight: 500; line-height: 1;
      padding: 10px 22px; border-radius: 20px; border: 1px solid transparent;
      cursor: pointer; transition: background 120ms ease, box-shadow 120ms ease; }
    .action:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .send { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }
    .send:hover { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); }
    /* Play triangle, drawn from borders so it inherits the label colour. */
    .send .play { width: 0; height: 0; border-left: 9px solid currentColor;
      border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
    .discard { background: none; color: var(--secondary-text-color);
      border-color: var(--divider-color, #ddd); }
    .discard:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      color: var(--primary-text-color); }
    .targets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .chip { padding: 6px 12px; border-radius: 16px; cursor: pointer;
      border: 1px solid var(--divider-color, #ddd); background: none; color: var(--primary-text-color); }
    .chip[data-on="true"] { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .history { border-top: 1px solid var(--divider-color, #ddd); margin-top: 12px; padding-top: 8px; }
    .history-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .history-row span { flex: 1; font-size: 0.9em; }
    audio { width: 100%; margin-bottom: 12px; }
  `,u([U({attribute:!1})],f.prototype,"hass",2),u([m()],f.prototype,"config",2),u([m()],f.prototype,"phase",2),u([m()],f.prototype,"level",2),u([m()],f.prototype,"elapsed",2),u([m()],f.prototype,"error",2),u([m()],f.prototype,"selected",2),u([m()],f.prototype,"history",2),u([m()],f.prototype,"previewUrl",2),f=u([F("hass-broadcast-card")],f);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{f as HassBroadcastCard};
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
