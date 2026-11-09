#!/usr/bin/env bash
# Arma TusFinanzas.apk sin Android Studio. Uso: ./build_apk.sh
# Herramientas (se descargan solas de Maven Central la primera vez):
#   aapt2 + framework de Android (dentro de apktool-lib), clases de Android (robolectric android-all),
#   dx (convierte Java a Dalvik) y apksig (firma). Requiere Java 17+ y Python 3.
# Firma: necesita la llave en $TF_KEYSTORE (por defecto ../.llave/tusfinanzas.p12) y la clave en $TF_STOREPASS.
# Si no existe la llave, se crea una nueva: GUÁRDALA, sin ella no se puede actualizar la app sin desinstalarla.
set -euo pipefail
cd "$(dirname "$0")"
HERE=$(pwd)
TOOLS=${TF_TOOLS:-$HOME/.cache/tusfinanzas-tools}
OUT=$HERE/build
KEYSTORE=${TF_KEYSTORE:-$HERE/../.llave/tusfinanzas.p12}
STOREPASS=${TF_STOREPASS:-tusfinanzas}
ALIAS=tusfinanzas
VERSION_NAME=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' version.json | head -1)
VERSION_CODE=$(sed -n 's/.*"code": *\([0-9]*\).*/\1/p' version.json | head -1)
M=https://repo.maven.apache.org/maven2

mkdir -p "$TOOLS"
get() { [ -s "$TOOLS/$2" ] || curl -sSfL -m 600 -o "$TOOLS/$2" "$M/$1"; }
get org/apktool/apktool-lib/3.0.3/apktool-lib-3.0.3.jar apktool-lib.jar
get com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar apksig.jar
get com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar dx.jar
get org/robolectric/android-all/14-robolectric-10818077/android-all-14-robolectric-10818077.jar android-all.jar
if [ ! -x "$TOOLS/aapt2" ]; then
  (cd "$TOOLS" && unzip -o -q apktool-lib.jar prebuilt/linux/aapt2 prebuilt/android-framework.jar \
    && mv prebuilt/linux/aapt2 aapt2 && mv prebuilt/android-framework.jar android-framework.jar && chmod +x aapt2)
fi

rm -rf "$OUT" && mkdir -p "$OUT"/{res,gen,classes,assets}
# 1) la app web va en assets/
cp -r web/. "$OUT/assets/"
sed -i "s/__APP_VERSION__/$VERSION_NAME/g" "$OUT/assets/index.html"

# 2) recursos y manifiesto
"$TOOLS/aapt2" compile --dir android/res -o "$OUT/res/res.zip"
"$TOOLS/aapt2" link -o "$OUT/base.apk" -I "$TOOLS/android-framework.jar" \
  --manifest android/AndroidManifest.xml -A "$OUT/assets" --java "$OUT/gen" \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" "$OUT/res/res.zip" 2>&1 | grep -v '^warn' || true
[ -s "$OUT/base.apk" ]

# 3) Java -> clases -> classes.dex
javac -nowarn --release 8 -encoding UTF-8 -cp "$TOOLS/android-all.jar" -d "$OUT/classes" \
  $(find android/src "$OUT/gen" -name '*.java') 2>&1 | grep -v -E 'JAVA_TOOL_OPTIONS|bootstrap|obsolete|warning' || true
java -cp "$TOOLS/dx.jar" com.android.dx.command.Main --dex --min-sdk-version=24 --output="$OUT/classes.dex" "$OUT/classes" 2>&1 | grep -v JAVA_TOOL || true
[ -s "$OUT/classes.dex" ]

# 4) juntar, alinear y firmar
python3 tools/zipalign.py "$OUT/base.apk" "$OUT/classes.dex" "$OUT/aligned.apk"
if [ ! -f "$KEYSTORE" ]; then
  echo ">> No hay llave de firma: creando una nueva en $KEYSTORE (guárdala bien)"
  mkdir -p "$(dirname "$KEYSTORE")"
  keytool -genkeypair -keystore "$KEYSTORE" -storetype PKCS12 -storepass "$STOREPASS" -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Tus Finanzas, O=NEXO PC, C=CO" 2>&1 | grep -v JAVA_TOOL || true
fi
mkdir -p "$OUT/signer"
javac -nowarn -cp "$TOOLS/apksig.jar" -d "$OUT/signer" tools/Sign.java 2>&1 | grep -v JAVA_TOOL || true
java --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED --add-exports java.base/sun.security.util=ALL-UNNAMED -cp "$OUT/signer:$TOOLS/apksig.jar" Sign "$OUT/aligned.apk" "$HERE/TusFinanzas.apk" "$KEYSTORE" "$STOREPASS" "$ALIAS" 2>&1 | grep -v JAVA_TOOL
"$TOOLS/aapt2" dump badging "$HERE/TusFinanzas.apk" 2>/dev/null | head -1
ls -la "$HERE/TusFinanzas.apk"
