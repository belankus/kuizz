import { apiFetch } from "./auth";
import { handleApiError } from "./api-error-handler";

export async function fetchCollections() {
  const res = await apiFetch("/collections");
  await handleApiError(res);
  return res.json();
}

export async function fetchSavedCollections() {
  const res = await apiFetch("/collections/saved");
  await handleApiError(res);
  return res.json();
}

export async function fetchCollection(id: string) {
  const res = await apiFetch(`/collections/${id}`);
  await handleApiError(res);
  return res.json();
}

export async function createCollection(data: Record<string, unknown>) {
  const res = await apiFetch("/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return res.json();
}

export async function updateCollection(
  id: string,
  data: Record<string, unknown>,
) {
  const res = await apiFetch(`/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return res.json();
}

export async function deleteCollection(id: string) {
  const res = await apiFetch(`/collections/${id}`, {
    method: "DELETE",
  });
  await handleApiError(res);
  return res.json();
}

export async function toggleSaveCollection(id: string) {
  const res = await apiFetch(`/collections/${id}/save`, {
    method: "POST",
  });
  await handleApiError(res);
  return res.json();
}

export async function inviteMember(id: string, email: string) {
  const res = await apiFetch(`/collections/${id}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  await handleApiError(res);
  return res.json();
}

export async function createCollectionItem(
  collectionId: string,
  data: Record<string, unknown>,
) {
  const res = await apiFetch(`/collections/${collectionId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return res.json();
}

export async function updateCollectionItem(
  itemId: string,
  data: Record<string, unknown>,
) {
  const res = await apiFetch(`/collection-items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return res.json();
}

export async function deleteCollectionItem(itemId: string) {
  const res = await apiFetch(`/collection-items/${itemId}`, {
    method: "DELETE",
  });
  await handleApiError(res);
  return res.json();
}
