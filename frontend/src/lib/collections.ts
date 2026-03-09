import { apiFetch } from "./auth";

export async function fetchCollections() {
  const res = await apiFetch("/collections");
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export async function fetchSavedCollections() {
  const res = await apiFetch("/collections/saved");
  if (!res.ok) throw new Error("Failed to fetch saved collections");
  return res.json();
}

export async function fetchCollection(id: string) {
  const res = await apiFetch(`/collections/${id}`);
  if (!res.ok) throw new Error("Failed to fetch collection");
  return res.json();
}

export async function createCollection(data: Record<string, unknown>) {
  const res = await apiFetch("/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create collection");
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
  if (!res.ok) throw new Error("Failed to update collection");
  return res.json();
}

export async function deleteCollection(id: string) {
  const res = await apiFetch(`/collections/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete collection");
  return res.json();
}

export async function toggleSaveCollection(id: string) {
  const res = await apiFetch(`/collections/${id}/save`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle save");
  return res.json();
}

export async function inviteMember(id: string, email: string) {
  const res = await apiFetch(`/collections/${id}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to invite member");
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
  if (!res.ok) throw new Error("Failed to create collection item");
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
  if (!res.ok) throw new Error("Failed to update collection item");
  return res.json();
}

export async function deleteCollectionItem(itemId: string) {
  const res = await apiFetch(`/collection-items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete collection item");
  return res.json();
}
