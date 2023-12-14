import { Page, Layout } from "@shopify/polaris";
import { ExternalMinor, DuplicateMinor } from "@shopify/polaris-icons";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import PageContent from "../components/PageContent/PageContent";
import { useAppQuery } from "../hooks";
function PageDetail() {
  const [page, setPage] = useState(null);
  const { id } = useParams();

  // Get page by id
  const { data, refetch } = useAppQuery({
    url: `/api/pages?id=${id}`,
    reactQueryOptions: {
      onSuccess: (res) => {
        setPage(res);
      },
      onError: (error) => {
        console.log(error);
      },
    },
  });

  return (
    <Page
      backAction={{ content: "Pages", url: "/" }}
      title={page?.title}
      compactTitle
      secondaryActions={[
        {
          content: "View Page",
          external: true,
          icon: ExternalMinor,
          url: `https://hungstore21.myshopify.com/pages/${page?.handle}`,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <PageContent pageData={page} refetch={refetch}></PageContent>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default PageDetail;
