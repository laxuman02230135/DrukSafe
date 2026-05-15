export function formatTime(value) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-BT", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function formatRelativeMinutes(value) {
  if (!value) {
    return "--";
  }

  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60000)
  );

  return `${minutes}m`;
}
