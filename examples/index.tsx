import { First } from "./First.js";
import { List } from "./List.js";
import { createElement } from "../soup.js";

const App = () => {
  return (
    <div>
      <First />
      <List />
    </div>
  );
};

const run = () => {
  const root = document.body;
  const { getNode } = createElement([App, {}, []]);
  root.appendChild(getNode());
};

onload = () => {
  run();
};
