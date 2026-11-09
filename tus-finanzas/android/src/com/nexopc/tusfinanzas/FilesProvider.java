package com.nexopc.tusfinanzas;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/** Entrega a WhatsApp, Drive, etc. los archivos que la app comparte (recibos, PDF, copias). Solo lectura. */
public class FilesProvider extends ContentProvider {
    static final String AUTHORITY = "com.nexopc.tusfinanzas.files";

    File fileFor(Uri uri) throws FileNotFoundException {
        String name = uri.getLastPathSegment();
        if (!Bridge.safeName(name)) throw new FileNotFoundException();
        File f = new File(new File(getContext().getCacheDir(), "share"), name);
        if (!f.exists()) throw new FileNotFoundException();
        return f;
    }

    @Override public boolean onCreate() { return true; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(fileFor(uri), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] proj, String sel, String[] args, String sort) {
        try {
            File f = fileFor(uri);
            MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
            c.addRow(new Object[]{f.getName(), f.length()});
            return c;
        } catch (Exception e) { return null; }
    }

    @Override
    public String getType(Uri uri) {
        String n = uri.getLastPathSegment();
        if (n == null) return "application/octet-stream";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".pdf")) return "application/pdf";
        if (n.endsWith(".json")) return "application/json";
        if (n.endsWith(".apk")) return "application/vnd.android.package-archive";
        return "application/octet-stream";
    }

    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String s, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
