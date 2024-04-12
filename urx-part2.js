class jSet {
  arr = []
  add(x) {
    if (!this.arr.includes(x)) { this.arr.push(x) }
  }
  delete(x) {
    let i = this.arr.indexOf(x)
    if (i >= 0) { this.arr.splice(i, 1) }
  }
  difference(other) {
    return (new Set(this.arr)).difference(new Set(other.arr))
  }
  [Symbol.iterator]() { return this.arr.values() }
}

////////////////////////////////////////////////////////////////////////
// API

export function Atom(value) {
  const r = new Reactor()
  r.latest = value
  const atom = () => r.observe()
  atom.set = (newValue) => {
    if (newValue === r.latest) { return }
    r.stale()
    r.latest = newValue
    r.fresh()
  }
  atom.peek = () => r.latest
  atom.dispose = r.dispose.bind(r)
  atom.label = (lbl) => ((r.label = lbl), atom)
  atom.reactor = r
  return atom
}

export function Calc(fn) {
  const r = new Reactor()
  r.needsCompute = true
  let isComputing = false
  r.compute = () => {
    if (isComputing) { throw new Error(`Cycle in ${r.label}`) }
    isComputing = true
    try {
      return fn()
    } finally {
      isComputing = false
    }
  }
  const calc = () => r.observe()
  calc.peek = () => r.latest
  calc.dispose = r.dispose.bind(r)
  calc.label = (lbl) => ((r.label = lbl), calc)
  calc.reactor = r
  return calc
}

export function Effect(action) {
  let effect = Calc(() => { action() })
  effect.reactor.recompute()
  return effect
}


////////////////////////////////////////////////////////////////////////
// Implementation

export class Reactor {
  static active = null

  label = undefined

  inputs = new jSet()
  outputs = new jSet()

  staleInputs = 0
  needsCompute = false

  latest = undefined
  compute = undefined

  observe() {
    let active = Reactor.active
    if (active) {
      this.outputs.add(active)
      active.inputs.add(this)
    }
    if (this.needsCompute || (this.staleInputs > 0)) {
      this.recompute()
    }
    return this.latest
  }

  stale() {
    if (++this.staleInputs == 1) {
      for (const o of this.outputs) { o.stale() }
    }
  }

  fresh(changed = true) {
    if (changed && this.compute) { this.needsCompute = true }
    this.staleInputs = Math.max(0, this.staleInputs - 1)
    if (this.staleInputs == 0) {
      if (this.compute && this.needsCompute) {
        changed = this.recompute()
      }
      for (const o of this.outputs) { o.fresh(changed) }
    }
  }

  recompute() {
    const oldActive = Reactor.active
    const oldLatest = this.latest
    const oldInputs = this.inputs
    this.inputs = new jSet()
    Reactor.active = this
    try {
      this.latest = this.compute()
    } catch(err) {
      this.latest = err
    } finally {
      Reactor.active = oldActive
      this.needsCompute = false
      this.staleInputs = 0
      for (const i of oldInputs.difference(this.inputs)) {
        i.outputs.delete(this)
      }
    }
    return this.latest != oldLatest
  }

  dispose() {
    for (const i of this.inputs) { i.outputs.delete(this) }
    for (const o of this.outputs) { o.inputs.delete(this) }
    this.inputs.clear()
    this.outputs.clear()
  }
}



////////////////////////////////////////////////////////////////////////
// Shims

if (Set.prototype.difference == null) {
  Set.prototype.difference = function(other) {
    const diff = new Set()
    for (let item of this)
      if (!other.has(item)) diff.add(item);
    return diff
  }
}




