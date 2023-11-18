export declare function createElement(
  definitions: Soup.ComponentDefinition,
  providedSlices?: Map<any, any>
): {
  getNode: () => HTMLElement
  removeNode: () => void
}
