import { Page, Layout } from "@shopify/polaris";
import React, { useState, useCallback } from "react";
import PageContent from "../components/PageContent/PageContent";

function NewPage() {
  return (
    <Page
      backAction={{ content: "Pages", url: "/" }}
      title="Add Page"
      compactTitle
    >
      <Layout>
        <Layout.Section>
          <PageContent></PageContent>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default NewPage;
