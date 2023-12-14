import { Modal, Frame } from "@shopify/polaris";

function DeletingSinglePageModal({
  showDeletingModal,
  pageTitle,
  handleCloseDeletingModal,
  handleDeletePage,
}) {
  const title = `Delete ${pageTitle} ?`;

  return (
    <Frame>
      <div style={{ height: "500px" }}>
        <Modal
          open={showDeletingModal}
          onClose={handleCloseDeletingModal}
          title={title}
          primaryAction={{
            destructive: true,
            content: "Delete",
            onAction: () => {
              handleCloseDeletingModal();
              handleDeletePage();
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
            Delete “{`${pageTitle}`}”? This can't be undone.
          </Modal.Section>
        </Modal>
      </div>
    </Frame>
  );
}

export default DeletingSinglePageModal;
