import {
  LegacyCard,
  FormLayout,
  TextField,
  Text,
  ButtonGroup,
  Tooltip,
  Button,
  LegacyStack,
  VerticalStack,
} from "@shopify/polaris";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaIndent,
  FaOutdent,
} from "react-icons/fa";
import { BiCode } from "react-icons/bi";

import { useState, useEffect, useRef } from "react";

function Content({
  error,
  setError,
  title,
  body,
  bodyRef,
  handleChangeTitle,
  handleChangeBody,
}) {
  const [showHTML, setShowHTML] = useState(false);
  const innerHTMLRef = useRef(null);

  //////////////
  const handleEditText = (tag) => {
    const selection = document.getSelection();
    const range = selection.getRangeAt(0);
    const commonAncestorContainer = range.commonAncestorContainer;
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const collapsed = range.collapsed;

    // 1. bold tag contains range
    if (
      (commonAncestorContainer.nodeType === Node.TEXT_NODE &&
        commonAncestorContainer === endContainer &&
        commonAncestorContainer === startContainer &&
        commonAncestorContainer.parentElement.closest(tag)) ||
      (commonAncestorContainer.nodeType !== Node.TEXT_NODE &&
        commonAncestorContainer.closest(tag))
    ) {
      let boldElement = null;
      if (commonAncestorContainer.nodeType === Node.TEXT_NODE)
        boldElement = commonAncestorContainer.parentElement.closest(tag);
      else boldElement = commonAncestorContainer.closest(tag);

      const nonBoldTextNode = range.extractContents();
      // set range into bold text after
      range.setStart(startContainer, startOffset);
      range.setEndAfter(boldElement);

      const boldTextAfter = range.extractContents();
      // Insert the bold text after node after the bold element
      boldElement.parentElement.insertBefore(
        boldTextAfter,
        boldElement.nextSibling
      );
      if (collapsed) {
        const textNode = document.createTextNode("_");
        range.insertNode(textNode);
      } else {
        range.insertNode(nonBoldTextNode);
      }
    } else {
      const fragment = range.extractContents();
      const boldElements = fragment.querySelectorAll(tag);

      // 2. range contains bold tag or bold tag intersect range
      if (boldElements.length > 0) {
        console.log("2. range contains bold tag or bold tag intersect range");

        const div = document.createElement("div");
        div.append(fragment);
        boldElements.forEach((element) => {
          // Clone all child nodes of the original element
          let clonedChildNodes = element.cloneNode(true).childNodes;
          // insert the cloned child nodes before element
          for (let i = 0; i < clonedChildNodes.length; i++) {
            element.parentElement.insertBefore(
              clonedChildNodes[i].cloneNode(true),
              element
            );
          }
          // remove bold element
          element.remove();
        });
        // Clone all child nodes of the div
        let clonedChildNodesDiv = div.cloneNode(true).childNodes;
        // Append the cloned child nodes to fragment
        for (let i = 0; i < clonedChildNodesDiv.length; i++) {
          fragment.append(clonedChildNodesDiv[i].cloneNode(true));
        }
        range.insertNode(fragment);
      }
      // 3. range contains no bold tag
      else {
        console.log("3. range contains no bold tag");
        const element = document.createElement(tag);
        element.append(fragment);
        range.insertNode(element);

        if (collapsed) {
          element.appendChild(document.createTextNode("_"));
          // set cursor position in the range
          range.setStart(element.firstChild, 0);
          range.setEnd(element.firstChild, 1);
        }
      }
    }
    bodyRef.current.focus();
  };

  const handleAlignText = (type) => {
    const selection = document.getSelection();
    const range = selection.getRangeAt(0);
    const commonAncestorContainer = range.commonAncestorContainer;
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const collapsed = range.collapsed;

    const div = document.querySelector(".div");

    // 1. range nam o text dau tien
    if (
      (commonAncestorContainer.nodeType === Node.TEXT_NODE &&
        commonAncestorContainer.parentElement.closest("div") === div) ||
      (commonAncestorContainer.nodeType !== Node.TEXT_NODE &&
        commonAncestorContainer.closest("div") === div &&
        ((endContainer.nodeType === Node.TEXT_NODE &&
          endContainer.parentElement.closest("div") === div) ||
          (endContainer.nodeType !== Node.TEXT_NODE &&
            endContainer.closest("div") === div)))
    ) {
      const element = document.createElement("div");
      range.setStart(div, 0);
      if (div.querySelectorAll("div").length > 0) {
        range.setEndBefore(div.querySelectorAll("div")[0]);
      } else {
        const childNodes = div.childNodes;
        if (childNodes.length > 0) {
          if (childNodes[childNodes.length - 1].nodeType !== Node.TEXT_NODE) {
            range.setEndAfter(childNodes[childNodes.length - 1]);
          } else {
            range.setEnd(
              childNodes[childNodes.length - 1],
              childNodes[childNodes.length - 1].length
            );
          }
        } else {
          range.collapse(true);
          element.append(document.createTextNode("_"));
        }
      }
      const fragment = range.extractContents();
      if (type === "indent") element.style.paddingLeft = "30px";
      element.append(fragment);
      range.insertNode(element);

      range.setStart(element, 0);
      // range.setStart(element, 1);
      // range.collapse(true);
    }
    // 2. range gom nhieu div
    else if (commonAncestorContainer === div) {
      const allDiv = div.querySelectorAll("div");
      // a, cac div bao gom phan text dau tien
      if (
        (startContainer.nodeType === Node.TEXT_NODE &&
          startContainer.parentElement.closest("div") === div) ||
        (startContainer.nodeType !== Node.TEXT_NODE &&
          startContainer.closest("div") === div)
      ) {
        const element = document.createElement("div");

        range.setStart(div, 0);
        range.setEndBefore(div.querySelectorAll("div")[0]);
        const fragment = range.extractContents();

        if (type === "indent") element.style.paddingLeft = "30px";
        element.append(fragment);
        range.insertNode(element);

        // get div at end of range
        let endDiv = null;
        if (endContainer.nodeType === Node.TEXT_NODE)
          endDiv = endContainer.parentElement.closest("div");
        else endDiv = endContainer.closest("div");

        let endDivIndex;
        for (let i = 0; i < allDiv.length; i++) {
          if (allDiv[i] === endDiv) endDivIndex = i;
        }

        // handle align all div in range
        for (let i = 0; i <= endDivIndex; i++) {
          const prevPaddingLeft = allDiv[i].style.paddingLeft;
          let padding;
          if (type === "indent") {
            padding =
              Number(prevPaddingLeft.slice(0, prevPaddingLeft.indexOf("px"))) +
              30;
          } else if (type === "outdent") {
            padding =
              Number(prevPaddingLeft.slice(0, prevPaddingLeft.indexOf("px"))) -
              30;
          }

          if (padding > 0) allDiv[i].style.paddingLeft = padding + "px";
          else if (padding === 0) allDiv[i].style.paddingLeft = null;
        }
      } else {
        // b, cac div khong bao gom phan text dau tien

        // get div at start of range
        let startDiv = null;
        if (startContainer.nodeType === Node.TEXT_NODE)
          startDiv = startContainer.parentElement.closest("div");
        else startDiv = startContainer.closest("div");
        // get div at end of range
        let endDiv = null;
        if (endContainer.nodeType === Node.TEXT_NODE)
          endDiv = endContainer.parentElement.closest("div");
        else endDiv = endContainer.closest("div");

        let startDivIndex, endDivIndex;
        for (let i = 0; i < allDiv.length; i++) {
          if (allDiv[i] === startDiv) startDivIndex = i;
          if (allDiv[i] === endDiv) endDivIndex = i;
        }

        // handle align all div in range
        for (let i = startDivIndex; i <= endDivIndex; i++) {
          const prevPaddingLeft = allDiv[i].style.paddingLeft;
          let padding;
          if (type === "indent") {
            padding =
              Number(prevPaddingLeft.slice(0, prevPaddingLeft.indexOf("px"))) +
              30;
          } else if (type === "outdent") {
            padding =
              Number(prevPaddingLeft.slice(0, prevPaddingLeft.indexOf("px"))) -
              30;
          }

          if (padding > 0) allDiv[i].style.paddingLeft = padding + "px";
          else if (padding === 0) allDiv[i].style.paddingLeft = null;
        }
      }
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
    }
    // 3. range nam trong 1 div con
    else {
      let divToChange = null;
      if (commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        divToChange = commonAncestorContainer.parentElement.closest("div");
      } else {
        divToChange = commonAncestorContainer.closest("div");
      }

      const prevPaddingLeft = divToChange.style.paddingLeft;
      let padding;
      if (type === "indent") {
        padding =
          Number(prevPaddingLeft.slice(0, prevPaddingLeft.indexOf("px"))) + 30;
      } else if (type === "outdent") {
        padding =
          Number(prevPaddingLeft.slice(0, prevPaddingLeft.indexOf("px"))) - 30;
      }

      if (padding > 0) divToChange.style.paddingLeft = padding + "px";
      else if (padding === 0) divToChange.style.paddingLeft = null;

      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
    }
    bodyRef.current.focus();
  };

  const handleShowHtml = () => {
    if (!showHTML) {
      innerHTMLRef.current = bodyRef.current.innerHTML;
      bodyRef.current.innerHTML = "";
      bodyRef.current.append(document.createTextNode(innerHTMLRef.current));
    } else {
      bodyRef.current.innerHTML = innerHTMLRef.current;
    }
    setShowHTML((prev) => !prev);
  };

  return (
    <LegacyCard sectioned>
      <FormLayout>
        <TextField
          label="Title"
          value={title}
          onChange={(value) => {
            handleChangeTitle(value);
            if (error) setError(false);
          }}
          placeholder="e.g. Contact us, Sizing chart, FAQs"
          error={error && "Title can't be blank"}
        />

        <VerticalStack gap="2">
          <Text>Content</Text>

          <LegacyStack>
            <LegacyStack.Item>
              {!showHTML && (
                <ButtonGroup segmented>
                  <Tooltip content="Bold">
                    <Button
                      icon={<FaBold />}
                      onClick={() => handleEditText("b")}
                    ></Button>
                  </Tooltip>
                  <Tooltip content="Italic">
                    <Button
                      icon={<FaItalic />}
                      onClick={() => handleEditText("i")}
                    ></Button>
                  </Tooltip>
                  <Tooltip content="Underline">
                    <Button
                      icon={<FaUnderline />}
                      onClick={() => handleEditText("u")}
                    ></Button>
                  </Tooltip>
                </ButtonGroup>
              )}
            </LegacyStack.Item>

            <LegacyStack.Item fill>
              {!showHTML && (
                <ButtonGroup segmented>
                  <Tooltip content="Outdent">
                    <Button
                      icon={<FaOutdent />}
                      onClick={() => handleAlignText("outdent")}
                    />
                  </Tooltip>

                  <Tooltip content="Indent">
                    <Button
                      icon={<FaIndent />}
                      onClick={() => handleAlignText("indent")}
                    />
                  </Tooltip>
                </ButtonGroup>
              )}
            </LegacyStack.Item>

            <LegacyStack.Item>
              <Tooltip content={`${showHTML ? "Show Editor" : "Show HTML"}`}>
                <Button icon={<BiCode />} onClick={handleShowHtml}></Button>
              </Tooltip>
            </LegacyStack.Item>
          </LegacyStack>
        </VerticalStack>

        <LegacyCard>
          <div
            className="div"
            ref={bodyRef}
            contentEditable
            style={{
              fontFamily: "Segoe UI",
              fontSize: "16px",
              minHeight: "160px",
              lineHeight: "20px",
              border: "1px solid #ced4da",
              padding: "8px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#228be6")}
            onBlur={(e) => (e.target.style.borderColor = "#ced4da")}
            onKeyUp={(e) => {
              if (e.target.innerHTML === "<br>") {
                const range = document.getSelection().getRangeAt(0);
                range.setStart(e.target, 0);
                range.collapse(true);
              } else handleChangeBody(e.target.innerHTML);
            }}
          ></div>
        </LegacyCard>
      </FormLayout>
    </LegacyCard>
  );
}

export default Content;
