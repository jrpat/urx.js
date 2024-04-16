////////////////////////////////////////////////////////////////////////
// API

export const atom = x =>
  Object.assign((new Atom), {_latest: x, _label: Atom.label()})

export const calc = f =>
  Object.assign((new Calc), {_compute: f, _label: Calc.label()})

export const effect = f => {
  const e = new Effect()
  e._compute = () => { f() }
  e._label = Effect.label()
  e._refresh()
  e._version = 1
  return e
}

export const batch = f => { Effect.batch(1) ; f() ; Effect.batch(-1) }


////////////////////////////////////////////////////////////////////////
// Implementation

export class Atom {
  _label = undefined
  _latest = undefined
  _outputs = new Set()
  _version = 0

  get value() {
    Calc.active?._observe(this)
    return this._latest
  }
  set value(v) {
    if (v === this._latest) { return }
    Effect.batch(1)
    this._stale()
    this._latest = v
    this._version++
    Effect.batch(-1)
  }

  peek() { return this._latest }
  label(l) { return (this._label = l), this }
  _stale() { for (const o of this._outputs) { o._stale() } }
  _refresh() { return this._version }
  
  dispose() {
    for (const o of this._outputs) { o._inputs.delete(this) }
    this._outputs.clear()
  }
}


export class Calc extends Atom {
  static active = null

  _inputs = new Map()
  _compute = undefined
  _isRunning = false
  _isStale = false

  get value() {
    this._refresh()
    Calc.active?._observe(this)
    if (this._isRunning) {
      throw Error('Cycle detected in ' + this._label)
    }
    return this._latest
  }

  _observe(input) {
    this._inputs.set(input, input._version)
    input._outputs.add(this)
  }

  _refresh() {
    if (this._isRunning) { return ++this._version } // cycle
    if (this._mustRecompute()) {
      const oldLatest = this._latest
      const oldInputs = this._inputs
      const oldActive = Calc.active
      this._inputs = new Map()
      this._isRunning = true
      Calc.active = this
      try {
        this._latest = this._compute()
      } catch (err) {
        this._latest = err
      }
      Calc.active = oldActive
      this._isStale = false
      this._isRunning = false
      if (this._latest !== oldLatest) { ++this._version }
      for (const [i] of oldInputs) {
        if (!this._inputs.has(i)) { i._outputs.delete(this) }
      }
    }
    return this._version
  }

  _stale() {
    if (this._isStale) { return } // cycle
    this._isStale = true
    super._stale()
  }

  _mustRecompute() {
    if (this._version == 0) { return true }
    if (!this._isStale) { return false }
    for (const [i, v] of this._inputs) {
      if (i._refresh() > v) { return true }
    }
    return false
  }

  dispose() {
    super.dispose()
    for (const i of this._inputs) { i._outputs.delete(this) }
    this._inputs.clear()
  }
}

export class Effect extends Calc {
  static _batch = new Set()
  static _depth = 0

  static batch(n) {
    Effect._depth += n
    if (Effect._depth < 0) { Effect._depth = 0; return }
    if (Effect._depth == 0) {
      for (const e of Effect._batch) { e._refresh() }
      Effect._batch.clear()
    }
  }

  _stale() {
    Effect._batch.add(this)
    this._isStale = true
  }
}

Atom.label = (n => () => `A${++n}`)(0)
Calc.label = (n => () => `C${++n}`)(0)
Effect.label = (n => () => `E${++n}`)(0)

