    case 'security':sheetSecurity();break;
    case 'faceon':await faceRegister();sheetSecurity();break;
    case 'faceoff':S.me.face=null;persist();sheetSecurity();break;
    case 'lock':layer='';S.me.unlocked=false;chooseLockMode();render();break;
    case 'faceid':faceCheck();break;
    case 'usepin':S.me.lockMode='pin';render();break;
    case 'useface':S.me.lockMode='face';render();faceCheck();break;
    case 'pin':{if(v==='x')pinBuf=pinBuf.slice(0,-1);else if(pinBuf.length<4)pinBuf+=v;
      if(pinBuf.length===4){if(pinBuf===S.me.pin){unlock();break}const d=$('#dots');pinBuf='';render();const d2=$('#dots');d2&&d2.classList.add('shake');break}render();break}
