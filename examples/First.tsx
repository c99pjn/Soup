import { sharedCounter } from "./utils.js";

const Button: Soup.Component<{
  onClick: () => void;
  count: number;
}> = (props) => {
  return (
    <div>
      <button style="width: 200px" onclick={props.onClick}>
        <span>button </span>
        {props.count ?? 0}
      </button>
    </div>
  );
};

const Par: Soup.Component = (_, { state, memo, effect }) => {
  const sharedCount = state.providedSlice(sharedCounter);

  const onClick = memo(
    () => () => {
      sharedCount.value++;
    },
    []
  );

  return <Button onClick={onClick} count={sharedCount.value} />;
};

const Para: Soup.Component = (_, comp) => {
  comp.effect(() => {
    //console.log("effect");
    return () => {
      //console.log("clean");
    };
  }, []);

  return <div>{comp.children}</div>;
};

const Fallback: Soup.Component = () => <p>...loading</p>;

const Async2: Soup.AsyncComponent<{ count: Soup.Slice<number> }> = async (
  { count },
  { memo }
) => {
  const data = await memo(
    async () =>
      fetch("https://jsonplaceholder.typicode.com/photos").then((res) =>
        res.json()
      ),
    []
  );

  return <p>{data[count.value].title}</p>;
};

const Async: Soup.AsyncComponent = async (_, { memo, state }) => {
  const sharedCount = state.providedSlice(sharedCounter);

  await memo(
    async () => await new Promise((res) => setTimeout(() => res(""), 1000)),
    []
  );

  return <p>{sharedCount.value}</p>;
};

export const First: Soup.Component = (_, { state, memo }) => {
  const count = state.slice(0);
  state.providedSlice(sharedCounter);

  const onClick = memo(
    () => () => {
      count.value++;
    },
    []
  );

  if (count.value === 5) {
    return <p>Swapped</p>;
  }

  return (
    <div>
      {...Array.from({ length: count.value }).map((_, i) => (
        <Par key={`add${i}`} />
      ))}
      <Button onClick={onClick} count={count.value} />
      {...Array.from({ length: 5 - count.value }).map((_, i) => (
        <Para key={`remove${i}`}>
          <span>remove</span>
        </Para>
      ))}
      <Async2 fallback={<Fallback />} count={count} />
      {count.value !== 3 ? <Async fallback={<Fallback />} /> : null}
      <div>last</div>
    </div>
  );
};
