"""Arma app/index.html. La parte de préstamos (o_*.js) vino de la app de oro y ya es propia de esta app.
Uso: python3 clientes/prestamos-agenda/src/armar.py"""
import re, pathlib
here=pathlib.Path(__file__).parent
rd=lambda n:(here/n).read_text().rstrip('\n')
css=rd('o_css.css');A=rd('o_A.js');B=rd('o_B.js');C=rd('o_C.js');D=rd('o_D.js');E=rd('o_E.js');F=rd('o_F.js');O1=rd('o_O1.js');O2=rd('o_O2.js')
oro=(here.parent.parent/'oro-prestamos/app/index.html').read_text().split('\n')  # solo para los íconos
def must(s,old,new):
    assert old in s, 'no encontré: '+old[:70]
    return s.replace(old,new,1)

# --- íconos: los premium del boceto + los que usa la parte de préstamos ---
bo=(here.parent/'boceto.html').read_text()
sym=re.search(r'<svg width="0" height="0".*?</svg>',bo,re.S).group(0)
sym=re.sub(r'\s*<symbol id="logo".*?</symbol>','',sym,flags=re.S)
get=lambda i:re.search(r'<symbol id="%s" viewBox="0 0 24 24">(.*?)</symbol>'%i,sym,re.S).group(1)
oro_s='\n'.join(l for l in oro[160:182] if re.search(r'id="(editar|chev|right|gear|trash|refresh|face|caja)"',l))
extra=f'''
 <symbol id="presta" viewBox="0 0 24 24">{get('hand')}</symbol>
 <symbol id="cobra" viewBox="0 0 24 24">{get('coin')}</symbol>
 <symbol id="enviar" viewBox="0 0 24 24">{get('send')}</symbol>
 <symbol id="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="url(#gold)" stroke-width="2.4"/><circle cx="50" cy="50" r="32.5" fill="none" stroke="url(#gold)" stroke-width=".8" stroke-opacity=".55"/><g stroke="url(#gold)" stroke-width="2.4" stroke-linecap="round"><path d="M50 9v5M91 50h-5M50 91v-5M9 50h5"/></g><circle cx="76" cy="24" r="3" fill="url(#gold)"/></symbol>
 <symbol id="chk" viewBox="0 0 100 100"><path d="M33 51l11 11 23-25" fill="none" stroke="url(#gold)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
{oro_s}
</svg>'''
sym=sym.replace('</svg>',extra,1)

head=(here/'head.html').read_text().replace('/*ORO_CSS*/',css).replace('/*SYMBOLS*/',sym)
js=(here/'p1.js').read_text()+(here/'p2.js').read_text()+(here/'p3.js').read_text()+(here/'p5.js').read_text()+(here/'p4.js').read_text()
for k,v in {'/*@A*/':A,'/*@B*/':B,'/*@C*/':C,'/*@D*/':D,'/*@E*/':E,'/*@F*/':F,'/*@OLD1*/':O1,'/*@OLD2*/':O2}.items():
    js=must(js,k,v)
# logo con la inicial del negocio
js=js.replace("const logoSvg=()=>`<svg viewBox=\"0 0 100 100\"><use href=\"#logo\"/></svg>`;",
 "const logoSvg=()=>{const c=S.items&&S.items.cfg;const L=(S.me&&S.me.iconL)||(c&&c.nombre?c.nombre.trim().replace(/^cobros\\s+/i,'').charAt(0).toUpperCase():'');return `<svg viewBox=\"0 0 100 100\"><use href=\"#ring\"/>${L?`<text x=\"50\" y=\"53\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-family=\"Georgia,'Times New Roman',serif\" font-size=\"44\" font-weight=\"600\" fill=\"url(#gold)\">${esc(L)}</text>`:'<use href=\"#chk\"/>'}</svg>`};")
out=here.parent/'app/index.html'
out.write_text(head+js)
print('app/index.html', len(head+js)//1024, 'KB')
