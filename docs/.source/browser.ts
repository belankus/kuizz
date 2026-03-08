// @ts-nocheck
import { browser } from "fumadocs-mdx/runtime/browser";
import type * as Config from "../source.config";

const create = browser<
  typeof Config,
  import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
    DocData: {};
  }
>();
const browserCollections = {
  docs: create.doc("docs", {
    "index.mdx": () => import("../content/docs/index.mdx?collection=docs"),
    "core/analytics.mdx": () =>
      import("../content/docs/core/analytics.mdx?collection=docs"),
    "core/collections.mdx": () =>
      import("../content/docs/core/collections.mdx?collection=docs"),
    "core/creating-quiz.mdx": () =>
      import("../content/docs/core/creating-quiz.mdx?collection=docs"),
    "developer/api-overview.mdx": () =>
      import("../content/docs/developer/api-overview.mdx?collection=docs"),
    "developer/authentication.mdx": () =>
      import("../content/docs/developer/authentication.mdx?collection=docs"),
    "developer/webhooks.mdx": () =>
      import("../content/docs/developer/webhooks.mdx?collection=docs"),
    "game/join.mdx": () =>
      import("../content/docs/game/join.mdx?collection=docs"),
    "getting-started/first-quiz.mdx": () =>
      import("../content/docs/getting-started/first-quiz.mdx?collection=docs"),
    "getting-started/installation.mdx": () =>
      import("../content/docs/getting-started/installation.mdx?collection=docs"),
    "support/faq.mdx": () =>
      import("../content/docs/support/faq.mdx?collection=docs"),
    "support/troubleshooting.mdx": () =>
      import("../content/docs/support/troubleshooting.mdx?collection=docs"),
  }),
};
export default browserCollections;
