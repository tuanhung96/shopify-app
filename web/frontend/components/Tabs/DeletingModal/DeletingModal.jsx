import { Modal, Frame } from "@shopify/polaris";

function DeletingModal({
  showDeletingModal,
  selectedPages,
  handleCloseDeletingModal,
  handleDeleteSelectedPages,
}) {
  const title = `Delete ${selectedPages?.length} ${
    selectedPages?.length === 1 ? "page" : "pages"
  }`;

  return (
    <Frame>
      <div style={{ height: "500px" }}>
        <Modal
          open={showDeletingModal}
          onClose={handleCloseDeletingModal}
          title={title}
          primaryAction={{
            destructive: true,
            content: title,
            onAction: () => {
              handleCloseDeletingModal();
              handleDeleteSelectedPages();
            },
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleCloseDeletingModal,
            },
          ]}
        >
          <Modal.Section>
            Deleted pages cannot be recovered. Do you still want to continue?
          </Modal.Section>
        </Modal>
      </div>
    </Frame>
  );
}

export default DeletingModal;
