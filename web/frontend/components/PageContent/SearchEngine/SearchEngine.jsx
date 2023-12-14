import { LegacyCard, TextField, VerticalStack } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { convertHtmlToText } from "../../../utils/convertHtmlToText";
import { convertStringToUrl } from "../../../utils/convertStringToUrl";

function SearchEngine({ title, body }) {
  const [showEdit, setShowEdit] = useState(false);
  const [titleSEO, setTitleSEO] = useState("");
  const [bodySEO, setBodySEO] = useState("");
  const [urlSEO, setUrlSEO] = useState("");

  const handleChangeTitleSEO = useCallback((value) => {
    setTitleSEO(value);
  }, []);

  const handleChangeBodySEO = useCallback((value) => {
    setBodySEO(value);
  }, []);

  const handleChangeUrlSEO = useCallback((value) => {
    setUrlSEO(value);
  });

  const bodyText = convertHtmlToText(body);

  return (
    <LegacyCard
      sectioned
      title="Search engine listing preview"
      actions={[
        !showEdit && {
          content: "Edit website SEO",
          onAction: () => setShowEdit(true),
        },
      ]}
    >
      <div style={{ paddingBottom: 16 }}>
        {(!title.trim() && !titleSEO.trim()) ||
        (!bodyText.trim() && !bodySEO.trim()) ? (
          `Add
				${!title.trim() && !titleSEO.trim() ? " title " : " description "}
				to see how this Page might appear in a search engine listing`
        ) : (
          <VerticalStack>
            <p style={{ fontSize: "20px", color: "#1a0dab" }}>
              {titleSEO || title}
            </p>
            <p style={{ color: "#006621" }}>
              {"https://hungstore21.myshopify.com/pages/" +
                (urlSEO || convertStringToUrl(title))}
            </p>
            <p>{bodySEO || bodyText}</p>
          </VerticalStack>
        )}
      </div>

      {showEdit && (
        <VerticalStack gap="4">
          <TextField
            label="Page title"
            value={titleSEO}
            onChange={handleChangeTitleSEO}
            placeholder={title}
            helpText={titleSEO.length + " of 70 characters used"}
          />
          <TextField
            label="Description"
            value={bodySEO || bodyText}
            onChange={handleChangeBodySEO}
            helpText={bodySEO.length + " of 320 characters used"}
          />
          <TextField
            label="URL and handle"
            prefix="https://hungstore21.myshopify.com/pages/"
            value={urlSEO}
            onChange={handleChangeUrlSEO}
            placeholder={convertStringToUrl(title)}
          />
        </VerticalStack>
      )}
    </LegacyCard>
  );
}

export default SearchEngine;
