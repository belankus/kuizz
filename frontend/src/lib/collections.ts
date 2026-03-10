import { apiFetch } from "./auth";
import { handleApiError } from "./api-error-handler";
import { useQuery } from "@tanstack/react-query";

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

export async function fetchMarketplaceCollections() {
  const res = await apiFetch("/collections/marketplace");
  await handleApiError(res);
  return res.json();
}

export async function fetchMyCollections() {
  const res = await apiFetch("/collections/mine");
  await handleApiError(res);
  return res.json();
}

export async function fetchSharedCollections() {
  const res = await apiFetch("/collections/shared");
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

/**
 * Hook for fetching collections based on the active tab with TanStack Query.
 */
export function useCollections(tab: string) {
  return useQuery({
    queryKey: ["collections", tab],
    queryFn: () => {
      switch (tab) {
        case "All":
          return fetchCollections();
        case "My Collections":
          return fetchMyCollections();
        case "Saved":
          return fetchSavedCollections();
        case "Shared":
          return fetchSharedCollections();
        case "Marketplace":
          return fetchMarketplaceCollections();
        default:
          return fetchCollections();
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
