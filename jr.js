;(function() {
  const D=document, Ep=Element.prototype, ETp=EventTarget.prototype
  Ep.$=Ep.querySelector; Ep.$$=Ep.querySelectorAll
  Ep.class=function(k,v){return v==null ? this.classList.contains(k)
      : this.classList.toggle(k, (v==-1) ? undefined : v)}
  Ep.attr=function(k,v){ return this[
    (U(v)?'get':((v===null)?'remove':'set'))+'Attribute'](k,v)}
  ETp.on=ETp.addEventListener; ETp.off=ETp.removeEventListener
  window.$=D.querySelector.bind(D); window.$$=D.querySelectorAll.bind(D)
  window.html=(s)=>{let d=D.createElement('template');
    d.innerHTML=s.trim(); return d.content.cloneNode(true)}
  window.after=(t,f)=>setTimeout(f,t*1000)
}());

