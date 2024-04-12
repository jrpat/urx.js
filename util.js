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
