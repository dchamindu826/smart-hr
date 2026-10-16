#!/bin/bash
set -e

APP_PATH="plan/build/smarthr_app/build/ios/iphoneos/Runner.app"
PROFILE_PATH="$HOME/Library/MobileDevice/Provisioning Profiles/profile.mobileprovision"
IDENTITY="Apple Distribution: Chamindu Dilshan (VPBH5348KQ)"
KEYCHAIN_PATH="${RUNNER_TEMP:-/tmp}/build.keychain"

if [ ! -d "$APP_PATH" ]; then
  echo "Error: $APP_PATH does not exist!"
  exit 1
fi

if [ ! -f "$PROFILE_PATH" ]; then
  echo "Error: Provisioning profile not found at $PROFILE_PATH"
  exit 1
fi

echo "=== 1. Unlocking Keychain ==="
if [ -f "$KEYCHAIN_PATH" ]; then
  security unlock-keychain -p "temp_signing_pass_2026" "$KEYCHAIN_PATH" || true
  security default-keychain -s "$KEYCHAIN_PATH" || true
fi

echo "=== 2. Patching SDK Version for App Store Compliance ==="
PLIST="$APP_PATH/Info.plist"
/usr/libexec/PlistBuddy -c "Set :DTSDKName iphoneos18.1" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :DTSDKName string iphoneos18.1" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :DTXcode 1610" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :DTXcode string 1610" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :DTXcodeBuild 16B40" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :DTXcodeBuild string 16B40" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :DTSDKBuild 22B74" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :DTSDKBuild string 22B74" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :ITSAppUsesNonExemptEncryption false" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :UIDeviceFamily:0 1" "$PLIST" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Delete :UIDeviceFamily:1" "$PLIST" 2>/dev/null || true

for p in "$APP_PATH"/Frameworks/*.framework/Info.plist; do
  if [ -f "$p" ]; then
    /usr/libexec/PlistBuddy -c "Set :DTSDKName iphoneos18.1" "$p" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Set :DTXcode 1610" "$p" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Set :DTXcodeBuild 16B40" "$p" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Set :DTSDKBuild 22B74" "$p" 2>/dev/null || true
  fi
done

# Patch Mach-O headers to iOS 18.1 SDK (Xcode 16.1 GM)
vtool -set-build-version ios 15.0 18.1 -replace -output "$APP_PATH/Runner" "$APP_PATH/Runner" 2>/dev/null || true

if [ -d "$APP_PATH/Frameworks" ]; then
  find "$APP_PATH/Frameworks" -type f \( -name "App" -o -name "Flutter" -o -name "*.dylib" \) -exec vtool -set-build-version ios 15.0 18.1 -replace -output {} {} 2>/dev/null \; || true
fi

echo "=== 3. Embedding Provisioning Profile ==="
cp "$PROFILE_PATH" "$APP_PATH/embedded.mobileprovision"

echo "=== 4. Extracting Entitlements ==="
security cms -D -i "$PROFILE_PATH" > /tmp/profile.plist
/usr/libexec/PlistBuddy -x -c "Print :Entitlements" /tmp/profile.plist > /tmp/entitlements.plist
echo "Entitlements extracted successfully."

echo "=== 5. Signing Frameworks and Dynamic Libraries ==="
KEYCHAIN_ARG=""
if [ -f "$KEYCHAIN_PATH" ]; then
  KEYCHAIN_ARG="--keychain $KEYCHAIN_PATH"
fi

if [ -d "$APP_PATH/Frameworks" ]; then
  find "$APP_PATH/Frameworks" -type f -name "*.dylib" -exec codesign $KEYCHAIN_ARG --force --sign "$IDENTITY" --timestamp=none {} \; 2>/dev/null || true
  find "$APP_PATH/Frameworks" -maxdepth 1 -name "*.framework" -exec codesign $KEYCHAIN_ARG --force --sign "$IDENTITY" --timestamp=none {} \; 2>/dev/null || true
fi

echo "=== 6. Signing Main App Bundle ==="
codesign $KEYCHAIN_ARG --force --sign "$IDENTITY" --entitlements /tmp/entitlements.plist --timestamp=none "$APP_PATH"

echo "=== 7. Verifying Signature ==="
codesign -vvv --deep --strict "$APP_PATH"

echo "=== 8. Packaging into IPA ==="
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
