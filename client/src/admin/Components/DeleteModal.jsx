import ConfirmDialog from "./ConfirmDialog";

export default function DeleteModal({ event, onConfirm, onCancel, loading }) {
  return (
    <ConfirmDialog
      open={Boolean(event)}
      title="Delete Event"
      description={event ? `Delete "${event.title}"? This will also remove its image file from uploads.` : ""}
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmLabel={loading ? "Deleting..." : "Delete Event"}
    />
  );
}
