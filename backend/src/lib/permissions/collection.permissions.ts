import {
  CollectionVisibility,
  CollectionRole,
  CollectionMemberStatus,
} from '../../generated/prisma/enums.js';

export interface PartialCollectionMember {
  userId: string;
  role: CollectionRole;
  status: CollectionMemberStatus;
}

export interface PartialCollection {
  visibility: CollectionVisibility;
  ownerId: string;
  members?: PartialCollectionMember[];
}

export function canViewCollection(
  collection: PartialCollection,
  userId: string | undefined,
): boolean {
  if (collection.visibility === CollectionVisibility.PUBLIC) return true;
  if (!userId) return false;
  if (collection.ownerId === userId) return true;
  return (
    collection.members?.some(
      (m: PartialCollectionMember) =>
        m.userId === userId && m.status === CollectionMemberStatus.ACCEPTED,
    ) ?? false
  );
}

export function canEditCollection(
  collection: PartialCollection,
  userId: string,
): boolean {
  if (collection.ownerId === userId) return true;
  return (
    collection.members?.some(
      (m: PartialCollectionMember) =>
        m.userId === userId &&
        m.role === CollectionRole.EDITOR &&
        m.status === CollectionMemberStatus.ACCEPTED,
    ) ?? false
  );
}

export function canDeleteCollection(
  collection: PartialCollection,
  userId: string,
): boolean {
  return collection.ownerId === userId;
}

export function canManageMembers(
  collection: PartialCollection,
  userId: string,
): boolean {
  if (collection.ownerId === userId) return true;
  return (
    collection.members?.some(
      (m: PartialCollectionMember) =>
        m.userId === userId &&
        m.role === CollectionRole.EDITOR &&
        m.status === CollectionMemberStatus.ACCEPTED,
    ) ?? false
  );
}
