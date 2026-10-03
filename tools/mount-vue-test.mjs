import { createRenderer } from "vue";

// A small Vue host for interaction tests that do not require browser layout.
export function mountView(vnode) {
  const root = { children: [] };
  const renderer = createRenderer({
    createElement: (tag) => ({ tag, props: {}, children: [] }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ comment: text }),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.children = [{ text }];
    },
    patchProp: (node, key, previous, next) => {
      node.props[key] = next;
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) =>
      node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
    insert(node, parent, anchor = null) {
      if (node.parent)
        node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      if (index < 0) parent.children.push(node);
      else parent.children.splice(index, 0, node);
    },
    remove(node) {
      node.parent?.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = null;
    },
  });
  renderer.render(vnode, root);
  function findAll(predicate, node = root) {
    return [
      ...(predicate(node) ? [node] : []),
      ...(node.children || []).flatMap((child) => findAll(predicate, child)),
    ];
  }
  return { root, findAll, unmount: () => renderer.render(null, root) };
}
