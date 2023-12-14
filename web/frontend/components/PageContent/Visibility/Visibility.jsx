import {
  LegacyCard,
  ChoiceList,
  Button,
  VerticalStack,
} from "@shopify/polaris";
import DatePicking from "./DatePicking/DatePicking";
import TimePicking from "./TimePicking/TimePicking";
import { useState } from "react";

function Visibility({ visibility, handleChangeVisibility }) {
  const [showDateTimePicking, setShowDateTimePicking] = useState(false);

  return (
    <LegacyCard title="Visibility" sectioned>
      <ChoiceList
        choices={[
          {
            label: "Visible",
            value: "visible",
          },
          { label: "Hidden", value: "hidden" },
        ]}
        selected={visibility}
        onChange={(value) => {
          handleChangeVisibility(value);
          if (value[0] === "visible" && showDateTimePicking)
            setShowDateTimePicking(false);
        }}
      />

      <div style={{ paddingBottom: 16 }}></div>

      {showDateTimePicking && (
        <div style={{ paddingBottom: 16 }}>
          <VerticalStack gap="2">
            <DatePicking />
            <TimePicking />
          </VerticalStack>
        </div>
      )}

      <Button
        plain
        onClick={() => {
          setShowDateTimePicking((showDateTimePicking) => !showDateTimePicking);
          handleChangeVisibility(["hidden"]);
        }}
      >
        {showDateTimePicking ? "Clear date..." : "Set visibility date"}
      </Button>
    </LegacyCard>
  );
}

export default Visibility;
