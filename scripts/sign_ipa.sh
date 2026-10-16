#!/bin/bash
set -e

APP_PATH="plan/build/smarthr_app/build/ios/iphoneos/Runner.app"
PROFILE_PATH="$HOME/Library/MobileDevice/Provisioning Profiles/profile.mobileprovision"
IDENTITY="Apple Distribution: Chamindu Dilshan (VPBH5348KQ)"

if [ ! -d "$APP_PATH" ]; then
  echo "Error: $APP_PATH does not exist!"
  exit 1
fi

if [ ! -f "$PROFILE_PATH" ]; then
  echo "Error: Provisioning profile not found at $PROFILE_PATH"
  exit 1
fi

echo "=== 1. Embedding Provisioning Profile ==="
cp "$PROFILE_PATH" "$APP_PATH/embedded.mobileprovision"

echo "=== 2. Extracting Entitlements ==="
security cms -D -i "$PROFILE_PATH" > /tmp/profile.plist
/usr/libexec/PlistBuddy -x -c "Print :Entitlements" /tmp/profile.plist > /tmp/entitlements.plist
echo "Entitlements extracted successfully:"
cat /tmp/entitlements.plist

echo "=== 3. Signing Frameworks and Dynamic Libraries ==="
if [ -d "$APP_PATH/Frameworks" ]; then
  find "$APP_PATH/Frameworks" -type f -name "*.dylib" -exec codesign --force --sign "$IDENTITY" --timestamp=none {} \; 2>/dev/null || true
  find "$APP_PATH/Frameworks" -maxdepth 1 -name "*.framework" -exec codesign --force --sign "$IDENTITY" --timestamp=none {} \; 2>/dev/null || true
fi

echo "=== 4. Signing Main App Bundle ==="
codesign --force --sign "$IDENTITY" --entitlements /tmp/entitlements.plist --timestamp=none "$APP_PATH"

echo "=== 5. Verifying Signature ==="
codesign -vvv --deep --strict "$APP_PATH"

echo "=== 6. Packaging into IPA ==="
IPA_DIR="plan/build/smarthr_app/build/ios/ipa"
mkdir -p "$IPA_DIR/Payload"
cp -r "$APP_PATH" "$IPA_DIR/Payload/"
cd "$IPA_DIR"
rm -f SmartHR.ipa
zip -qr SmartHR.ipa Payload
rm -rf Payload

echo "=== SUCCESS! ==="
echo "Signed App Store IPA generated:"
ls -lh SmartHR.ipa
