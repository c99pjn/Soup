const applyProps = (props, el) => {
  const blackList = ["key", "ref", "fallback"];
  if (props.ref) props.ref.value = el;
  Object.entries(props).forEach(([p, v]) => {
    if (blackList.includes(p)) return;
    el[p] = v;
  });
};

const isComponent = (c) => Array.isArray(c) && c[3] === "soup_component";

const diff = (p, c, np, nc) => {
  if (Object.keys(p).length !== Object.keys(np).length) return true;
  if (c.length !== nc.length) return true;
  for (const key of Object.keys(p)) {
    if (isComponent(p[key]) && isComponent(np[key])) {
      if (diff(p[key][1], p[key][2], np[key][1], np[key][2])) return true;
    } else if (p[key] !== np[key]) return true;
  }
  for (let i = 0; i < c.length; i++) {
    if (c[i][0] !== nc[i][0]) return true;
    if (diff(c[i][1], c[i][2], nc[i][1], nc[i][2])) return true;
  }
  return false;
};

const diffDeps = (d1, d2) => {
  return d1.length !== d2.length || d1.some((d, i) => d !== d2[i]);
};

const initState = (_state, reload) => {
  let _sliceCnt = 0;

  const createSlice = (initial) => ({
    current: initial,
    listeners: new Set(),
    subscribe: function (fn) {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    },
  });

  _state.slice = (initial) => {
    if (!_state.slices[_sliceCnt]) {
      const init = typeof initial === "function" ? initial() : initial;
      _state.slices.push(createSlice(init));
    }
    const slice = _state.slices[_sliceCnt++];
    return {
      get value() {
        slice.listeners.add(reload);
        return slice.current;
      },
      set value(v) {
        if (v !== slice.current) {
          slice.current = v;
          slice.listeners.forEach((l) => {
            l(slice.current);
          });
        }
      },
    };
  };

  _state.ref = (initial) => {
    if (!_state.slices[_sliceCnt]) {
      _state.slices.push({ value: initial });
    }
    return _state.slices[_sliceCnt++];
  };

  _state.providedSlice = (fn) => {
    if (!_state.providedSlices.has(fn)) {
      _state.providedSlices.set(fn, createSlice(fn()));
    }
    const slice = _state.providedSlices.get(fn);

    return {
      get value() {
        slice.listeners.add(reload);
        return slice.current;
      },
      set value(v) {
        if (v !== slice.current) {
          slice.current = v;
          slice.listeners.forEach((l) => {
            l(slice.current);
          });
        }
      },
    };
  };

  const resetStateCnt = () => {
    _sliceCnt = 0;
  };

  const clearState = () => {
    _state.providedSlices.forEach((s) => s.listeners.delete(reload));
  };

  return [clearState, resetStateCnt];
};

const initMemo = () => {
  const _memos = new Map();
  let _memoCnt = 0;

  const memo = (fn, deps, key) => {
    const keyOrCnt = key ?? "memo" + _memoCnt++;
    const [_, cDeps] = _memos.get(keyOrCnt) ?? [, null];
    if (cDeps === null || !deps || diffDeps(deps, cDeps)) {
      _memos.set(keyOrCnt, [fn(), deps]);
    }
    return _memos.get(keyOrCnt)[0];
  };

  const resetMemoCnt = () => {
    _memoCnt = 0;
  };

  return [memo, resetMemoCnt];
};

const initEffect = () => {
  const _effects = new Map();
  let _effectCnt = 0;

  const effect = (fn, deps, key) => {
    const keyOrCnt = key ?? "effect" + _effectCnt++;
    const [, cDeps, , clean] = _effects.get(keyOrCnt) ?? [, null];
    const shouldRun = cDeps === null || !deps || diffDeps(deps, cDeps);
    _effects.set(keyOrCnt, [fn, deps, shouldRun, clean]);
  };

  const resetEffectCnt = () => {
    _effectCnt = 0;
  };

  const clearEffects = () => {
    for (const [, effect] of _effects) {
      effect[3]?.();
    }
  };

  const runEffects = () => {
    setTimeout(() => {
      for (const [, effect] of _effects) {
        if (effect[2]) {
          effect[3]?.();
          effect[3] = effect[0]();
        }
      }
    }, 0);
  };

  return [effect, resetEffectCnt, clearEffects, runEffects];
};

