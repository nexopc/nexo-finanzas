"""Arma app/index.html juntando el código nuevo con la parte de préstamos de la app de oro.
Uso: python3 clientes/prestamos-agenda/src/armar.py"""
import re, pathlib
here=pathlib.Path(__file__).parent
oro=(here.parent.parent/'oro-prestamos/app/index.html').read_text().split('\n')
L=lambda a,b:'\n'.join(oro[a-1:b])
def must(s,old,new):
    assert old in s, 'no encontré: '+old[:70]
    return s.replace(old,new,1)

css=L(16,153)
A='\n'.join(l for l in oro[187:224] if not l.startswith('function toast('))
B=L(274,324); C=L(351,368); D=L(492,526)+'\n'+L(528,528)
E=L(671,852); F=L(1024,1036); O1=L(1063,1085); O2=L(1100,1108)

# --- ajustes a la parte de préstamos ---
E=must(E,"${dc.includes('Dirección')?","${dc.includes('Barrio')?`<label class=\"field\"><span>Barrio</span><input name=\"barrio\"></label>`:''}${dc.includes('Dirección')?")
E=must(E,"${dc.includes('Codeudor')?`<label class=\"field\"><span>Codeudor</span>","${dc.includes('Fiador')?`<label class=\"field\"><span>Fiador</span>")
E=must(E,'<label class="field"><span>Fecha del préstamo</span><input name="inicio" type="date" value="${today()}"></label></div>',
  '<label class="field"><span>Fecha del préstamo</span><input name="inicio" type="date" value="${today()}"></label></div>\n   <label class="field"><span>Hora de entrega (opcional · sale en tu agenda)</span><input name="hent" type="time"></label>')
E=must(E,"cedula:g('cedula'),dir:g('dir'),","cedula:g('cedula'),dir:g('dir'),barrio:g('barrio'),")
E=must(E,"['cel','cedula','dir','codeudor','notas'].forEach","['cel','cedula','dir','barrio','codeudor','notas'].forEach")
E=must(E,"  put(p,true);\n  if(cuaderno)","  put(p,true);\n  const hent=f.hent?f.hent.value:'';if(hent&&!cuaderno)put({id:uid(),k:'ev',tipo:'entrega',titulo:'Entregar a '+nombre,nota:money(x.monto),fecha:p.inicio,hora:hent,aviso:15,rep:'no',hechos:{},prestamo:p.id},true);\n  if(cuaderno)")
E=must(E,"[['Celular',cl.cel],['Cédula',cl.cedula],['Dirección',cl.dir],['Codeudor',cl.codeudor]","[['Celular',cl.cel],['Cédula',cl.cedula],['Barrio',cl.barrio],['Dirección',cl.dir],['Fiador',cl.codeudor]")
F=must(F,"['dir','Dirección'],['codeudor','Codeudor']","['barrio','Barrio'],['dir','Dirección'],['codeudor','Fiador']")
F=must(F,'Guarda un archivo con todo. Si cambian de celular o se borra Safari, lo recuperan desde aquí.','Tus datos viven solo en este iPhone. Guarda una copia cada semana en Archivos (iCloud) o mándatela por WhatsApp. Si cambias de celular, la recuperas desde aquí.')
D=must(D,'<div class="logo">${esc(initials(c.nombre))}</div>','<span class="appi xl">${logoSvg()}</span>')

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
js=(here/'p1.js').read_text()+(here/'p2.js').read_text()+(here/'p3.js').read_text()+(here/'p4.js').read_text()
for k,v in {'/*@A*/':A,'/*@B*/':B,'/*@C*/':C,'/*@D*/':D,'/*@E*/':E,'/*@F*/':F,'/*@OLD1*/':O1,'/*@OLD2*/':O2}.items():
    js=must(js,k,v)
# logo con la inicial del negocio
js=js.replace("const logoSvg=()=>`<svg viewBox=\"0 0 100 100\"><use href=\"#logo\"/></svg>`;",
 "const logoSvg=()=>{const c=S.items&&S.items.cfg;const L=(S.me&&S.me.iconL)||(c&&c.nombre?c.nombre.trim().replace(/^cobros\\s+/i,'').charAt(0).toUpperCase():'');return `<svg viewBox=\"0 0 100 100\"><use href=\"#ring\"/>${L?`<text x=\"50\" y=\"53\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-family=\"Georgia,'Times New Roman',serif\" font-size=\"44\" font-weight=\"600\" fill=\"url(#gold)\">${esc(L)}</text>`:'<use href=\"#chk\"/>'}</svg>`};")
out=here.parent/'app/index.html'
out.write_text(head+js)
print('app/index.html', len(head+js)//1024, 'KB')
