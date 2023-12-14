import React, { useState, useCallback } from "react";
import { LegacyCard, Button, Select } from "@shopify/polaris";
function OnlineStore() {
  const [selected, setSelected] = useState("default");

  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const options = [
    { label: "Contact", value: "contact" },
    { label: "Default page", value: "default" },
  ];
  return (
    <LegacyCard title="Online store" sectioned>
      <Select
        label="Theme template"
        options={options}
        onChange={handleSelectChange}
        value={selected}
      />
      <p style={{ paddingTop: 16, paddingBottom: 16 }}>
        Assign a template from your current theme to define how the page is
        displayed.
      </p>
      {/* <Button plain onClick={() => {}}>
        Customize template
      </Button> */}
    </LegacyCard>
  );
}

export default OnlineStore;
