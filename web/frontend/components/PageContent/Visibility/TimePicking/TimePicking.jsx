import { Button, OptionList, Popover, Box } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { ClockMajor } from "@shopify/polaris-icons";
import { times } from "../../../../constants/times";

function TimePicking() {
  const [showTimePopover, setShowTimePopover] = useState(false);
  const [visibleTime, setVisibleTime] = useState(times[0]);

  const handleChangeVisibleTime = useCallback((value) => {
    setVisibleTime(value);
  }, []);

  const toggleTimePopover = useCallback(() => {
    setShowTimePopover((prev) => !prev);
  }, []);

  const handleCloseTimePopover = useCallback(() => {
    setShowTimePopover(false);
  }, []);

  // useEffect(() => {
  //   handleChangeVisibleTime([times[0]]);
  // }, []);

  return (
    <Popover
      active={showTimePopover}
      autofocusTarget="none"
      onClose={handleCloseTimePopover}
      fullWidth
      activator={
        <Button
          icon={ClockMajor}
          fullWidth
          onClick={toggleTimePopover}
          textAlign="left"
        >
          <p style={{ marginLeft: 4 }}>{visibleTime}</p>
        </Button>
      }
    >
      <OptionList
        options={times.map((time) => ({
          label: time,
          value: time,
        }))}
        selected={visibleTime}
        onChange={(value) => {
          handleChangeVisibleTime(value);
          handleCloseTimePopover();
        }}
      />
    </Popover>
  );
}

export default TimePicking;
