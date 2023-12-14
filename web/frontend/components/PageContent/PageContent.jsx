import { Frame, Grid, PageActions, Toast } from "@shopify/polaris";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../../hooks";
import Content from "./Content/Content";
import SearchEngine from "./SearchEngine/SearchEngine";
import Visibility from "./Visibility/Visibility";
import OnlineStore from "./OnlineStore/OnlineStore";
import SkeletonPageLoading from "./SkeletonPageLoading/SkeletonPageLoading";
import DeletingSinglePageModal from "./DeleteSinglePageModal/DeleteSinglePageModal";

function PageContent({ pageData, refetch }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("visible");

  const [toast, setToast] = useState({ active: false, content: "" });
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeletingModal, setShowDeletingModal] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (pageData) {
      setTitle(pageData.title);
      setBody(pageData.body_html);
      setVisibility(pageData.published_at ? "visible" : "hidden");
      bodyRef.current.innerHTML = pageData.body_html;
    }
  }, [pageData]);

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const handleChangeTitle = useCallback((value) => {
    setTitle(value);
  }, []);

  const handleChangeBody = useCallback((value) => {
    setBody(value);
  }, []);

  const handleChangeVisibility = useCallback((value) => {
    setVisibility(value[0]);
  }, []);

  const handleCreatePage = async () => {
    if (!title.trim()) {
      setError(true);
    } else {
      const newPage = {
        title: title.trim(),
        body_html: bodyRef.current.innerHTML,
        published: visibility === "visible",
      };

      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: newPage }),
      });

      if (res.ok) {
        setToast({ active: true, content: "Page was created" });
        const data = await res.json();
        setTimeout(() => {
          setIsLoading(true);
        }, 1000);
        setTimeout(() => {
          navigate(`/${data.id}`);
        }, 1500);
      }
    }
  };

  const handleUpdatePage = async () => {
    if (!title.trim()) {
      setError(true);
    } else {
      const newPage = {
        title: title.trim(),
        body_html: bodyRef.current.innerHTML,
        published: visibility === "visible",
      };

      const res = await fetch(`/api/pages?id=${pageData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page: newPage }),
      });

      if (res.ok) {
        setToast({ active: true, content: "Page was saved" });
        refetch();
      }
    }
  };

  const handleShowDeletingModal = useCallback(() => {
    setShowDeletingModal(true);
  }, []);

  const handleCloseDeletingModal = useCallback(() => {
    setShowDeletingModal(false);
  }, []);

  const handleDeletePage = async () => {
    const res = await fetch(`/api/pages?id=${pageData.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setToast({ active: true, content: `Page was deleted` });
      setTimeout(() => {
        setIsLoading(true);
      }, 1000);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  return isLoading ? (
    <SkeletonPageLoading />
  ) : (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
        <Content
          error={error}
          setError={setError}
          title={title}
          body={body}
          bodyRef={bodyRef}
          handleChangeTitle={handleChangeTitle}
          handleChangeBody={handleChangeBody}
        ></Content>
        <SearchEngine title={title} body={body}></SearchEngine>
      </Grid.Cell>
      <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
        <Visibility
          visibility={visibility}
          handleChangeVisibility={handleChangeVisibility}
        ></Visibility>
        <OnlineStore></OnlineStore>
      </Grid.Cell>
      <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
        <PageActions
          primaryAction={{
            content: "Save",
            onAction: pageData ? handleUpdatePage : handleCreatePage,
          }}
          secondaryActions={[
            pageData
              ? {
                  content: "Delete",
                  destructive: true,
                  onAction: handleShowDeletingModal,
                }
              : {
                  content: "Cancel",
                  onAction: () => {
                    navigate("/");
                  },
                },
          ]}
        />

        {showDeletingModal && (
          <DeletingSinglePageModal
            showDeletingModal={showDeletingModal}
            pageTitle={title}
            handleCloseDeletingModal={handleCloseDeletingModal}
            handleDeletePage={handleDeletePage}
          />
        )}

        {toast.active && (
          <Frame>
            <Toast
              content={toast.content}
              onDismiss={() => setToast({ active: false, content: "" })}
              duration={2000}
            />
          </Frame>
        )}
      </Grid.Cell>
    </Grid>
  );
}

export default PageContent;
