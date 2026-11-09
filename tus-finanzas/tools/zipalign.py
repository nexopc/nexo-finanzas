"""Agrega classes.dex al APK y alinea los archivos sin comprimir a 4 bytes (lo que pide Android).
Uso: python3 zipalign.py base.apk classes.dex salida.apk"""
import struct
import sys
import zipfile

src, dex, out = sys.argv[1:4]
STORE_EXT = ('.png', '.arsc', '.jpg', '.webp')


def padding_extra(offset_after_name, extra_len_now=0):
    """Campo extra 0xD935 (el mismo que usa zipalign) con relleno hasta múltiplo de 4."""
    base = offset_after_name + extra_len_now
    pad = (-(base + 6)) % 4
    return struct.pack('<HHH', 0xD935, 2 + pad, 4) + b'\x00' * pad


with zipfile.ZipFile(src) as zin, zipfile.ZipFile(out, 'w') as zout:
    entries = [(i, zin.read(i.filename)) for i in zin.infolist() if not i.filename.startswith('META-INF/')]
    entries.insert(1, (zipfile.ZipInfo('classes.dex', date_time=(2008, 1, 1, 0, 0, 0)), open(dex, 'rb').read()))
    for info, data in entries:
        zi = zipfile.ZipInfo(info.filename, date_time=(2008, 1, 1, 0, 0, 0))
        zi.external_attr = 0o644 << 16
        stored = info.filename == 'resources.arsc' or info.filename.endswith(STORE_EXT) or info.compress_type == zipfile.ZIP_STORED
        zi.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
        if stored:
            header_end = zout.fp.tell() + 30 + len(zi.filename.encode('utf-8'))
            zi.extra = padding_extra(header_end)
        zout.writestr(zi, data)

with zipfile.ZipFile(out) as z:
    for i in z.infolist():
        if i.compress_type == zipfile.ZIP_STORED:
            off = i.header_offset + 30 + len(i.filename.encode()) + len(i.extra)
            assert off % 4 == 0, (i.filename, off)
print('alineado:', out)
