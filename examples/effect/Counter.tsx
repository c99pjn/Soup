import { createElement } from "../../soup.js";

export const CounterAsTitle: Soup.Component = (_, { state, effect }) => {
  const counter = state.slice(0);

  const onClick = (delta: number) => {
    counter.value += delta;
  };

  effect(() => {
    document.title = `Clicked ${counter.value} times`;
  });

  return (
    <div>
      <button onclick={() => onClick(1)}>Increase</button>
      <button onclick={() => onClick(-1)}>Decrease</button>
    </div>
  );
};

const run = () => {
  const root = document.body;
  const { getNode } = createElement([CounterAsTitle, {}, []]);
  root.appendChild(getNode());
};

onload = () => {
  run();
};
