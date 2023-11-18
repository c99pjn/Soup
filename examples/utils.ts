export const mouseOver = (
  component: Soup.ComponentInterface,
  ref: Soup.Ref<HTMLDivElement | null>
) => {
  const { memo, effect, state } = component
  const count = state.slice(0)
  const onMouseOver = memo(
    () => () => {
      count.value++
    },
    []
  )

  effect(() => {
    if (!ref.value) return () => {}
    const node = ref.value
    node.addEventListener('mouseover', onMouseOver)
    return () => {
      node.removeEventListener('mouseover', onMouseOver)
    }
  }, [onMouseOver])

  return count.value
}

export const sharedCounter = () => 0
