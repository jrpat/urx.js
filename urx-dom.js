////////////////////////////////////////////////////////////////////////
// API

export const ui = name => ui.$.get(name) ?? ui.init(name)

ui.$ = new Map()

ui.register = function(t) {
  const root = t.content.cloneNode(true)
  const setup = X(root, 'script:not([cleanup])')
  const cleanup = X(root, 'script[cleanup]')
  const state = Function(...uenv[0], setup?.textContent)(...uenv[1])
  root.normalize()
  const comp = {renderInto: (parent) => insert(parent, root, state)}
  ui.$.set(t.getAttribute('name'), comp)
  return comp
}

ui.init = function(andReturn) {
  const templates = QQ(document, 'template[name]:not([ignore])')
  for (const t of templates) { ui.register(t) }
  return ui.$.get(andReturn)
}


////////////////////////////////////////////////////////////////////////
// Implementation

const [keys, vals] = [Object.keys, Object.values]

import * as urx from '/urx-part2.js'
const {atom, calc, effect, batch} = urx
const uenv = [keys(urx), vals(urx)]

const Q = ((e, s) => e.querySelector(s)), QQ = ((e, s) => e.querySelectorAll(s))
const X = (e, s) => { let m = Q(e, s); m?.remove(); return m }

const mustache = /{{(.*?)}}/g

function $text(parent, node, state) {
  const parts = node.textContent.split(mustache), len = parts.length
  for (let i = 0; i < len;) {
    let [text, expr] = [parts[i++], parts[i++]]
    if (text.length > 0) { parent.appendChild(new Text(text)) }
    if (!expr) { continue }
    let fn = Function(...keys(state), `return String(${expr})`)
    let elem = parent.appendChild(new Text())
    effect(() => elem.textContent = fn(...vals(state)))
  }
}

function insert(into, node, state) {
  for (const child of node.childNodes) {
    switch (child.nodeType) {
      case Node.TEXT_NODE:
        $text(into, child, state)
        break
      default:
        into.appendChild(child)
        break
    }
  }
}

