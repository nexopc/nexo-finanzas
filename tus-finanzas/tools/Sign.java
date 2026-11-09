import com.android.apksig.ApkSigner;
import java.io.*;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.*;
public class Sign {
  public static void main(String[] a) throws Exception {
    // a: in out keystore storepass alias
    KeyStore ks = KeyStore.getInstance("PKCS12");
    try (FileInputStream f = new FileInputStream(a[2])) { ks.load(f, a[3].toCharArray()); }
    PrivateKey pk = (PrivateKey) ks.getKey(a[4], a[3].toCharArray());
    X509Certificate c = (X509Certificate) ks.getCertificate(a[4]);
    ApkSigner.SignerConfig sc = new ApkSigner.SignerConfig.Builder("CERT", pk, Collections.singletonList(c)).build();
    new ApkSigner.Builder(Collections.singletonList(sc)).setInputApk(new File(a[0])).setOutputApk(new File(a[1]))
      .setMinSdkVersion(24).setV1SigningEnabled(false).setV2SigningEnabled(true).build().sign();
    System.out.println("signed " + a[1]);
  }
}
