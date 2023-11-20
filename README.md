# Soup
Reactive UI library for fun.
- JSX compiled through typescript
- Recognisable concepts such as memo, effects, state and refs
- Components only re-render when props change, or any children props change (always memo)
- Signals like state slices, automatic re-rendering when value is changed
- State sliced can be passed as props, re-rending any component, on change, reading the value
- Shared state slices that are automatically provided in the sub component tree
- Async components that render fallback until resolved

## Simple example component
Each component is called with two arguments
1. An object of properties passed by the component rendering it. The type type of this object is the generic of `Soup.Component<Props>`
2. An object with component instance functions, state and children
   1. state - the state object, more on this later
   2. memo - function to create stable references based on dependencies
   3. effect - function to run effects after the component has been rendered
   4. children - array of children rendered under this component by the parent component

```jsx
export const Counter: Soup.Component<{ title: string }> = (
  { title },
  { state }
) => {
  const counter = state.slice(0);

  const onClick = (delta: number) => {
    counter.value += delta;
  };

  return (
    <div>
      <button onclick={() => onClick(1)}>Increase</button>
      <button onclick={() => onClick(-1)}>Decrease</button>
      <p>{`${title} ${counter.value}`}</p>
    </div>
  );
};
```
## State
The state object is passed to each component and has the following signature
```ts
type State = {
    ref: <T>(initial: T) => Ref<T>
    slice: <T>(initial: T | (() => T)) => Slice<T>
    providedSlice: <T>(fn: () => T) => Slice<T>
  }
```
### state.ref()
```ts
 type Ref<T> = { value: T }
```
```ts
const ref = state.ref<number>(0);
ref.value++;
```
Similar to react refs, a ref can be passed to any component using the special `ref` prop. This will set the ref value to the rendered dom node. Refs can also be used as a stable data container, persisting across renders.

```jsx
const Component: Soup.Component = (_, { state }) => {
  const ref = state.ref<HTMLDivElement | null>(null);
  return <div ref={ref} />
}
```

### state.slice()
```ts
type Slice<T> = {
    value: T
    subscribe: (fn: (value: T) => void) => Cancellable
  }
```
```ts
const counter = state.slice<number>(0);
```
Slice creates a slice of state which functions similar to signals in Preact. Any component that reads a value of a slice will re-render whenever the value is changed. If you just want to keep the slice local you only pass its value instead of the slice itself.

```jsx
// Just pass value to child.
<ChildComponent value={counter.value} />
```
```jsx
// Pass the slice, ChildComponent will only re-render if it reads the value of the slice
<ChildComponent counter={counter} />
```
You can also explicitly subscribe to the value of the slice in case you want to react without re-rendering the component or if you need to subscribe outside Soup.

### state.providedSlice()
Similarly to state.slice() if will create a slice, but it will be automatically provided to all children. If a provided slice already exists (is provided by a parent), it will instead return that slice.
```ts
export const sharedCounter = () => 0
```
```ts
const counter = state.providedSlice(sharedCounter);
```
In order to identify the slice it needs a stable reference, similar to react contexts.

Only the children that actually read the value of the slice will re-render whenever it is changed.

```jsx
const sharedCounter = () => 0

const Child: Soup.Component = (_, { state }) => {
  const slice = state.providedSlice(sharedCounter);
  return <span>{slice.value}</span>
}

const Parent: Soup.Component = (_, { state }) => {
  const slice = state.providedSlice(sharedCounter);
  return (
    <div>
      <button onclick={() => slice.value++} />
      <Child />
    </div>
  );
}
```

## memo
```ts
type Memo = <T>(fn: () => T, deps: Dependencies) => T
```
A function that memoizes a value to create stable references. This can either be an expensive calculation or something to pass as a prop that you don't want to re-create every render.
```ts
// Memoize an expensive calculation
const value = memo(() => somethingExpensive(), []);
```
```ts
// Memoize a callback
const callback = memo(() => () => {}, []);
```
The last argument is the dependency array. The memoization will only re-compute when any of the entries in this array is changed.
```ts
// Re-compute when input changes
const value = memo(() => somethingExpensive(input), [input]);
```

## effect
```ts
type Effect = (fn: () => Cancellable | void, deps?: Dependencies) => void
```
Similar to useEffect in React. After a component is rendered any effects will run.
```ts
effect(() => {
  document.title = "Component rendered";
}, []);
```
A cleanup function can also be returned that will run before running the effect.
```jsx
const Component: Soup.Component = (_, { state }) => {
  const ref = state.ref<HTMLDivElement | null>(null);

  effect(() => {
    const onClick = () => { console.log('click) };
    ref.addEventListener('click', onClick);
    return () => {
      ref.removeEventListener('click', onClick)
    }
  }, []);

  return <div ref={ref} />
}
```

# Async components
```ts
type AsyncComponent<T extends ComponentProps = {}> = (
  props: T & { fallback: Component; key?: string },
  comp: ComponentInterface
) => Promise<ComponentDefinition | null>
```
A component can also be `async`. Such a component must be rendered with a `fallback` that is rendered until the async component resolves.
```jsx
const Async: Soup.AsyncComponent = async (_, { memo }) => {
  await memo(
    async () => await new Promise((res) => setTimeout(() => res(""), 1000)),
    []
  );
  return <p>Async</p>;
};

const Parent: Soup.Component = () => {
  return <Async fallback={ <Spinner /> } />
}
```
