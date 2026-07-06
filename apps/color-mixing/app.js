// apps/color-mixing/app.js
// Make previews visible, bind controls, enable top-button mode switching, and add simple 3D effect.

function bindRangeNumber(rangeEl, numEl, onChange){
  function syncFromRange(){
    numEl.value = rangeEl.value;
    onChange && onChange(Number(rangeEl.value));
  }
  function syncFromNumber(){
    let v = Number(numEl.value);
    if (Number.isNaN(v)) v = Number(rangeEl.min);
    v = Math.max(Number(rangeEl.min), Math.min(Number(rangeEl.max), v));
    rangeEl.value = v;
    onChange && onChange(Number(v));
  }
  rangeEl.addEventListener('input', syncFromRange);
  numEl.addEventListener('input', syncFromNumber);
  // initial
  numEl.value = rangeEl.value;
}

function toHex(r,g,b){
  return '#'+[r,g,b].map(v=>Number(v).toString(16).padStart(2,'0')).join('').toUpperCase();
}

function updateRGBPreview(container, r,g,b, infoEl){
  const css = `rgb(${r}, ${g}, ${b})`;
  container.style.background = css;
  // contrast border color
  const brightness = (Number(r)*299 + Number(g)*587 + Number(b)*114)/1000;
  container.style.borderColor = brightness < 160 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
  // label
  let label = container.querySelector('.label');
  if(!label){ label = document.createElement('div'); label.className='label'; container.appendChild(label); }
  label.textContent = `${toHex(r,g,b)} \nRGB:${r},${g},${b}`.replace(' \n',' ');
  if(infoEl) infoEl.textContent = `RGB: ${r}, ${g}, ${b} ／ HEX: ${toHex(r,g,b)}`;
}

function cmyToRgb(c,m,y){
  const R = Math.round(255 * (1 - c/100));
  const G = Math.round(255 * (1 - m/100));
  const B = Math.round(255 * (1 - y/100));
  return [R,G,B];
}

function rgbDiff(a,b){
  const dr=a[0]-b[0], dg=a[1]-b[1], db=a[2]-b[2];
  return Math.sqrt(dr*dr+dg*dg+db*db);
}

function setMode(mode){
  const map = { 'add':'additive', 'sub':'subtractive', 'compare':'compare' };
  document.querySelectorAll('.mode-panel').forEach(p=>p.classList.add('hidden'));
  const id = map[mode];
  if(id){ document.getElementById(id).classList.remove('hidden'); }
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('mode-'+(mode==='add'?'add': mode==='sub'?'sub':'compare')).classList.add('active');
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Mode buttons
  document.getElementById('mode-add').addEventListener('click', ()=>setMode('add'));
  document.getElementById('mode-sub').addEventListener('click', ()=>setMode('sub'));
  document.getElementById('mode-compare').addEventListener('click', ()=>setMode('compare'));

  // Additive
  const r = document.getElementById('r'), g = document.getElementById('g'), b = document.getElementById('b');
  const rNum = document.getElementById('r-num'), gNum = document.getElementById('g-num'), bNum = document.getElementById('b-num');
  const addPreview = document.getElementById('add-preview'), addInfo = document.getElementById('add-info');
  // ensure preview visible and 3D class
  addPreview.classList.add('raised');
  const updateAdd = ()=> updateRGBPreview(addPreview, Number(r.value), Number(g.value), Number(b.value), addInfo);
  bindRangeNumber(r, rNum, ()=>updateAdd());
  bindRangeNumber(g, gNum, ()=>updateAdd());
  bindRangeNumber(b, bNum, ()=>updateAdd());
  updateAdd();

  // Subtractive
  const c = document.getElementById('c'), m = document.getElementById('m'), y = document.getElementById('y');
  const cNum = document.getElementById('c-num'), mNum = document.getElementById('m-num'), yNum = document.getElementById('y-num');
  const subPreview = document.getElementById('sub-preview'), subInfo = document.getElementById('sub-info');
  subPreview.classList.add('raised');
  const updateSub = ()=>{
    const [R,G,B] = cmyToRgb(Number(c.value), Number(m.value), Number(y.value));
    updateRGBPreview(subPreview, R,G,B, subInfo);
    subInfo.textContent = `CMY: ${c.value}%, ${m.value}%, ${y.value}%`;
  }
  bindRangeNumber(c, cNum, ()=>updateSub());
  bindRangeNumber(m, mNum, ()=>updateSub());
  bindRangeNumber(y, yNum, ()=>updateSub());
  updateSub();

  // Compare
  const cr = document.getElementById('cr'), cg = document.getElementById('cg'), cb = document.getElementById('cb');
  const crN = document.getElementById('cr-num'), cgN = document.getElementById('cg-num'), cbN = document.getElementById('cb-num');
  const cmpAddPrev = document.getElementById('cmp-add-preview'), cmpAddInfo = document.getElementById('cmp-add-info');
  const cc = document.getElementById('cc'), cm = document.getElementById('cm'), cy = document.getElementById('cy');
  const ccN = document.getElementById('cc-num'), cmN = document.getElementById('cm-num'), cyN = document.getElementById('cy-num');
  const cmpSubPrev = document.getElementById('cmp-sub-preview'), cmpSubInfo = document.getElementById('cmp-sub-info');
  const cmpDiffEl = document.getElementById('cmp-diff');
  cmpAddPrev.classList.add('raised'); cmpSubPrev.classList.add('raised');

  const updateCmp = ()=>{
    updateRGBPreview(cmpAddPrev, Number(cr.value), Number(cg.value), Number(cb.value), cmpAddInfo);
    const subRgb = cmyToRgb(Number(cc.value), Number(cm.value), Number(cy.value));
    updateRGBPreview(cmpSubPrev, subRgb[0], subRgb[1], subRgb[2], cmpSubInfo);
    const addRgb = [Number(cr.value), Number(cg.value), Number(cb.value)];
    const diff = rgbDiff(addRgb, subRgb);
    cmpDiffEl.textContent = `RGB 差分 (Euclid): ${diff.toFixed(1)} （0 は完全一致）`;
  }
  bindRangeNumber(cr, crN, updateCmp);
  bindRangeNumber(cg, cgN, updateCmp);
  bindRangeNumber(cb, cbN, updateCmp);
  bindRangeNumber(cc, ccN, updateCmp);
  bindRangeNumber(cm, cmN, updateCmp);
  bindRangeNumber(cy, cyN, updateCmp);
  updateCmp();

  // ensure default mode is additive
  setMode('add');
});
