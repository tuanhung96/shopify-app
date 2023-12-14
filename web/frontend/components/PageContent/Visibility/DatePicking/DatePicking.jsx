import { useReducer, useState } from "react";
import {
  LegacyCard,
  DatePicker,
  Icon,
  Popover,
  TextField,
} from "@shopify/polaris";
import { CalendarMinor } from "@shopify/polaris-icons";

function reducer(state, action) {
  switch (action.type) {
    case "changeVisibleDate":
      return {
        ...state,
        visibleDate: action.payload.visibleDate,
        month: action.payload.visibleDate.getMonth(),
        year: action.payload.visibleDate.getFullYear(),
        formattedVisibleDate: action.payload.visibleDate.toLocaleDateString(),
      };
    case "changeMonth":
      return {
        ...state,
        month: action.payload.month,
        year: action.payload.year,
      };
    case "changeFormattedVisibleDate":
      const arr = action.payload.formattedVisibleDate.split("/");
      const date = arr[2] + "/" + arr[1] + "/" + arr[0];
      const parsedDate = new Date(date);
      if (parsedDate === "Invalid Date")
        return {
          ...state,
          formattedVisibleDate: action.payload.formattedVisibleDate,
        };

      return {
        ...state,
        formattedVisibleDate: action.payload.formattedVisibleDate,
        visibleDate: parsedDate,
        month: parsedDate.getMonth(),
        year: parsedDate.getFullYear(),
      };
    default:
      break;
  }
}

function DatePicking() {
  const [showDatePopover, setShowDatePopover] = useState(false);

  const newDate = new Date();
  const initialState = {
    visibleDate: newDate,
    formattedVisibleDate: newDate.toLocaleDateString(),
    month: newDate.getMonth(),
    year: newDate.getFullYear(),
  };
  const [{ visibleDate, formattedVisibleDate, month, year }, dispatch] =
    useReducer(reducer, initialState);

  function handleCloseDatePopover() {
    setShowDatePopover(false);
  }

  function handleMonthChange(month, year) {
    dispatch({ type: "changeMonth", payload: { month, year } });
  }

  function handleDateSelection({ end: newSelectedDate }) {
    dispatch({
      type: "changeVisibleDate",
      payload: { visibleDate: newSelectedDate },
    });
    setShowDatePopover(false);
  }

  return (
    <Popover
      active={showDatePopover}
      autofocusTarget="none"
      fullWidth
      preferredAlignment="left"
      preferInputActivator={false}
      preferredPosition="below"
      preventCloseOnChildOverlayClick
      onClose={handleCloseDatePopover}
      activator={
        <TextField
          role="combobox"
          label={"Visibility date"}
          prefix={<Icon source={CalendarMinor} />}
          value={formattedVisibleDate}
          onFocus={() => setShowDatePopover(true)}
          onChange={(value) =>
            dispatch({
              type: "changeFormattedVisibleDate",
              payload: { formattedVisibleDate: value },
            })
          }
          autoComplete="off"
        />
      }
    >
      <LegacyCard>
        <DatePicker
          month={month}
          year={year}
          selected={visibleDate}
          onMonthChange={handleMonthChange}
          onChange={handleDateSelection}
        />
      </LegacyCard>
    </Popover>
  );
}

export default DatePicking;
