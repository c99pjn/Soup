import { createElement } from "../../soup.js";

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

const run = () => {
  const root = document.body;
  const { getNode } = createElement([Counter, { title: "test" }, []]);
  root.appendChild(getNode());
};

onload = () => {
  run();
};
