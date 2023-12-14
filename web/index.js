// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

////////////////////
app.get("/api/pages", async (_req, res) => {
  const id = _req.query.id;
  if (id) {
    const page = await shopify.api.rest.Page.find({
      session: res.locals.shopify.session,
      // @ts-ignore
      id: id,
    });
    res.status(200).send(page);
  } else {
    const pages = await shopify.api.rest.Page.all({
      session: res.locals.shopify.session,
    });
    res.status(200).send(pages);
  }
});

app.post("/api/pages", async (_req, res) => {
  console.log("oke");
  const { page } = _req.body;

  const newPage = new shopify.api.rest.Page({
    session: res.locals.shopify.session,
  });

  newPage.title = page?.title;
  newPage.body_html = page?.body_html;
  newPage.published = page?.published;

  await newPage.save({ update: true });
  res.status(200).send(newPage);
});

app.put("/api/pages", async (_req, res) => {
  // @ts-ignore
  const ids = _req.query.id.split(",");
  const { published, page } = _req.body;

  if (ids) {
    if (page && ids.length === 1) {
      const updatePage = new shopify.api.rest.Page({
        session: res.locals.shopify.session,
      });

      updatePage.id = ids[0];
      updatePage.title = page?.title;
      updatePage.published = page?.published;
      updatePage.body_html = page?.body_html;

      await updatePage.save({ update: true });

      res.status(200).send(updatePage);
    } else {
      const updatingPagePromises = ids.map(async (id) => {
        const page = new shopify.api.rest.Page({
          session: res.locals.shopify.session,
        });
        page.id = id;
        page.published = published;
        return await page.save({
          update: true,
        });
      });
      const pages = await Promise.all(updatingPagePromises);
      res.status(200).send(pages);
    }
  }
});

app.delete("/api/pages", async (_req, res) => {
  // @ts-ignore
  const ids = _req.query.id.split(",");
  const deletingPagePromises = ids.map(
    async (id) =>
      await shopify.api.rest.Page.delete({
        session: res.locals.shopify.session,
        id: id,
      })
  );
  const pages = await Promise.all(deletingPagePromises);
  res.status(200).send(pages);
});

////////////////////
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
