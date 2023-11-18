import { mouseOver } from "./utils.js";

const Row: Soup.Component<{ index: number }> = (props, component) => {
  const { state } = component;
  const ref = state.ref<HTMLDivElement | null>(null);
  const count = mouseOver(component, ref);

  if (count > 3) return null;

  return <div ref={ref} className="row">{`${props.index}`}</div>;
};

export const List: Soup.Component = () => {
  return (
    <div className="list">
      {...Array.from({ length: 100 }).map((_, i) => (
        <Row key={`row${i}`} index={i} />
      ))}
    </div>
  );
};
