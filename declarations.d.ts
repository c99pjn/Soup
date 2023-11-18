declare namespace Soup {
  type Component<T extends ComponentProps = {}> = (
    props: T & { key?: string },
    comp: ComponentInterface
  ) => ComponentDefinition | null

  type AsyncComponent<T extends ComponentProps = {}> = (
    props: T & { fallback: Component; key?: string },
    comp: ComponentInterface
  ) => Promise<ComponentDefinition | null>

  type Cancellable = () => void
  type Dependencies = Array<any>

  type Memo = <T>(fn: () => T, deps: Dependencies) => T
  type Effect = (fn: () => Cancellable | void, deps?: Dependencies) => void
  type Reload = () => void

  type Ref<T> = { __type: 'ref'; value: T }
  type Slice<T> = {
    __type: 'slice'
    value: T
    subscribe: (fn: (value: T) => void) => Cancellable
  }

  type State = {
    ref: <T>(initial: T) => Ref<T>
    slice: <T>(initial: T | (() => T)) => Slice<T>
    providedSlice: <T>(fn: () => T) => Slice<T>
  }

  type ComponentProps = { [key: string]: any }
  type ComponentInterface = {
    state: State
    memo: Memo
    effect: Effect
    children: Array<ComponentDefinition>
  }

  type ComponentDefinition = [
    Component | AsyncComponent | string,
    ComponentProps,
    Array<ComponentDefinition>
  ]
}

declare namespace JSX {
  //type Element = Soup.ComponentDefinition
  interface IntrinsicElements extends IntrinsicElementMap {}

  interface IntrinsicProps<K> {
    ref?: Soup.Ref<K | null>
    [key: string]: any
  }

  type IntrinsicElementMap = {
    [K in keyof HTMLElementTagNameMap]: IntrinsicProps<HTMLElementTagNameMap[K]>
  }
}

/*
[K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]> & {
  ref?: { current: any }
}
*/
