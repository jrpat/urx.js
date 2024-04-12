function it(desc, fn) {
}


it('should not detect a cycle when a new input is stale', () => {

  let a1 = Atom('old').label('a1')

  let c10 = Calc(() => a1() + '!').label('c1-0')

  // When a1 becomes 'new', this will begin depending on c30,
  // which will still be stale
  let c20 = Calc(() => {
    return (a1() == 'old')
      ? `c20 - [${c10()}]`
      : `c20 - [${c10()}+${c30()}]`
  }).label('c2-0')

  let c21 = Calc(() => `c21 - ${c10()}`).label('c2-1')

  let c30 = Calc(() => `c30 - [${a1()}${c21()}]`).label('c3-0')

  Effect(() => log(`= ${c20()}`)).label('log')

  a1.set('new')
})

