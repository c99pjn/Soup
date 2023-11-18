import { createElement } from "../../soup.js";

export const Counter: Soup.Component = (_, { state }) => {
  const counter = state.slice(0);

  const onClick = (delta: number) => {
    counter.value += delta;
  };

  return (
    <div>
      <button onclick={() => onClick(1)}>Increase</button>
      <button onclick={() => onClick(-1)}>Decrease</button>
      <p>{counter.value}</p>
    </div>
  );
};

const run = () => {
  const root = document.body;
  const { getNode } = createElement([Counter, {}, []]);
  root.appendChild(getNode());
};

onload = () => {
  run();
};
