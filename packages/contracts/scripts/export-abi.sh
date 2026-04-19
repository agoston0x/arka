#!/usr/bin/env bash

set -euo pipefail

OUT_DIR="out"
ABI_DIR="abi"

rm -rf "$ABI_DIR"
mkdir -p "$ABI_DIR"

find "$OUT_DIR" -type f -name "*.json" | while read -r file; do
    source_path=$(jq -r '.ast.absolutePath // empty' "$file")

    if [[ "$source_path" == src/* ]]; then
        contract=$(basename "$file" .json)
        jq '.abi' "$file" > "$ABI_DIR/$contract.json"
    fi
done

echo "✅ Exported ABIs for contracts from src/ into $ABI_DIR/"