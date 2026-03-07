#!/bin/sh

# Set defaults if variables are not provided
: "${NEXT_PUBLIC_API_URL:=APP_API_URL_PLACEHOLDER}"
: "${NEXT_PUBLIC_APP_URL:=APP_APP_URL_PLACEHOLDER}"
: "${NEXT_PUBLIC_SOCKET_URL:=APP_SOCKET_URL_PLACEHOLDER}"

echo "Replacing placeholders with runtime environment variables..."
echo "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
echo "NEXT_PUBLIC_SOCKET_URL: $NEXT_PUBLIC_SOCKET_URL"

# We use | as a delimiter in sed because URLs contain slashes /
# We target .next and public folders where Next.js stores bundled JS and HTML
find /app/.next /app/public -type f -exec sed -i "s|APP_API_URL_PLACEHOLDER|${NEXT_PUBLIC_API_URL}|g" {} +
find /app/.next /app/public -type f -exec sed -i "s|APP_APP_URL_PLACEHOLDER|${NEXT_PUBLIC_APP_URL}|g" {} +
find /app/.next /app/public -type f -exec sed -i "s|APP_SOCKET_URL_PLACEHOLDER|${NEXT_PUBLIC_SOCKET_URL}|g" {} +

echo "Done. Starting application..."

# Execute the original command (usually "node server.js")
exec "$@"
