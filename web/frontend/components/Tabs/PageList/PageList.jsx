import { useNavigate } from "@shopify/app-bridge-react";
import {
  LegacyFilters,
  Button,
  LegacyCard,
  LegacyTabs,
  ResourceList,
  ResourceItem,
  Text,
  ChoiceList,
  Badge,
  HorizontalStack,
  Popover,
  TextField,
  Tag,
  Frame,
  Toast,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../../../hooks";
import { sortPages } from "../../../utils/sortPages";
import DeletingModal from "../DeletingModal/DeletingModal";

function PageList() {
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [sortValue, setSortValue] = useState("DATE_UPDATED_DESC");
  const [visibility, setVisibility] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeletingModal, setShowDeletingModal] = useState(false);
  const [tabs, setTabs] = useState(() =>
    JSON.parse(localStorage.getItem("tabs"))
      ? JSON.parse(localStorage.getItem("tabs"))
      : [
          {
            id: "All",
            content: "All",
            queryValue: "",
            visibility: "",
            sortValue: "DATE_UPDATED_DESC",
          },
        ]
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const [value, setValue] = useState("");
  const [showPopoverSave, setShowPopoverSave] = useState(false);
  const [toast, setToast] = useState({ active: false, content: "" });

  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
  /////////////
  const { refetch } = useAppQuery({
    url: "/api/pages",
    reactQueryOptions: {
      onSuccess: (res) => {
        let newPages = res.data;
        // Filter search
        if (queryValue.trim()) {
          newPages = newPages.filter((page) =>
            page.title
              .trim()
              .toLowerCase()
              .includes(queryValue.trim().toLowerCase())
          );
        }

        // Filter visibility
        if (visibility)
          newPages = newPages.filter((page) => {
            return visibility === "visible"
              ? page.published_at
              : !page.published_at;
          });

        // Filter sort
        newPages = sortPages(newPages, sortValue);

        setPages(newPages);
        setIsLoading(false);
      },
      onError: (error) => {
        console.log(error);
      },
    },
  });

  /////////// Tabs
  const handleTabChange = useCallback(
    (selectedTabIndex) => {
      // if current tab and selected tab are both "Custom search"
      if (
        tabs[selectedTabIndex].id === "Custom search" &&
        tabs[tabs.length - 1].id === "Custom search"
      )
        return;

      setIsLoading(true);
      // when current tab is "Custom search" and selected tab is not "Custom search"
      if (
        tabs[selectedTabIndex].id !== "Custom search" &&
        tabs[tabs.length - 1].id === "Custom search"
      ) {
        setTabs((prev) => prev.slice(0, -1));
      }
      setQueryValue(tabs[selectedTabIndex].queryValue);
      setVisibility(tabs[selectedTabIndex].visibility);
      setSortValue(tabs[selectedTabIndex].sortValue);
      setSelectedTab(selectedTabIndex);
      refetch();
    },
    [tabs]
  );

  ////////// QUERY VALUE

  const handleQueryValueChange = useCallback(
    (queryValue) => {
      setIsLoading(true);

      if (!queryValue) {
        setQueryValue("");

        if (!visibility) {
          if (
            tabs[selectedTab].id === "Custom search" &&
            tabs[tabs.length - 1].id === "Custom search"
          ) {
            setTabs((prev) => prev.slice(0, -1));
          }
          setQueryValue(tabs[0].queryValue);
          setVisibility(tabs[0].visibility);
          setSortValue(tabs[0].sortValue);
          setSelectedTab(0);
        }
        refetch();
      } else {
        setQueryValue(queryValue);

        if (tabs[selectedTab].id !== "Custom search") {
          const newTab = {
            id: "Custom search",
            content: "Custom search",
            queryValue: queryValue,
            visibility: visibility,
            sortValue: sortValue,
          };
          setTabs((prev) => [...prev, newTab]);
          // set selectedTab = tabs.length (not tabs.length-1) because tabs is not changed yet
          setSelectedTab(tabs.length);
        }
        refetch();
      }
    },
    [tabs, selectedTab, visibility]
  );

  const handleQueryValueRemove = useCallback(() => {
    setIsLoading(true);
    setQueryValue("");

    if (!visibility) {
      if (
        tabs[selectedTab].id === "Custom search" &&
        tabs[tabs.length - 1].id === "Custom search"
      ) {
        setTabs((prev) => prev.slice(0, -1));
      }
      setQueryValue(tabs[0].queryValue);
      setVisibility(tabs[0].visibility);
      setSortValue(tabs[0].sortValue);
      setSelectedTab(0);
    }
    refetch();
  }, [tabs, selectedTab, visibility]);

  ///////////// VISIBILITY

  const handleVisibilityChange = useCallback(
    (value) => {
      setIsLoading(true);
      setVisibility(value[0]);

      if (tabs[selectedTab].id !== "Custom search") {
        const newTab = {
          id: "Custom search",
          content: "Custom search",
          queryValue: queryValue,
          visibility: value[0],
          sortValue: sortValue,
        };
        setTabs((prev) => [...prev, newTab]);
        // set selectedTab = tabs.length (not tabs.length-1) because tabs is not changed yet
        setSelectedTab(tabs.length);
      }
      refetch();
    },
    [tabs, selectedTab, queryValue, sortValue]
  );

  const handleVisibilityRemove = useCallback(() => {
    setIsLoading(true);
    setVisibility("");

    if (!queryValue) {
      if (
        tabs[selectedTab].id === "Custom search" &&
        tabs[tabs.length - 1].id === "Custom search"
      ) {
        setTabs((prev) => prev.slice(0, -1));
      }
      setQueryValue(tabs[0].queryValue);
      setVisibility(tabs[0].visibility);
      setSortValue(tabs[0].sortValue);
      setSelectedTab(0);
    }
    refetch();
  }, [tabs, selectedTab, queryValue]);

  const handleClearAll = useCallback(() => {
    handleVisibilityRemove();
    handleQueryValueRemove();
  }, [handleQueryValueRemove, handleVisibilityRemove]);

  const handleSortValueChange = useCallback((value) => {
    setIsLoading(true);
    setSortValue(value);
    refetch();
  }, []);

  const handleChangePagesVisibility = async (visibility) => {
    setIsLoading(true);

    const res = await fetch(`/api/pages?id=${selectedPages.toString()}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        published: visibility === "visible" ? true : false,
      }),
    });

    if (res.ok) {
      setSelectedPages([]);
      setToast({
        active: true,
        content: ` ${visibility === "visible" ? "Make visible" : "Hide"} ${
          selectedPages.length
        } ${selectedPages.length === 1 ? "page" : "pages"}`,
      });
      refetch();
    }
  };

  /////////// Popover Save
  const handleChangeValue = useCallback((value) => {
    setValue(value);
  }, []);

  const toggleShowPopoverSave = useCallback(() => {
    setShowPopoverSave((prev) => !prev);
  }, []);

  /////////// DELETE

  const handleShowDeletingModal = useCallback(() => {
    setShowDeletingModal(true);
  });

  const handleCloseDeletingModal = useCallback(() => {
    setShowDeletingModal(false);
  }, []);

  const handleDeleteSelectedPages = async () => {
    setIsLoading(true);

    const res = await fetch(`/api/pages?id=${selectedPages.toString()}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelectedPages([]);
      setToast({
        active: true,
        content: `Deleted ${selectedPages.length} ${
          selectedPages.length === 1 ? "page" : "pages"
        }`,
      });
      refetch();
    }
  };

  const bulkActions = [
    {
      content: "Make selected pages visible",
      onAction: () => handleChangePagesVisibility("visible"),
    },
    {
      content: "Hide selected pages",
      onAction: () => handleChangePagesVisibility("hidden"),
    },
    {
      content: "Delete pages",
      onAction: handleShowDeletingModal,
    },
  ];

  const handleSaveFilter = () => {
    const newTab = {
      id: value,
      content: value,
      queryValue: queryValue,
      visibility: visibility,
      sortValue: sortValue,
    };
    const newTabs = [...tabs.slice(0, -1), newTab];
    setTabs(newTabs);
    setValue("");
    localStorage.setItem("tabs", JSON.stringify(newTabs));
    // setSelectedTab(tabs.length);
  };

  const filters = [
    {
      key: "visibility",
      label: "Visibility",
      filter: (
        <ChoiceList
          title="Visible"
          titleHidden
          choices={[
            { label: "Visible", value: "visible" },
            { label: "Hidden", value: "hidden" },
          ]}
          selected={visibility}
          onChange={handleVisibilityChange}
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = visibility
    ? [
        {
          key: "visibility",
          label: `Visibility is ${visibility}`,
          onRemove: handleVisibilityRemove,
        },
      ]
    : [];

  const filterControl = (
    <LegacyFilters
      queryValue={queryValue}
      filters={filters}
      appliedFilters={appliedFilters}
      onQueryChange={handleQueryValueChange}
      onQueryClear={handleQueryValueRemove}
      onClearAll={handleClearAll}
    >
      <div style={{ paddingLeft: "8px" }}>
        <Popover
          active={showPopoverSave}
          activator={
            <Button
              disabled={!queryValue.trim() && !visibility}
              onClick={toggleShowPopoverSave}
            >
              Save
            </Button>
          }
          onClose={toggleShowPopoverSave}
        >
          <LegacyCard sectioned>
            {visibility && (
              <div style={{ marginBottom: 10 }}>
                <Tag>Visibility is {visibility}</Tag>
              </div>
            )}

            <TextField
              label="Save as"
              value={value}
              onChange={handleChangeValue}
              placeholder="Ready to publish, work in progess"
              helpText="Filters are saved as a new tab at the top of this list."
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 12,
              }}
            >
              <Button onClick={toggleShowPopoverSave}>Cancel</Button>
              <Button
                primary
                disabled={!value.trim()}
                onClick={handleSaveFilter}
              >
                Save filters
              </Button>
            </div>
          </LegacyCard>
        </Popover>
      </div>
    </LegacyFilters>
  );

  return (
    <LegacyCard>
      <LegacyTabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
        <LegacyCard>
          <ResourceList
            resourceName={{
              singular: "page",
              plural: "pages",
            }}
            items={pages}
            renderItem={renderPage}
            selectedItems={selectedPages}
            onSelectionChange={setSelectedPages}
            bulkActions={bulkActions}
            sortValue={sortValue}
            sortOptions={[
              { label: "Newest update", value: "DATE_UPDATED_DESC" },
              { label: "Oldest update", value: "DATE_UPDATED_ASC" },
              { label: "Title A-Z", value: "TITLE_ASC" },
              { label: "Title Z-A", value: "TITLE_DESC" },
            ]}
            onSortChange={handleSortValueChange}
            filterControl={filterControl}
            loading={isLoading}
          />

          {showDeletingModal && (
            <DeletingModal
              showDeletingModal={showDeletingModal}
              selectedPages={selectedPages}
              handleCloseDeletingModal={handleCloseDeletingModal}
              handleDeleteSelectedPages={handleDeleteSelectedPages}
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
        </LegacyCard>
      </LegacyTabs>
    </LegacyCard>
  );

  function renderPage(page) {
    const { id, title, created_at, body_html, published_at, handle } = page;
    const shortcutActions = handle
      ? [
          {
            content: "View Page",
            url: `https://hungstore21.myshopify.com/pages/${handle}`,
          },
        ]
      : [];
    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`View details for ${title}`}
        shortcutActions={shortcutActions}
        persistActions
        onClick={() => navigate(`/${id}`)}
      >
        <HorizontalStack gap="2">
          <Text as="h3" variant="bodyMd" fontWeight="semibold">
            {title}
          </Text>
          {!published_at && <Badge tone="info">Hidden</Badge>}
        </HorizontalStack>
        <Text as="p" variant="bodyMd" color="subdued" fontWeight="regular">
          {new Date(created_at).toDateString()}
        </Text>
      </ResourceItem>
    );
  }
}

export default PageList;
