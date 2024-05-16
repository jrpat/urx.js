import {expect} from 'https://unpkg.com/chai@5.1.0/chai.js'
const E = console.error.bind(console); E.n = 0
function test(name, f) {try{f()}catch(e){++E.n;E(`✘ ${name}`,e)}}
function notest(){}

////////////////////////////////////////////////////////////////////////

import {atom, calc, effect, batch} from '/lib/urx.js'

test('Plain', () => {
  let out = []
  let a1 = atom('old')
  let c1 = calc(() => a1.value + '!')
  let e1 = effect(() => { out.push(c1.value) })
  a1.value = 'new'
  expect(out).to.deep.equal(['old!', 'new!'])
})

test('Chain', () => {
  let out = []
  let a1 = atom('foo')
  let c1 = calc(() => a1.value + '.')
  let c2 = calc(() => c1.value + '.')
  let c3 = calc(() => c2.value + '.')
  let e1 = effect(() => { out.push(c3.value) })
  a1.value = 'bar'
  a1.value = 'baz'
  expect(out).to.deep.equal(['foo...', 'bar...', 'baz...'])
})

test('Cycle Static Direct', () => {
  let out = []
  let a1 = atom('old')
  let c1 = calc(() => (a1.value == 'old') ? c1.value : 'ok')
  let e1 = effect(() => { out.push(c1.value) })
  a1.value = 'new'
  expect(out[0]).to.be.an('error')
  expect(out[0].message).to.match(/^Cycle detected/)
  expect(out[1]).to.equal('ok')
})

test('Cycle Static Indirect', () => {
  let out = []
  let a1 = atom('old')
  let c1 = calc(() => (a1.value == 'old') ? c2.value : 'ok')
  let c2 = calc(() => c3.value)
  let c3 = calc(() => c1.value)
  let e1 = effect(() => out.push(c1.value))
  a1.value = 'new'
  expect(out[0]).to.be.an('error')
  expect(out[0].message).to.match(/^Cycle detected/)
  expect(out[1]).to.equal('ok')
})

test('Cycle Dynamic', () => {
  let out = []
  let a1 = atom('old')
  let c1 = calc(() => `${a1.value}!`)
  let c2 = calc(() => (a1.value == 'new') ? c3.value : 'ok')
  let c3 = calc(() => `${c2.value}x`)
  let e1 = effect(() => { out.push(c2.value) })
  a1.value = 'new'
  a1.value = 'foo'
  expect(out[0])
  expect(out[0]).to.equal('ok')
  expect(out[1]).to.be.an('error')
  expect(out[1].message).to.match(/^Cycle detected/)
  expect(out[2]).to.equal('ok')
})

test('Cycle Spreadsheet', () => {
  const out = []
  const formulas = {}
  const results = {}
  const evalCell = (formula) => {
    return (new Function('env', `return ${formula}`))(results)
  }
  formulas.a1 = atom('env.b1.value').label('a1.formula')
  formulas.b1 = atom('env.c1.value').label('b1.formula')
  formulas.c1 = atom('').label('c1.formula')
  results.a1 = calc(() => evalCell(formulas.a1.value)).label('a1.result')
  results.b1 = calc(() => evalCell(formulas.b1.value)).label('b1.result')
  results.c1 = calc(() => evalCell(formulas.c1.value)).label('c1.result')
  effect(() => 
    out.push(
      results.c1.value
    )).label('log')
  formulas.c1.value = 'env.a1.value'
  expect(out).to.have.lengthOf(2)
  expect(out[0]).to.equal(undefined)
  expect(out[1]).to.be.an('Error')
  expect(out[1].message).to.match(/^Cycle detected/)
})

test('Batch', () => {
  const out = []
  const a1 = atom(1)
  const a2 = atom(2)
  const a3 = atom(3)
  effect(() => out.push(`${a1.value},${a2.value},${a3.value}`))
  batch(() => {
    a1.value = 9
    a2.value = 9
    a3.value = 9
  })
  expect(out).to.have.lengthOf(2)
  expect(out[0]).to.equal('1,2,3')
  expect(out[1]).to.equal('9,9,9')
})


////////////////////////////////////////////////////////////////////////

if (E.n == 0) { console.log('✔ PASS') }

