export const jsx = (comp, props, key) => {
  //console.log(JSON.stringify([comp, props, key]));
  let c = [];
  if ("children" in props) {
    c = Array.isArray(props.children[0]) ? props.children : [props.children];
    delete props.children;
  }
  props.key = key;
  c = c
    .filter((v) => v !== null)
    .map((v) =>
      Array.isArray(v)
        ? v
        : ["text_node", { textContent: v }, [], "soup_component"]
    );
  return [
    comp,
    props !== null && props !== void 0 ? props : {},
    c,
    "soup_component",
  ];
};

export const jsxs = (...args) => {
  return jsx(...args);
};
