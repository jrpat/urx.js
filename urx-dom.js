const mustache = /{{(.*?)}}/g

const components = {
  'for': () => {

  },
  'show': () => {

  }
}

export function Component(id) {
  let template = document.getElementById(id)
  const fns = []
  for (const node of elem.content.childNodes) {
    if (node instanceof CharacterData) { // text or comment
      fns.push()
    }
  }
}


//function Counter(props) {
//  const [x, setx] = createSignal(5)
//  const [arr, setarr] = createSignal([1,2,3])
//
//
//  return (
//    <>
//      <div>x = { x() }</div>
//      <input name={x()} />
//      <Show if="x() > 5">
//        x is high!
//      </Show>
//      <ul>
//        <For each={arr()}>
//          {(item) => <li>{item}</li>}
//        </For>
//      </ul>
//      <button disabled={x() > 10}>click me</button>
//    </>
//  );
//}
var _tmpl$  = /*#__PURE__*/_$template(`<div>x = `),
    _tmpl$2 = /*#__PURE__*/_$template(`<input>`),
    _tmpl$3 = /*#__PURE__*/_$template(`<ul>`),
    _tmpl$4 = /*#__PURE__*/_$template(`<button>click me`),
    _tmpl$5 = /*#__PURE__*/_$template(`<li>`);
function Counter(props) {
  const [x, setx] = createSignal(5);
  const [arr, setarr] = createSignal([1, 2, 3]);
  return [
    (() => {
      var _el$ = _tmpl$(),
        _el$2 = _el$.firstChild;
      _$insert(_el$, x, null);
      return _el$;
    })(),
    (() => {
      var _el$3 = _tmpl$2();
      _$effect(() => _$setAttribute(_el$3, "name", x()));
      return _el$3;
    })(),
    _$createComponent(Show, {
      get when() {
        return x() > 5
      }
      children: "x is high!"
    }),
    (() => {
      var _el$4 = _tmpl$3();
      _$insert(_el$4, _$createComponent(For, {
        get each() {
          return arr();
        },
        children: item => (() => {
          var _el$6 = _tmpl$5();
          _$insert(_el$6, item);
          return _el$6;
        })()
      }));
      return _el$4;
    })(),
    (() => {
      var _el$5 = _tmpl$4();
      _$effect(() => _el$5.disabled = x() > 10);
      return _el$5;
    })()
  ];
}
