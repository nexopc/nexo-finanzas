"""Genera los íconos de Tus Finanzas (launcher y aviso). Uso: python3 make_icons.py"""
import pathlib
from PIL import Image, ImageDraw, ImageFont
FONT = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'

root = pathlib.Path(__file__).parent / 'android' / 'res'
VERDE = (14, 122, 69, 255)
OSCURO = (17, 24, 39, 255)
BLANCO = (255, 255, 255, 255)
AMBAR = (245, 165, 36, 255)


def dollar(d, cx, cy, s, color, w=None):
    """Signo $ con letra Inter ExtraBold, centrado."""
    f = ImageFont.truetype(FONT, int(s * 0.5))
    d.text((cx, cy), '$', font=f, fill=color, anchor='mm')


def icon(size, round_=False):
    big = size * 4
    im = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if round_:
        d.ellipse([0, 0, big - 1, big - 1], fill=OSCURO)
    else:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * 0.23), fill=OSCURO)
    # círculo verde (entra plata) y punto ámbar (toca hoy)
    m = big * 0.18
    d.ellipse([m, m, big - m, big - m], fill=VERDE)
    dollar(d, big / 2, big / 2, big, BLANCO, int(big * 0.07))
    a = big * 0.13
    d.ellipse([big - m - a, m - a * 0.2, big - m + a * 0.2, m + a], fill=AMBAR, outline=OSCURO, width=int(big * 0.025))
    return im.resize((size, size), Image.LANCZOS)


def stat(size):
    big = size * 4
    im = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    dollar(d, big / 2, big / 2, big * 1.9, BLANCO)
    return im.resize((size, size), Image.LANCZOS)


dens = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
for k, s in dens.items():
    p = root / f'mipmap-{k}'
    p.mkdir(parents=True, exist_ok=True)
    icon(s).save(p / 'ic_launcher.png')
    icon(s, True).save(p / 'ic_launcher_round.png')
for k, s in {'mdpi': 24, 'hdpi': 36, 'xhdpi': 48, 'xxhdpi': 72, 'xxxhdpi': 96}.items():
    p = root / f'drawable-{k}'
    p.mkdir(parents=True, exist_ok=True)
    stat(s).save(p / 'ic_stat.png')
web = pathlib.Path(__file__).parent / 'web'
icon(192).save(web / 'icon.png')
print('íconos listos')
