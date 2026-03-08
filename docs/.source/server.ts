// @ts-nocheck
import { default as __fd_glob_17 } from "../content/docs/support/meta.json?collection=docs";
import { default as __fd_glob_16 } from "../content/docs/getting-started/meta.json?collection=docs";
import { default as __fd_glob_15 } from "../content/docs/game/meta.json?collection=docs";
import { default as __fd_glob_14 } from "../content/docs/developer/meta.json?collection=docs";
import { default as __fd_glob_13 } from "../content/docs/core/meta.json?collection=docs";
import { default as __fd_glob_12 } from "../content/docs/meta.json?collection=docs";
import * as __fd_glob_11 from "../content/docs/support/troubleshooting.mdx?collection=docs";
import * as __fd_glob_10 from "../content/docs/support/faq.mdx?collection=docs";
import * as __fd_glob_9 from "../content/docs/getting-started/installation.mdx?collection=docs";
import * as __fd_glob_8 from "../content/docs/getting-started/first-quiz.mdx?collection=docs";
import * as __fd_glob_7 from "../content/docs/game/join.mdx?collection=docs";
import * as __fd_glob_6 from "../content/docs/developer/webhooks.mdx?collection=docs";
import * as __fd_glob_5 from "../content/docs/developer/authentication.mdx?collection=docs";
import * as __fd_glob_4 from "../content/docs/developer/api-overview.mdx?collection=docs";
import * as __fd_glob_3 from "../content/docs/core/creating-quiz.mdx?collection=docs";
import * as __fd_glob_2 from "../content/docs/core/collections.mdx?collection=docs";
import * as __fd_glob_1 from "../content/docs/core/analytics.mdx?collection=docs";
import * as __fd_glob_0 from "../content/docs/index.mdx?collection=docs";
import { server } from "fumadocs-mdx/runtime/server";
import type * as Config from "../source.config";

const create = server<
  typeof Config,
  import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
    DocData: {};
  }
>({ doc: { passthroughs: ["extractedReferences"] } });

export const docs = await create.docs(
  "docs",
  "content/docs",
  {
    "meta.json": __fd_glob_12,
    "core/meta.json": __fd_glob_13,
    "developer/meta.json": __fd_glob_14,
    "game/meta.json": __fd_glob_15,
    "getting-started/meta.json": __fd_glob_16,
    "support/meta.json": __fd_glob_17,
  },
  {
    "index.mdx": __fd_glob_0,
    "core/analytics.mdx": __fd_glob_1,
    "core/collections.mdx": __fd_glob_2,
    "core/creating-quiz.mdx": __fd_glob_3,
    "developer/api-overview.mdx": __fd_glob_4,
    "developer/authentication.mdx": __fd_glob_5,
    "developer/webhooks.mdx": __fd_glob_6,
    "game/join.mdx": __fd_glob_7,
    "getting-started/first-quiz.mdx": __fd_glob_8,
    "getting-started/installation.mdx": __fd_glob_9,
    "support/faq.mdx": __fd_glob_10,
    "support/troubleshooting.mdx": __fd_glob_11,
  },
);
