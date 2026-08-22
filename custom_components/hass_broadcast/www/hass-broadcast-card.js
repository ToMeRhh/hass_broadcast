var Le=Object.defineProperty;var Ne=Object.getOwnPropertyDescriptor;var u=(i,e,t,s)=>{for(var r=s>1?void 0:s?Ne(e,t):e,o=i.length-1,n;o>=0;o--)(n=i[o])&&(r=(s?n(e,t,r):n(r))||r);return s&&r&&Le(e,t,r),r};var z=globalThis,q=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),ce=new WeakMap,M=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(q&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=ce.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ce.set(t,e))}return e}toString(){return this.cssText}},he=i=>new M(typeof i=="string"?i:i+"",void 0,Y),R=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new M(t,i,Y)},de=(i,e)=>{if(q)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),r=z.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},J=q?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return he(t)})(i):i;var{is:je,defineProperty:De,getOwnPropertyDescriptor:He,getOwnPropertyNames:Ie,getOwnPropertySymbols:ze,getPrototypeOf:qe}=Object,B=globalThis,pe=B.trustedTypes,Be=pe?pe.emptyScript:"",We=B.reactiveElementPolyfillSupport,T=(i,e)=>i,O={toAttribute(i,e){switch(e){case Boolean:i=i?Be:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},W=(i,e)=>!je(i,e),ue={attribute:!0,type:String,converter:O,reflect:!1,useDefault:!1,hasChanged:W};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ue){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&De(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){let{get:r,set:o}=He(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){let l=r?.call(this);o?.call(this,n),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ue}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let e=qe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let t=this.properties,s=[...Ie(t),...ze(t)];for(let r of s)this.createProperty(r,t[r])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let r of s)t.unshift(J(r))}else e!==void 0&&t.push(J(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return de(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:O).toAttribute(t,s.type);this._$Em=e,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(e,t){let s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:O;this._$Em=r;let l=n.fromAttribute(t,o.type);this[r]=l??this._$Ej?.get(r)??l,this._$Em=null}}requestUpdate(e,t,s,r=!1,o){if(e!==void 0){let n=this.constructor;if(r===!1&&(o=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??W)(o,t)||s.useDefault&&s.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:o},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,o]of s){let{wrapped:n}=o,l=this[r];n!==!0||this._$AL.has(r)||l===void 0||this.C(r,void 0,o,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[T("elementProperties")]=new Map,b[T("finalized")]=new Map,We?.({ReactiveElement:b}),(B.reactiveElementVersions??=[]).push("2.1.2");var re=globalThis,fe=i=>i,V=re.trustedTypes,me=V?V.createPolicy("lit-html",{createHTML:i=>i}):void 0,_e="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,xe="?"+_,Ve=`<${xe}>`,A=document,N=()=>A.createComment(""),j=i=>i===null||typeof i!="object"&&typeof i!="function",ie=Array.isArray,Fe=i=>ie(i)||typeof i?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,ye=/>/g,x=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ve=/'/g,be=/"/g,we=/^(?:script|style|textarea|title)$/i,oe=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),m=oe(1),lt=oe(2),ct=oe(3),S=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),$e=new WeakMap,w=A.createTreeWalker(A,129);function Ae(i,e){if(!ie(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return me!==void 0?me.createHTML(e):e}var Ke=(i,e)=>{let t=i.length-1,s=[],r,o=e===2?"<svg>":e===3?"<math>":"",n=L;for(let l=0;l<t;l++){let a=i[l],d,p,c=-1,v=0;for(;v<a.length&&(n.lastIndex=v,p=n.exec(a),p!==null);)v=n.lastIndex,n===L?p[1]==="!--"?n=ge:p[1]!==void 0?n=ye:p[2]!==void 0?(we.test(p[2])&&(r=RegExp("</"+p[2],"g")),n=x):p[3]!==void 0&&(n=x):n===x?p[0]===">"?(n=r??L,c=-1):p[1]===void 0?c=-2:(c=n.lastIndex-p[2].length,d=p[1],n=p[3]===void 0?x:p[3]==='"'?be:ve):n===be||n===ve?n=x:n===ge||n===ye?n=L:(n=x,r=void 0);let $=n===x&&i[l+1].startsWith("/>")?" ":"";o+=n===L?a+Ve:c>=0?(s.push(d),a.slice(0,c)+_e+a.slice(c)+_+$):a+_+(c===-2?l:$)}return[Ae(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},D=class i{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let o=0,n=0,l=e.length-1,a=this.parts,[d,p]=Ke(e,t);if(this.el=i.createElement(d,s),w.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(r=w.nextNode())!==null&&a.length<l;){if(r.nodeType===1){if(r.hasAttributes())for(let c of r.getAttributeNames())if(c.endsWith(_e)){let v=p[n++],$=r.getAttribute(c).split(_),I=/([.?@])?(.*)/.exec(v);a.push({type:1,index:o,name:I[2],strings:$,ctor:I[1]==="."?Q:I[1]==="?"?ee:I[1]==="@"?te:P}),r.removeAttribute(c)}else c.startsWith(_)&&(a.push({type:6,index:o}),r.removeAttribute(c));if(we.test(r.tagName)){let c=r.textContent.split(_),v=c.length-1;if(v>0){r.textContent=V?V.emptyScript:"";for(let $=0;$<v;$++)r.append(c[$],N()),w.nextNode(),a.push({type:2,index:++o});r.append(c[v],N())}}}else if(r.nodeType===8)if(r.data===xe)a.push({type:2,index:o});else{let c=-1;for(;(c=r.data.indexOf(_,c+1))!==-1;)a.push({type:7,index:o}),c+=_.length-1}o++}}static createElement(e,t){let s=A.createElement("template");return s.innerHTML=e,s}};function C(i,e,t=i,s){if(e===S)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl,o=j(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=C(i,r._$AS(i,e.values),r,s)),e}var Z=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??A).importNode(t,!0);w.currentNode=r;let o=w.nextNode(),n=0,l=0,a=s[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new H(o,o.nextSibling,this,e):a.type===1?d=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(d=new se(o,this,e)),this._$AV.push(d),a=s[++l]}n!==a?.index&&(o=w.nextNode(),n++)}return w.currentNode=A,r}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},H=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=C(this,e,t),j(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Fe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&j(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=D.createElement(Ae(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{let o=new Z(r,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=$e.get(e.strings);return t===void 0&&$e.set(e.strings,t=new D(e)),t}k(e){ie(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,r=0;for(let o of e)r===t.length?t.push(s=new i(this.O(N()),this.O(N()),this,this.options)):s=t[r],s._$AI(o),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=fe(e).nextSibling;fe(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(e,t=this,s,r){let o=this.strings,n=!1;if(o===void 0)e=C(this,e,t,0),n=!j(e)||e!==this._$AH&&e!==S,n&&(this._$AH=e);else{let l=e,a,d;for(e=o[0],a=0;a<o.length-1;a++)d=C(this,l[s+a],t,a),d===S&&(d=this._$AH[a]),n||=!j(d)||d!==this._$AH[a],d===h?e=h:e!==h&&(e+=(d??"")+o[a+1]),this._$AH[a]=d}n&&!r&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Q=class extends P{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},ee=class extends P{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},te=class extends P{constructor(e,t,s,r,o){super(e,t,s,r,o),this.type=5}_$AI(e,t=this){if((e=C(this,e,t,0)??h)===S)return;let s=this._$AH,r=e===h&&s!==h||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==h&&(s===h||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},se=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}};var Ge=re.litHtmlPolyfillSupport;Ge?.(D,H),(re.litHtmlVersions??=[]).push("3.3.3");var Se=(i,e,t)=>{let s=t?.renderBefore??e,r=s._$litPart$;if(r===void 0){let o=t?.renderBefore??null;s._$litPart$=r=new H(e.insertBefore(N(),o),o,void 0,t??{})}return r._$AI(i),r};var ne=globalThis,y=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Se(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};y._$litElement$=!0,y.finalized=!0,ne.litElementHydrateSupport?.({LitElement:y});var Ye=ne.litElementPolyfillSupport;Ye?.({LitElement:y});(ne.litElementVersions??=[]).push("4.2.2");var F=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};var Je={attribute:!0,type:String,converter:O,reflect:!1,hasChanged:W},Xe=(i=Je,e,t)=>{let{kind:s,metadata:r}=t,o=globalThis.litPropertyMetadata.get(r);if(o===void 0&&globalThis.litPropertyMetadata.set(r,o=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),s==="accessor"){let{name:n}=t;return{set(l){let a=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,a,i,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,i,l),l}}}if(s==="setter"){let{name:n}=t;return function(l){let a=this[n];e.call(this,l),this.requestUpdate(n,a,i,!0,l)}}throw Error("Unsupported decorator location: "+s)};function k(i){return(e,t)=>typeof t=="object"?Xe(i,e,t):((s,r,o)=>{let n=r.hasOwnProperty(o);return r.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(r,o):void 0})(i,e,t)}function g(i){return k({...i,state:!0,attribute:!1})}async function Ee(i,e,t){let s=new FormData;s.append("file",e,"recording.wav"),s.append("duration",String(t));let r=await fetch("/api/hass_broadcast/upload",{method:"POST",body:s,headers:{Authorization:`Bearer ${i.auth.data.access_token}`}});if(!r.ok)throw new Error(`Upload failed (${r.status})`);return(await r.json()).message_id}async function Ce(i){return(await i.connection.sendMessagePromise({type:"hass_broadcast/list"})).messages}async function Pe(i,e){return(await i.connection.sendMessagePromise({type:"hass_broadcast/delete",message_id:e})).deleted}async function ae(i,e,t,s){let o=(await i.callService("hass_broadcast","send",{message_id:e,targets:t,mode:s},void 0,void 0,!0))?.response?.failed;return{failed:Array.isArray(o)?o:[]}}var ke="Recording needs a secure connection. Open Home Assistant over HTTPS (or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";function Ue(i){return i?.name==="NotAllowedError"?"Microphone permission was denied. Allow it for this site and try again.":`Could not start recording: ${i?.message??i?.name??"unknown error"}`}function Me(i,e){let t=i.length*2,s=new ArrayBuffer(44+t),r=new DataView(s),o=(n,l)=>{for(let a=0;a<l.length;a++)r.setUint8(n+a,l.charCodeAt(a))};return o(0,"RIFF"),r.setUint32(4,36+t,!0),o(8,"WAVE"),o(12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,e,!0),r.setUint32(28,e*2,!0),r.setUint16(32,2,!0),r.setUint16(34,16,!0),o(36,"data"),r.setUint32(40,t,!0),new Int16Array(s,44).set(i),new Blob([s],{type:"audio/wav"})}var Re=16e3,Ze="/api/hass_broadcast/static/recorder-worklet.js",U=class{constructor(){this.chunks=[];this.active=!1}static isSupported(){return typeof window<"u"&&window.isSecureContext===!0&&!!navigator.mediaDevices?.getUserMedia&&typeof AudioWorkletNode<"u"}onLevel(e){this.levelCallback=e}async start(){this.chunks=[];try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.context=new AudioContext({sampleRate:Re}),await this.context.audioWorklet.addModule(Ze);let e=this.context.createMediaStreamSource(this.stream);this.node=new AudioWorkletNode(this.context,"recorder-worklet"),this.node.port.onmessage=t=>{this.chunks.push(t.data),this.levelCallback&&this.levelCallback(Qe(t.data))},e.connect(this.node),this.node.connect(this.context.destination),this.active=!0}catch(e){throw await this.release(),e}}async stop(){if(!this.active)throw new Error("Recorder.stop() called with no active recording session");let e=this.context?.sampleRate??Re,t=this.chunks;await this.release();let s=t.reduce((n,l)=>n+l.length,0),r=new Int16Array(s),o=0;for(let n of t)r.set(n,o),o+=n.length;return{blob:Me(r,e),duration:s/e}}async release(){this.node?.port.close(),this.node?.disconnect(),this.stream?.getTracks().forEach(e=>e.stop());try{await this.context?.close()}catch{}finally{this.context=void 0,this.stream=void 0,this.node=void 0,this.chunks=[],this.active=!1}}};function Qe(i){let e=0;for(let t of i)e=Math.max(e,Math.abs(t));return e/32768}function G(i){return i?.states?Object.keys(i.states).filter(e=>e.startsWith("media_player.")).filter(e=>(i.states[e].attributes.supported_features&512)!==0).sort():[]}function Te(i,e,t){let s=e?.length?[...new Set(e)]:i;if(!t?.length)return s;let r=new Set(t);return s.filter(o=>!r.has(o))}function Oe(i,e,t){let s=e?.length?new Set(e):void 0,r=new Set(t??[]);return i.filter(o=>(s===void 0||s.has(o))&&!r.has(o))}function et(i,e){let t=n=>i?.states?.[n]?.attributes?.friendly_name??n,s=G(i),r=new Set(s),o=[...new Set([...e.show_players??[],...e.hide_players??[]])].filter(n=>!r.has(n)).sort();return[...s,...o].map(n=>({entityId:n,name:t(n),available:r.has(n)}))}function tt(i,e,t){let s=i??[];if(t)return s.includes(e)?s:[...s,e];let r=s.filter(o=>o!==e);return r.length?r:void 0}function le(i){if(i===""||i===null||i===void 0)return 60;let e=Number(i);return isNaN(e)?60:Math.min(300,Math.max(5,e))}var E=class extends y{constructor(){super(...arguments);this.config={type:""}}setConfig(t){this.config=t}emit(t){this.config={...this.config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}playerList(t,s){if(s.length===0)return m`<div class="hint">No media players found.</div>`;let r=this.config[t]??[];return m`
      <div class="players">
        ${s.map(o=>m`
            <label>
              <input
                type="checkbox"
                .checked=${r.includes(o.entityId)}
                @change=${n=>this.emit({[t]:tt(this.config[t],o.entityId,n.target.checked)})}
              />
              <span class=${o.available?"":"missing"}>
                ${o.name}${o.available?"":" (not available)"}
              </span>
            </label>
          `)}
      </div>
    `}render(){let t=et(this.hass,this.config);return m`
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
        <label for="mode">Playback mode</label>
        <select
          id="mode"
          .value=${this.config.mode??"plain"}
          @change=${s=>this.emit({mode:s.target.value})}
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
        <label>Players to show</label>
        ${this.playerList("show_players",t)}
        <div class="hint">
          With nothing checked, the card offers every media player that
          supports playback.
        </div>
      </div>

      <div class="field">
        <label>Players to hide</label>
        ${this.playerList("hide_players",t)}
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
          @change=${s=>this.emit({max_duration:le(s.target.value)})}
        />
      </div>

      <div class="field">
        <label>
          <input
            type="checkbox"
            .checked=${this.config.show_history!==!1}
            @change=${s=>this.emit({show_history:s.target.checked})}
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
      padding: 8px; max-height: 220px; overflow-y: auto; }
    .players label { display: flex; align-items: center; gap: 8px; font-weight: normal;
      margin: 0; padding: 4px 0; }
    .missing { color: var(--secondary-text-color); }
  `,u([k({attribute:!1})],E.prototype,"hass",2),u([g()],E.prototype,"config",2),E=u([F("hass-broadcast-card-editor")],E);var st="Voice Broadcast",f=class extends y{constructor(){super(...arguments);this.config={type:""};this.phase="idle";this.level=0;this.elapsed=0;this.selected=[];this.history=[];this.recorder=new U;this.duration=0;this.busy=!1;this.disconnected=!1}setConfig(t){this.config=t,this.selected=t.targets?[...t.targets]:[]}getCardSize(){return this.config.show_history===!1?3:6}static getConfigElement(){return document.createElement("hass-broadcast-card-editor")}static getStubConfig(){return{type:"custom:hass-broadcast-card",targets:[],mode:"plain"}}connectedCallback(){super.connectedCallback(),this.disconnected=!1,U.isSupported()||(this.error=ke),this.refreshHistory()}disconnectedCallback(){super.disconnectedCallback(),this.disconnected=!0,this.clearTimer(),this.previewUrl&&URL.revokeObjectURL(this.previewUrl),this.phase==="recording"&&!this.busy&&(this.phase="idle",this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1}))}clearTimer(){this.timer!==void 0&&(window.clearInterval(this.timer),this.timer=void 0)}async refreshHistory(){if(!(!this.hass||this.config.show_history===!1))try{this.history=await Ce(this.hass)}catch{this.history=[]}}get players(){return Te(G(this.hass),this.config.show_players,this.config.hide_players)}get targets(){return Oe(this.selected,this.config.show_players,this.config.hide_players)}async startRecording(){if(this.busy||this.phase==="recording")return;this.busy=!0,this.error=void 0;try{this.recorder.onLevel(s=>{this.level=s}),await this.recorder.start()}catch(s){this.error=Ue(s);return}finally{this.busy=!1}if(this.disconnected){this.busy=!0,this.recorder.stop().catch(()=>{}).finally(()=>{this.busy=!1});return}this.phase="recording",this.elapsed=0;let t=le(this.config.max_duration);this.timer=window.setInterval(()=>{this.elapsed+=1,this.elapsed>=t&&this.stopRecording()},1e3)}async stopRecording(){if(!(this.busy||this.phase!=="recording")){this.busy=!0,this.clearTimer();try{let{blob:t,duration:s}=await this.recorder.stop();this.blob=t,this.duration=s,this.previewUrl&&URL.revokeObjectURL(this.previewUrl),this.previewUrl=URL.createObjectURL(t),this.level=0,this.phase="preview"}catch(t){this.error=`Could not finish recording: ${t?.message??t}`,this.phase="idle"}finally{this.busy=!1}}}discard(){this.blob=void 0,this.previewUrl&&(URL.revokeObjectURL(this.previewUrl),this.previewUrl=void 0),this.phase="idle"}toggleTarget(t){this.selected=this.selected.includes(t)?this.selected.filter(s=>s!==t):[...this.selected,t]}async send(){let t=this.targets;if(!this.blob||t.length===0){this.error="Pick at least one speaker first.";return}this.phase="sending",this.error=void 0;try{let s=await Ee(this.hass,this.blob,this.duration),{failed:r}=await ae(this.hass,s,t,this.config.mode??"plain");if(r.length===0){this.discard(),await this.refreshHistory();return}this.error=r.length>=t.length?`Could not play on any speaker: ${this.describe(r)}. The recording was kept \u2014 try again.`:`Played, but not on ${this.describe(r)}. The recording was kept so you can retry those.`,this.phase="preview",await this.refreshHistory()}catch(s){this.error=`Could not send: ${s?.message??s}`,this.phase="preview"}}describe(t){return t.map(s=>this.hass?.states?.[s]?.attributes?.friendly_name??s).join(", ")}async replay(t){let s=this.targets;if(s.length===0){this.error="Pick at least one speaker first.";return}try{let{failed:r}=await ae(this.hass,t,s,this.config.mode??"plain");this.error=r.length===0?void 0:`Could not play on ${this.describe(r)}.`}catch(r){this.error=`Could not play: ${r?.message??r}`}}async deleteRecording(t){try{await Pe(this.hass,t)&&await this.refreshHistory()}catch(s){s?.code==="not_authorized"?this.error="You do not have permission to delete this recording.":this.error=`Could not delete: ${s?.message??s}`}}render(){let t=this.phase==="recording";return m`
      <ha-card .header=${this.config.title?.trim()||st}>
        ${this.error?m`<div class="error">${this.error}</div>`:h}

        <div class="row">
          <button
            class="record"
            ?disabled=${!U.isSupported()||this.phase==="sending"}
            @click=${t?this.stopRecording:this.startRecording}
            title=${t?"Stop":"Record"}
          >
            ${t?"\u25A0":"\u25CF"}
          </button>
          <div class="meter"><div style="width:${Math.round(this.level*100)}%"></div></div>
          <span>${t?`${this.elapsed}s`:""}</span>
        </div>

        ${this.phase==="preview"&&this.previewUrl?m`
              <audio controls src=${this.previewUrl}></audio>
              <div class="actions">
                <button class="action send" @click=${this.send}>
                  <span class="play" aria-hidden="true"></span>Send
                </button>
                <button class="action discard" @click=${this.discard}>Discard</button>
              </div>
            `:h}

        <div class="targets">
          ${this.players.map(s=>m`
              <button
                class="chip"
                data-on=${this.selected.includes(s)}
                @click=${()=>this.toggleTarget(s)}
              >
                ${this.hass.states[s].attributes.friendly_name??s}
              </button>
            `)}
        </div>

        ${this.config.show_history===!1?h:m`
              <div class="history">
                ${this.history.map(s=>m`
                    <div class="history-row">
                      <span>${new Date(s.created).toLocaleString()}</span>
                      <button @click=${()=>this.replay(s.id)}>Play</button>
                      ${s.can_delete?m`<button @click=${()=>this.deleteRecording(s.id)}>Delete</button>`:h}
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
  `,u([k({attribute:!1})],f.prototype,"hass",2),u([g()],f.prototype,"config",2),u([g()],f.prototype,"phase",2),u([g()],f.prototype,"level",2),u([g()],f.prototype,"elapsed",2),u([g()],f.prototype,"error",2),u([g()],f.prototype,"selected",2),u([g()],f.prototype,"history",2),u([g()],f.prototype,"previewUrl",2),f=u([F("hass-broadcast-card")],f);window.customCards=window.customCards??[];window.customCards.push({type:"hass-broadcast-card",name:"Voice Broadcast",description:"Record a voice message and play it on your speakers.",preview:!1});export{f as HassBroadcastCard};
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
