package com.nexopc.tusfinanzas;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONObject;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/** Aviso diario: "Hoy tienes X cobros por $Y". La app guarda la agenda cada vez que cambia algo. */
public class AlarmReceiver extends BroadcastReceiver {
    static final String CHANNEL = "cobros";

    static JSONObject agenda(Context c) {
        try {
            String s = c.getSharedPreferences("avisos", Context.MODE_PRIVATE).getString("agenda", "");
            return s.length() > 0 ? new JSONObject(s) : null;
        } catch (Exception e) { return null; }
    }

    static void schedule(Context c) {
        JSONObject a = agenda(c);
        int h = 7, m = 0;
        boolean on = true;
        if (a != null) {
            on = a.optBoolean("activo", true);
            String[] hm = a.optString("hora", "07:00").split(":");
            try { h = Integer.parseInt(hm[0]); m = Integer.parseInt(hm[1]); } catch (Exception ignored) { }
        }
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = PendingIntent.getBroadcast(c, 1, new Intent(c, AlarmReceiver.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.cancel(pi);
        if (!on) return;
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, h);
        cal.set(Calendar.MINUTE, m);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 5000) cal.add(Calendar.DAY_OF_MONTH, 1);
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
    }

    @Override
    public void onReceive(Context c, Intent intent) {
        try { notifyToday(c); } catch (Exception ignored) { }
        schedule(c);
    }

    static void notifyToday(Context c) throws Exception {
        JSONObject a = agenda(c);
        if (a == null || !a.optBoolean("activo", true)) return;
        String hoy = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Calendar.getInstance().getTime());
        JSONObject d = a.optJSONObject("dias") != null ? a.optJSONObject("dias").optJSONObject(hoy) : null;
        int n = d != null ? d.optInt("n", 0) : 0;
        long total = d != null ? d.optLong("total", 0) : 0;
        int atr = d != null ? d.optInt("atrasados", 0) : a.optInt("atrasados", 0);
        if (n == 0 && atr == 0) return;

        NumberFormat nf = NumberFormat.getIntegerInstance(new Locale("es", "CO"));
        String title = n > 0 ? "Hoy tienes " + n + (n == 1 ? " cobro" : " cobros") + " por $" + nf.format(total).replace(',', '.')
                : "Hoy no tienes cobros nuevos";
        String text = atr > 0 ? (atr == 1 ? "1 cliente atrasado. " : atr + " clientes atrasados. ") + "Abre tu ruta del día."
                : "Abre tu ruta del día.";

        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Cobros del día", NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
            b = new Notification.Builder(c, CHANNEL);
        } else {
            b = new Notification.Builder(c);
        }
        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 2, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setSmallIcon(R.drawable.ic_stat).setContentTitle(title).setContentText(text)
                .setColor(0xFF0E7A45).setAutoCancel(true).setContentIntent(pi);
        nm.notify(100, b.build());
    }
}