export const createElement = (definition, providedSlices = new Map()) => {
  let _state = { slices: [], providedSlices };
  let _rendered = {};
  let _node = null;
  let _children = new Map();
  let _childArray = [];

  let [component, props, childrenDefinitions] = definition;
  let _componentResult = null;

  let debounceRenderTimeoutId = 0;
  const debounceRender = (render) => {
    clearTimeout(debounceRenderTimeoutId);
    debounceRenderTimeoutId = setTimeout(() => {
      render();
    }, 0);
  };

  const reload = () => {
    debounceRender(() => render([component, props, childrenDefinitions], true));
  };

  const [memo, resetMemoCnt] = initMemo();
  const [effect, resetEffectCnt, clearEffects, runEffects] = initEffect();
  const [clearState, resetStateCnt] = initState(_state, reload);

  const runComponent = (...args) => {
    resetMemoCnt();
    resetEffectCnt();
    resetStateCnt();
    return component(...args);
  };

  const getNode = () => {
    return _node ?? _rendered.getNode();
  };

  const removeNode = () => {
    clearEffects();
    clearState();
    _childArray.forEach((child) => child.removeNode());
    if (_rendered.removeNode) {
      _rendered.removeNode();
    } else {
      _node.remove();
    }
  };

  const render = (newDefinition, force = false) => {
    const [_, newProps, newChildrenDefinitions] = newDefinition;
    if (
      !force &&
      !diff(props, childrenDefinitions, newProps, newChildrenDefinitions)
    ) {
      return;
    }

    if (typeof component === "string") {
      if (!_node) {
        _node =
          component === "text_node"
            ? document.createTextNode(props.text)
            : document.createElement(component, _state.providedSlices);
        applyProps(newProps, _node);
      } else {
        if (diff(props, [], newProps, [])) {
          applyProps(newProps, _node);
        }
      }

      const typeCounter = new Map();
      const newChildren = new Map();
      const childArray = [];

      newChildrenDefinitions.forEach((cc) => {
        const key = cc[1].key ?? cc[0];
        const cnt = typeCounter.get(key) ?? 0;
        typeCounter.set(key, cnt + 1);

        if (_children.get(key)?.[cnt]) {
          const child = _children.get(key)[cnt];
          child.render(cc);
          childArray.push(child);
          newChildren.set(key, [...(newChildren.get(key) ?? []), child]);
        } else {
          const child = createElement(cc, _state.providedSlices);
          childArray.push(child);
          newChildren.set(key, [...(newChildren.get(key) ?? []), child]);
        }
      });

      for (var i = 0; i < _childArray.length; i++) {
        const child = _childArray[i];
        if (
          !childArray.some((newChild) => newChild.getNode() === child.getNode())
        ) {
          child.removeNode();
          _childArray.splice(i--, 1);
        }
      }
      childArray.forEach((child, i) => {
        if (_childArray[i]?.getNode() !== child.getNode()) {
          if (i === 0) {
            _node.prepend(child.getNode());
          } else {
            _childArray[i - 1].getNode().after(child.getNode());
          }
          _childArray.splice(i, 0, child);
        }
      });

      _children = newChildren;
    } else {
      const componentResult = runComponent(newProps, {
        state: _state,
        memo,
        effect,
        children: newChildrenDefinitions,
      });
      const updateFn = (res) => {
        if (res === null) {
          removeNode();
        } else if (_rendered.render) {
          if (_componentResult[0] !== res[0]) {
            const newRendered = createElement(res, _state.providedSlices);
            _rendered.getNode().replaceWith(newRendered.getNode());
            _rendered.removeNode();
            _rendered = newRendered;
          } else {
            _rendered.render(res);
          }
        } else {
          _rendered = createElement(res, _state.providedSlices);
        }
        _componentResult = res;
      };

      if (componentResult?.then) {
        if (!_rendered.render) updateFn(newProps.fallback);
        componentResult.then((res) => {
          updateFn(res);
          runEffects();
        });
      } else {
        updateFn(componentResult);
        runEffects();
      }
    }

    props = newProps;
    childrenDefinitions = newChildrenDefinitions;
  };

  render(definition, true);
  return { getNode, removeNode, render };
};
