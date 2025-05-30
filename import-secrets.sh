#!/bin/bash

ENV_FILE=".env.example"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "⚠️ Không tìm thấy file $ENV_FILE"
  exit 1
fi

echo "🔐 Bắt đầu import các secrets từ $ENV_FILE vào GitHub..."

while IFS='=' read -r key value; do
  if [[ -n "$key" && "$key" != \#* ]]; then
    echo "👉 Đang set secret: $key"
    gh secret set "$key" --body "$value"
  fi
done < "$ENV_FILE"

echo "✅ Hoàn tất import secrets."
