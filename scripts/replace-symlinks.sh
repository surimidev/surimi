# Find and replace all synlinks in the packages directory with their target files
find . -maxdepth 1 -type l -exec bash -c '
  for link do
    target=$(readlink -f "$link")
    if [ -f "$target" ]; then
      echo "🔄 $link → $target"
      rm "$link" && cp -p "$target" "$link"
    else
      echo "⚠️  Skipping $link (not a regular file)"
    fi
  done
' _ {} +