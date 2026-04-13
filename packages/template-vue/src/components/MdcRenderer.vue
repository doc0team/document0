<script lang="ts">
import { defineComponent, h, type PropType, type Component } from "vue";

export interface MdcNode {
  type: "element" | "text";
  tag?: string;
  props?: Record<string, unknown>;
  children?: MdcNode[];
  value?: string;
}

export interface MdcRoot {
  type: "root";
  children: MdcNode[];
}

const VOID_ELEMENTS = new Set(["hr", "br", "img", "input", "meta", "link"]);

function normalizeProps(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "className") {
      out.class = Array.isArray(value) ? value.join(" ") : value;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function renderNode(
  node: MdcNode,
  components: Record<string, Component>,
): any {
  if (node.type === "text") {
    return node.value ?? "";
  }

  if (node.type === "element") {
    const tag = node.tag || "div";
    const props = node.props ? normalizeProps(node.props) : {};
    const children = node.children?.map((child) => renderNode(child, components)) ?? [];

    const component = components[tag];
    if (component) {
      return h(component, props, { default: () => children });
    }

    if (VOID_ELEMENTS.has(tag)) {
      return h(tag, props);
    }

    return h(tag, props, children);
  }

  return null;
}

export default defineComponent({
  name: "MdcRenderer",
  props: {
    body: {
      type: Object as PropType<MdcRoot>,
      required: true,
    },
    components: {
      type: Object as PropType<Record<string, Component>>,
      default: () => ({}),
    },
    tag: {
      type: String,
      default: "div",
    },
  },
  render() {
    if (!this.body?.children) return null;
    const nodes = this.body.children
      .map((node: MdcNode) => renderNode(node, this.components))
      .filter(Boolean);
    return h(this.tag, { class: "mdc-content" }, nodes);
  },
});
</script>
