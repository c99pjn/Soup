export declare function createElement<T extends ComponentProps = {}>(
  definitions: Soup.ComponentDefinition<T>,
  providedSlices?: Map<any, any>
): {
  getNode: () => HTMLElement
  removeNode: () => void
}
