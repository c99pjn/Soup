export const Button = ({ onClick }: { onClick: () => void }) => {
  return (
    <div id="hej" onclick={onClick}>
      <p>test</p>
      <p>test</p>
    </div>
  );
};

export const Container = () => {
  return <Button onClick={() => {}} />;
};
