#!/bin/sh
set -eu

TMP_KEY_DIR="/tmp/keys"

write_key_file() {
  var_name="$1"
  pem_label="$2"
  file_name="$3"
  mode="$4"

  raw_value="$(printenv "$var_name" || true)"
  if [ -z "$raw_value" ]; then
    return
  fi

  if [ -f "$raw_value" ]; then
    return
  fi

  mkdir -p "$TMP_KEY_DIR"
  output_path="$TMP_KEY_DIR/$file_name"

  value_with_newlines="$(printf '%b' "$raw_value" | tr -d '\r')"

  if printf '%s' "$value_with_newlines" | grep -q "BEGIN "; then
    printf '%s\n' "$value_with_newlines" > "$output_path"
  else
    compact_value="$(printf '%s' "$value_with_newlines" | tr -d '[:space:]')"
    {
      printf '%s\n' "-----BEGIN $pem_label-----"
      printf '%s' "$compact_value" | fold -w 64
      printf '\n%s\n' "-----END $pem_label-----"
    } > "$output_path"
  fi

  chmod "$mode" "$output_path"
  export "$var_name=$output_path"
}

write_key_file "JWT_PUBLIC_KEY" "PUBLIC KEY" "public.pem" "644"
write_key_file "JWT_PRIVATE_KEY" "PRIVATE KEY" "private.pem" "600"

if [ "${RUN_PRISMA_MIGRATE_DEPLOY:-true}" = "true" ]; then
  npx prisma migrate deploy
fi

exec "$@"
