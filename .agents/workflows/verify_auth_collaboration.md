---
description: How to verify Auth & Collaboration implementation
---

Follow these steps to verify the implementation of authorization and collaboration system:

1. **Start the applications**:
   - Backend: `pnpm --filter backend start:dev` (in one terminal)
   - Frontend: `pnpm --filter frontend dev` (in another terminal)

2. **Verify Private Collection Blurring**:
   - Login as User A.
   - Create a Private Collection.
   - Copy the URL of the collection detail page.
   - Open a Private/Incognito window or logout and login as User B.
   - Navigate to the copied URL.
   - **Check**: Items should be blurred. A "Join Collection" button should be visible.

3. **Verify Settings Tab (Owner)**:
   - Login as User A (Owner).
   - Go to your collection's Settings tab.
   - Verify you see the collaborators table.
   - Change a role for a member.
   - **Check**: Verify the change persists after refreshing.

4. **Verify Role Restrictions (Viewer)**:
   - Invite User B to the collection as a "Viewer" (you can do this via Prisma Studio if UI inviting is not fully implemented).
   - Login as User B.
   - Access the collection.
   - **Check**: "New Item" button should be hidden. Dropdown on quiz items should not show "Edit" or "Delete".

5. **Verify API Security**:
   - Try to perform a DELETE request to `/quiz/:id` for a quiz you don't own using Postman or `curl`.
   - **Check**: Should return `403 Forbidden` with the message "Only the owner can delete this quiz".
