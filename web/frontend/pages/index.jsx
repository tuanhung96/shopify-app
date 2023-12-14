import { Page, Layout } from "@shopify/polaris";
import Tabs from "../components/Tabs/Tabs";

export default function HomePage() {
  return (
    <Page
      fullWidth
      title="Pages"
      primaryAction={{ content: "Add Page", url: "/new", destructive: true }}
    >
      <Layout>
        <Layout.Section>
          <Tabs />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
