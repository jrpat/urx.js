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
  window.after=async(t,f)=>new Promise(ok=>setTimeout(()=>ok(f()), t))
}());

////////////////////////////////////////////////////////////////////////

;(function() {

  function logLine(cls, ...args) {
    $('#logOutput').appendChild(html(`
      <code class=${cls}>${args.join('  –  ')}</code>`))
  }

  const oldclog = console.log.bind(console)
  const oldcerr = console.error.bind(console)

  console.log = (...args) => {
    oldclog(...args)
    logLine('log', ...args)
  }
  console.error = (...args) => {
    oldcerr(...args)
    logLine('err', ...args)
  }
  window.log = console.log
  window.err = console.error

}());

////////////////////////////////////////////////////////////////////////

document.body.appendChild(html('<pre id=logOutput>'))

////////////////////////////////////////////////////////////////////////
