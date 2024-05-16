////////////////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////////

const $$ = new Map()

const ui = (t) => get(t) ?? create(t)
const get = (t) => $$.get(nameof(t))
const set = (t, f) => $$.set(nameof(t), f)
const render = (it, into) => ui(it)(into)

const create = function(t) {
  t = (typeof t == 'string') ? Q(document, `template[name="${t}"]`) : t
  const node = t.content.cloneNode(true)
  const setup = X(node, 'script:not([cleanup])')
  const cleanup = X(node, 'script[cleanup]')
  const state = Function(...uenv[0], setup?.textContent)(...uenv[1])
  node.normalize()
  const comp = (into, at) => $render(node, into, at, state)
  $$.set(nameof(t), comp)
  return comp
}

const init = function() {
  const templates = QQ(document, 'template[name]:not([ignore])')
  for (const t of templates) { create(t) }
}

export default Object.assign(ui, {get, set, render, create, init})


////////////////////////////////////////////////////////////////////////
// Implementation //////////////////////////////////////////////////////

const [keys, vals] = [Object.keys, Object.values]

import * as urx from '/lib/urx.js'
const {atom, calc, effect, batch} = urx
const uenv = [keys(urx), vals(urx)]

const nameof =
  t => (typeof t == 'string' ? t : t.getAttribute('name')).toUpperCase()

const Q = (elem, selector) => elem.querySelector(selector)
const QQ = (elem, selector) => elem.querySelectorAll(selector)
const X = (e, s) => { const m = Q(e, s); m?.remove(); return m }
const ins = (elem, into, at) => into.insertBefore(elem, at ?? null)
const F = (t, src, arg) => Function(...keys(arg), `return ${t}(${src})`)
const C = (t, src, arg) => {
  const fn = F(t, src, arg)
  return calc(() => fn(...vals(arg)))
}

const mustache = /{{(.*?)}}/g

function $render(node, into, at, state) {
  if (node instanceof Element)
    ($$.get(node.tagName) ?? $elem)(node, into, at, state)
  else if (node instanceof DocumentFragment)
    for (const child of node.childNodes)
      $render(child, into, at, state)
  else if (node instanceof Text)
    $text(node, into, at, state)
  else
    ins(node, into, at)
}

function $elem(node, into, at, state) {
  into = ins(node.cloneNode(false), into, at)
  for (const a of node.attributes)
    (A[a.name.at(-1)] ?? A[a.name.at(0)])?.(state, into, a);
  for (const child of node.childNodes)
    $render(child, into, null, state);
}

function $text(node, into, at, state) {
  const parts = node.textContent.split(mustache), len = parts.length
  for (let i = 0; i < len;) {
    let [text, expr] = [parts[i++], parts[i++]]
    if (text.length > 0) { ins(new Text(text), into, at) }
    if (!expr) { continue }
    let c = C('String', expr, state)
    let elem = ins((new Text()), into, at)
    window.txt = effect(() => elem.textContent = c.value)
  }
}

// Attribute Syntax ////////////////////////////////////////////////////

const A = {
  ':': (state, node, {name, value}) => {
    node.removeAttribute(name)
    name = name.slice(0, -1)
    const c = C('String', value, state)
    effect(() => node.setAttribute(name, c.value))
  },

  '?': (state, node, {name, value}) => {
    node.removeAttribute(name)
    name = name.slice(0, -1)
    const c = C('Boolean', value, state)
    effect(() => {
      if (c.value) { node.setAttribute(name, '') }
      else { node.removeAttribute(name) }
    })
  },

  '@': (state, node, {name, value}) => {
    node.removeAttribute(name)
    name = name.slice(1)
    const fn = F('', value, state)
    const handler = (evt) => {
      const result = fn(...vals(state))
      if (result instanceof Function) { result(evt) }
    }
    node.addEventListener(name, handler)
  },
}

// Built-In Components /////////////////////////////////////////////////

$$.set('SHOW', function SHOW(node, into, at, state) {
  let [bgn, end] = [(new Comment()), (new Comment())]
  ins(bgn, into, at)
  ins(end, into, at)
  const c = C('Boolean', node.getAttribute('if'), state)
  const children = [...node.childNodes]
  effect(() => {
    if (c.value) {
      for (const child of children) $render(child, into, end, state)
    } else {
      while (bgn.nextSibling != end)
        bgn.nextSibling.remove()
    }
  })
})

