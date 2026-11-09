package com.nexopc.tusfinanzas;

import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

/** Funciones del celular que la app (JavaScript) puede usar: guardar, compartir, GPS, avisos y mapa. */
public class Bridge {
    final MainActivity act;
    final WebView web;
    final Handler ui = new Handler(Looper.getMainLooper());
    String pendingLocationCb;

    Bridge(MainActivity a, WebView w) { act = a; web = w; }

    // ---------- utilidades ----------
    static boolean safeName(String n) { return n != null && n.matches("[a-z0-9_\\-]+\\.[a-z]{2,5}"); }

    static byte[] readAll(InputStream in) throws Exception {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] b = new byte[16384];
        int r;
        while ((r = in.read(b)) > 0) bo.write(b, 0, r);
        in.close();
        return bo.toByteArray();
    }

    void callback(final String cb, final String json) {
        ui.post(new Runnable() {
            @Override public void run() {
                web.evaluateJavascript("window.tfNative&&window.tfNative(" + JSONObject.quote(cb) + "," + JSONObject.quote(json) + ")", null);
            }
        });
    }

    // ---------- archivos propios de la app ----------
    @JavascriptInterface
    public String readFile(String name) {
        if (!safeName(name)) return "";
        File f = new File(act.getFilesDir(), name);
        if (!f.exists()) return "";
        try { return new String(readAll(new FileInputStream(f)), "UTF-8"); } catch (Exception e) { return ""; }
    }

    @JavascriptInterface
    public boolean writeFile(String name, String content) {
        if (!safeName(name)) return false;
        try {
            File tmp = new File(act.getFilesDir(), name + ".tmp");
            FileOutputStream o = new FileOutputStream(tmp);
            o.write(content.getBytes("UTF-8"));
            o.getFD().sync();
            o.close();
            return tmp.renameTo(new File(act.getFilesDir(), name));
        } catch (Exception e) { return false; }
    }

    @JavascriptInterface
    public void deleteFile(String name) {
        if (safeName(name)) new File(act.getFilesDir(), name).delete();
    }

    // ---------- compartir (recibos, PDF, copias de seguridad) ----------
    @JavascriptInterface
    public boolean share(String base64, String fileName, String mime, String text, String phone) {
        if (!safeName(fileName)) return false;
        try {
            File dir = new File(act.getCacheDir(), "share");
            dir.mkdirs();
            File f = new File(dir, fileName);
            FileOutputStream o = new FileOutputStream(f);
            o.write(Base64.decode(base64, Base64.DEFAULT));
            o.close();
            Uri uri = Uri.parse("content://" + FilesProvider.AUTHORITY + "/" + fileName);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(mime);
            i.putExtra(Intent.EXTRA_STREAM, uri);
            if (text != null && text.length() > 0) i.putExtra(Intent.EXTRA_TEXT, text);
            i.setClipData(ClipData.newRawUri(fileName, uri));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            String wa = whatsappPackage();
            if (phone != null && phone.length() > 0 && wa != null) {
                i.setPackage(wa);
                i.putExtra("jid", phone + "@s.whatsapp.net");
                act.startActivity(i);
            } else {
                Intent ch = Intent.createChooser(i, "Enviar con…");
                ch.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                act.startActivity(ch);
            }
            return true;
        } catch (Exception e) { return false; }
    }

    String whatsappPackage() {
        PackageManager pm = act.getPackageManager();
        String[] pk = {"com.whatsapp", "com.whatsapp.w4b"};
        for (String p : pk) {
            try { pm.getPackageInfo(p, 0); return p; } catch (Exception ignored) { }
        }
        return null;
    }

    @JavascriptInterface
    public void openUrl(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            act.startActivity(i);
        } catch (Exception e) { /* sin app para abrirlo */ }
    }

    @JavascriptInterface
    public boolean isOnline() {
        try {
            ConnectivityManager cm = (ConnectivityManager) act.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo n = cm.getActiveNetworkInfo();
            return n != null && n.isConnected();
        } catch (Exception e) { return false; }
    }

    @JavascriptInterface
    public int versionCode() {
        try { return act.getPackageManager().getPackageInfo(act.getPackageName(), 0).versionCode; } catch (Exception e) { return 0; }
    }

    // ---------- actualizar la app ----------
    static byte[] httpGet(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(20000);
        c.setReadTimeout(120000);
        c.setUseCaches(false);
        c.setRequestProperty("User-Agent", "TusFinanzas/1.0 (Android)");
        c.setRequestProperty("Cache-Control", "no-cache");
        try {
            if (c.getResponseCode() != 200) throw new Exception("http_" + c.getResponseCode());
            return readAll(c.getInputStream());
        } finally { c.disconnect(); }
    }

    @JavascriptInterface
    public void fetchText(final String cb, final String url) {
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    String t = new String(httpGet(url), "UTF-8");
                    JSONObject o = new JSONObject();
                    o.put("ok", true);
                    o.put("text", t);
                    callback(cb, o.toString());
                } catch (Exception e) {
                    callback(cb, "{\"ok\":false,\"error\":\"sin_internet\"}");
                }
            }
        }).start();
    }

    @JavascriptInterface
    public void installApk(final String cb, final String url) {
        if (Build.VERSION.SDK_INT >= 26 && !act.getPackageManager().canRequestPackageInstalls()) {
            try {
                Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + act.getPackageName()));
                act.startActivity(i);
            } catch (Exception ignored) { }
            callback(cb, "{\"ok\":false,\"error\":\"permiso_instalar\"}");
            return;
        }
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    byte[] apk = httpGet(url);
                    if (apk.length < 10000 || apk[0] != 'P' || apk[1] != 'K') throw new Exception("archivo_invalido");
                    File dir = new File(act.getCacheDir(), "share");
                    dir.mkdirs();
                    FileOutputStream o = new FileOutputStream(new File(dir, "actualizacion.apk"));
                    o.write(apk);
                    o.close();
                    ui.post(new Runnable() {
                        @Override public void run() {
                            try {
                                Uri uri = Uri.parse("content://" + FilesProvider.AUTHORITY + "/actualizacion.apk");
                                Intent i = new Intent(Intent.ACTION_VIEW);
                                i.setDataAndType(uri, "application/vnd.android.package-archive");
                                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                                act.startActivity(i);
                                callback(cb, "{\"ok\":true}");
                            } catch (Exception e) {
                                callback(cb, "{\"ok\":false,\"error\":\"instalador\"}");
                            }
                        }
                    });
                } catch (Exception e) {
                    callback(cb, "{\"ok\":false,\"error\":\"sin_internet\"}");
                }
            }
        }).start();
    }

    @JavascriptInterface
    public String version() {
        try { return act.getPackageManager().getPackageInfo(act.getPackageName(), 0).versionName; } catch (Exception e) { return ""; }
    }

    // ---------- GPS ----------
    @JavascriptInterface
    public void requestLocation(final String cb) {
        ui.post(new Runnable() {
            @Override public void run() {
                if (!act.hasLocationPermission()) {
                    pendingLocationCb = cb;
                    act.askLocationPermission();
                } else {
                    getLocation(cb);
                }
            }
        });
    }

    void onLocationPermission(boolean ok) {
        String cb = pendingLocationCb;
        pendingLocationCb = null;
        if (cb == null) return;
        if (ok) getLocation(cb);
        else callback(cb, "{\"ok\":false,\"error\":\"permiso\"}");
    }

    void getLocation(final String cb) {
        final LocationManager lm = (LocationManager) act.getSystemService(Context.LOCATION_SERVICE);
        final boolean[] done = {false};
        try {
            Location best = null;
            for (String p : lm.getProviders(true)) {
                Location l = lm.getLastKnownLocation(p);
                if (l != null && (best == null || l.getTime() > best.getTime())) best = l;
            }
            if (best != null && System.currentTimeMillis() - best.getTime() < 60000 && best.getAccuracy() < 60) {
                sendLocation(cb, best);
                return;
            }
            final Location fallback = best;
            final LocationListener ll = new LocationListener() {
                @Override public void onLocationChanged(Location l) {
                    if (done[0]) return;
                    done[0] = true;
                    lm.removeUpdates(this);
                    sendLocation(cb, l);
                }
                @Override public void onStatusChanged(String p, int s, Bundle b) { }
                @Override public void onProviderEnabled(String p) { }
                @Override public void onProviderDisabled(String p) { }
            };
            boolean any = false;
            if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, ll, Looper.getMainLooper());
                any = true;
            }
            if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, ll, Looper.getMainLooper());
                any = true;
            }
            if (!any) {
                callback(cb, "{\"ok\":false,\"error\":\"gps_apagado\"}");
                return;
            }
            ui.postDelayed(new Runnable() {
                @Override public void run() {
                    if (done[0]) return;
                    done[0] = true;
                    lm.removeUpdates(ll);
                    if (fallback != null) sendLocation(cb, fallback);
                    else callback(cb, "{\"ok\":false,\"error\":\"sin_senal\"}");
                }
            }, 30000);
        } catch (SecurityException e) {
            callback(cb, "{\"ok\":false,\"error\":\"permiso\"}");
        }
    }

    void sendLocation(String cb, Location l) {
        callback(cb, "{\"ok\":true,\"lat\":" + l.getLatitude() + ",\"lon\":" + l.getLongitude()
                + ",\"acc\":" + Math.round(l.getAccuracy()) + "}");
    }

    // ---------- mapa sin internet (se descarga una vez de OpenStreetMap) ----------
    @JavascriptInterface
    public void downloadMap(final String cb, final String query) {
        new Thread(new Runnable() {
            @Override public void run() {
                String[] servers = {"https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"};
                String err = "sin_internet";
                for (String s : servers) {
                    HttpURLConnection c = null;
                    try {
                        c = (HttpURLConnection) new URL(s).openConnection();
                        c.setConnectTimeout(20000);
                        c.setReadTimeout(120000);
                        c.setRequestMethod("POST");
                        c.setDoOutput(true);
                        c.setRequestProperty("User-Agent", "TusFinanzas/1.0 (Android; mapa sin internet)");
                        c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                        OutputStream o = c.getOutputStream();
                        o.write(("data=" + URLEncoder.encode(query, "UTF-8")).getBytes("UTF-8"));
                        o.close();
                        if (c.getResponseCode() != 200) { err = "servidor_" + c.getResponseCode(); continue; }
                        byte[] data = readAll(c.getInputStream());
                        FileOutputStream f = new FileOutputStream(new File(act.getFilesDir(), "map_raw.json"));
                        f.write(data);
                        f.close();
                        callback(cb, "{\"ok\":true,\"bytes\":" + data.length + "}");
                        return;
                    } catch (Exception e) {
                        err = "sin_internet";
                    } finally {
                        if (c != null) c.disconnect();
                    }
                }
                callback(cb, "{\"ok\":false,\"error\":\"" + err + "\"}");
            }
        }).start();
    }

    // ---------- avisos diarios ----------
    @JavascriptInterface
    public void setAgenda(String json) {
        SharedPreferences p = act.getSharedPreferences("avisos", Context.MODE_PRIVATE);
        p.edit().putString("agenda", json).apply();
        AlarmReceiver.schedule(act);
    }

    @JavascriptInterface
    public void askNotifications() {
        ui.post(new Runnable() { @Override public void run() { act.askNotificationPermission(); } });
    }
}
