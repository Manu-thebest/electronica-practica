// === Calculadora Buck ===
function calcBuck() {
  const Vin = parseFloat(document.getElementById('buck-vin').value);
  const Vout = parseFloat(document.getElementById('buck-vout').value);
  const Iout = parseFloat(document.getElementById('buck-iout').value);
  const fsw = parseFloat(document.getElementById('buck-fsw').value) * 1000;
  const ripplePct = parseFloat(document.getElementById('buck-ripple').value) / 100;

  if (isNaN(Vin) || isNaN(Vout) || isNaN(Iout)) { alert('Completa todos los campos'); return; }

  const D = Vout / Vin;
  const deltaI = Iout * ripplePct;
  const L = ((Vin - Vout) * D) / (fsw * deltaI) * 1e6;  // µH
  const Cout = deltaI / (8 * fsw * (Vout * 0.01)) * 1e6;  // µF (1% ripple V)
  const IL_peak = Iout + deltaI / 2;
  const IL_avg = Iout;
  const Pin = Vin * Iout * (1 / 0.9); // asumiendo 90% eficiencia
  const Pmosfet = (Iout * Iout) * 0.05 * D; // Rds(on) ~ 0.05 ohm

  document.getElementById('buck-result').innerHTML = `
    <div class="value">Duty Cycle (D) = ${(D*100).toFixed(1)}%</div>
    <div class="value">Inductancia mínima = ${L.toFixed(1)} µH → usar ${(Math.ceil(L/10)*10).toFixed(0)} µH o ${(Math.ceil(L/4.7)*4.7).toFixed(1)} µH</div>
    <div class="value">Condensador salida = ${Cout.toFixed(0)} µF → usar ${Math.max(10, Math.ceil(Cout/10)*10)} µF/${Vout<=5?"10":"16"}V</div>
    <div class="value">Corriente pico inductor = ${IL_peak.toFixed(2)} A</div>
    <div class="value">Potencia entrada ≈ ${Pin.toFixed(1)} W | P MOSFET ≈ ${Pmosfet.toFixed(2)} W</div>
    <div class="value">$V_{out} = D \times V_{in} = ${Vout.toFixed(2)}V</div>
  `;
}

// === Calculadora Boost ===
function calcBoost() {
  const Vin = parseFloat(document.getElementById('boost-vin').value);
  const Vout = parseFloat(document.getElementById('boost-vout').value);
  const Iout = parseFloat(document.getElementById('boost-iout').value);
  const fsw = parseFloat(document.getElementById('boost-fsw').value) * 1000;

  const D = 1 - (Vin / Vout);
  const deltaI = Iout * 0.3 * (Vout/Vin); // approximate
  const L = (Vin * D) / (fsw * deltaI) * 1e6;
  const Cout = (Iout * D) / (fsw * (Vout * 0.01)) * 1e6;
  const IL_avg = Iout / (1 - D);

  document.getElementById('boost-result').innerHTML = `
    <div class="value">Duty Cycle (D) = ${(D*100).toFixed(1)}%</div>
    <div class="value">Inductancia = ${L.toFixed(1)} µH</div>
    <div class="value">Condensador salida = ${Cout.toFixed(0)} µF → usar ${Math.ceil(Cout/47)*47} µF/${Math.ceil(Vout/5)*5}V</div>
    <div class="value">Corriente media inductor = ${IL_avg.toFixed(2)} A</div>
    <div class="value">$V_{out} = V_{in}/(1-D) = ${Vout.toFixed(1)}V</div>
  `;
}

// === Calculadora Flyback ===
function calcFlyback() {
  const Vin = parseFloat(document.getElementById('fly-vin').value);
  const Vout = parseFloat(document.getElementById('fly-vout').value);
  const Iout = parseFloat(document.getElementById('fly-iout').value);
  const fsw = parseFloat(document.getElementById('fly-fsw').value) * 1000;
  const Nratio = parseFloat(document.getElementById('fly-n').value);

  const Dmax = 0.45;
  const D = (Vout * Nratio) / (Vin + Vout * Nratio);
  const Lp = (Vin * Dmax) / (fsw * Iout * 0.3 * (Vout/Vin)) * 1e6;
  const Cout = (Iout * D) / (fsw * (Vout * 0.02)) * 1e6;

  document.getElementById('fly-result').innerHTML = `
    <div class="value">Duty Cycle = ${(D*100).toFixed(1)}% (máx recomendado: 45%)</div>
    <div class="value">Inductancia primario Lp = ${Lp.toFixed(0)} µH</div>
    <div class="value">Condensador salida = ${Cout.toFixed(0)} µF → usar ${Math.ceil(Cout/100)*100} µF</div>
    <div class="value">Relación transformador N = ${Nratio.toFixed(2)}:1</div>
    <div class="value">$V_{out} = V_{in} \times D/(1-D) \times N = ${Vout}V</div>
  `;
}

// === Calculadora Filtro RC ===
function calcRC() {
  const R = parseFloat(document.getElementById('rc-r').value) * (document.getElementById('rc-r-unit').value === 'k' ? 1e3 : document.getElementById('rc-r-unit').value === 'M' ? 1e6 : 1);
  const C = parseFloat(document.getElementById('rc-c').value) * (document.getElementById('rc-c-unit').value === 'u' ? 1e-6 : document.getElementById('rc-c-unit').value === 'n' ? 1e-9 : 1e-12);
  const type = document.getElementById('rc-type').value;

  const fc = 1 / (2 * Math.PI * R * C);
  const tau = R * C;

  let gain_info = '';
  if (type === 'lp') gain_info = `Ganancia en DC = 0 dB. Atenuación -20dB/década sobre ${fc.toFixed(1)} Hz.`;
  else gain_info = `Ganancia en HF = 0 dB. Atenuación -20dB/década bajo ${fc.toFixed(1)} Hz.`;

  document.getElementById('rc-result').innerHTML = `
    <div class="value">Frecuencia de corte fc = ${fc.toFixed(2)} Hz</div>
    <div class="value">Constante de tiempo τ = ${(tau*1000).toFixed(3)} ms</div>
    <div class="value">Carga al 63.2% en ${(tau*1000).toFixed(2)} ms. Full ≈ ${(tau*5000).toFixed(0)} ms</div>
    <div class="value">${gain_info}</div>
  `;
}

// === Calculadora Divisor de Voltaje ===
function calcDivider() {
  const Vin = parseFloat(document.getElementById('div-vin').value);
  const R1 = parseFloat(document.getElementById('div-r1').value) * (document.getElementById('div-r1-unit').value === 'k' ? 1e3 : 1e6);
  const R2 = parseFloat(document.getElementById('div-r2').value) * (document.getElementById('div-r2-unit').value === 'k' ? 1e3 : 1e6);

  const Vout = Vin * (R2 / (R1 + R2));
  const I = Vin / (R1 + R2);
  const P1 = I * I * R1 * 1000;
  const P2 = I * I * R2 * 1000;

  document.getElementById('div-result').innerHTML = `
    <div class="value">Vout = ${Vout.toFixed(3)} V</div>
    <div class="value">Corriente divisor = ${(I*1e6).toFixed(1)} µA</div>
    <div class="value">P R1 = ${P1.toFixed(2)} mW | P R2 = ${P2.toFixed(2)} mW</div>
    <div class="value">Impedancia salida ≈ ${(R1*R2/(R1+R2)).toFixed(0)} Ω</div>
  `;
}

// === Calculadora Zener ===
function calcZener() {
  const Vin = parseFloat(document.getElementById('zen-vin').value);
  const Vz = parseFloat(document.getElementById('zen-vz').value);
  const IL = parseFloat(document.getElementById('zen-il').value) / 1000;
  const Iz_min = parseFloat(document.getElementById('zen-izmin').value) / 1000;

  const Rs = (Vin - Vz) / (Iz_min + IL);
  const Pz = Vz * Iz_min;
  const Pmax = Vz * (Vin - Vz) / Rs;
  const Iz_max = (Vin - Vz) / Rs - IL;

  document.getElementById('zen-result').innerHTML = `
    <div class="value">Rs = ${Rs.toFixed(0)} Ω → usar ${Math.ceil(Rs/10)*10} Ω</div>
    <div class="value">Potencia Rs ≈ ${((Vin-Vz)*(Vin-Vz)/Rs).toFixed(2)} W → usar ${Math.max(0.25, Math.ceil(((Vin-Vz)*(Vin-Vz)/Rs)*2)/2)}W</div>
    <div class="value">Corriente Zener máxima = ${(Iz_max*1000).toFixed(1)} mA</div>
    <div class="value">Potencia Zener máxima = ${Pmax.toFixed(2)} W</div>
  `;
}

// === Simulador de ondas Buck ===
function initSim() {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  canvas.height = 300;

  let animId = null;
  let t = 0;

  function draw() {
    const Vout = parseFloat(document.getElementById('sim-vout').value);
    const Duty = parseFloat(document.getElementById('sim-duty').value) / 100;
    const fsw = parseFloat(document.getElementById('sim-fsw').value);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const midY = canvas.height / 2;
    const amp = 50;

    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // PWM Signal
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const phase = (x / canvas.width) * 4 * Math.PI + t;
      const y = (phase % (2 * Math.PI)) < (2 * Math.PI * Duty) ? midY - amp : midY + amp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Inductor current (triangular)
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const phase = ((x / canvas.width) * 4 + (t / Math.PI / 2)) % 1;
      const tri = phase < Duty ?
        (phase / Duty) : 
        1 - ((phase - Duty) / (1 - Duty));
      const y = midY + amp * 0.6 - tri * amp * 1.2;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Vout (DC with ripple)
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const voutY = midY - amp * 0.8;
    for (let x = 0; x < canvas.width; x++) {
      const ripple = Math.sin(x * 0.05 + t * 2) * 3;
      const y = voutY + ripple;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = '11px monospace';
    ctx.fillStyle = '#4fc3f7'; ctx.fillText('PWM (Gate)', 10, 20);
    ctx.fillStyle = '#ff9800'; ctx.fillText('IL (Corriente L)', 10, 35);
    ctx.fillStyle = '#4caf50'; ctx.fillText('Vout (con ripple)', 10, 50);

    t += 0.05;
    animId = requestAnimationFrame(draw);
  }

  if (animId) cancelAnimationFrame(animId);
  draw();

  document.getElementById('sim-update').addEventListener('click', () => { t = 0; });
}

// === Calculadora Amplificador Operacional (Ganancia) ===
function calcOpAmp() {
  const config = document.getElementById('oa-config').value;
  
  if (config === 'inverting') {
    const R1 = parseFloat(document.getElementById('oa-r1').value) * (document.getElementById('oa-r1-unit').value === 'k' ? 1e3 : 1e6);
    const Rf = parseFloat(document.getElementById('oa-rf').value) * (document.getElementById('oa-rf-unit').value === 'k' ? 1e3 : 1e6);
    const Vin = parseFloat(document.getElementById('oa-vin').value);
    
    const Av = -Rf / R1;
    const Vout = Av * Vin;
    const Ibias = Vin / (R1 + Rf); // approximate bias current indicator
    
    document.getElementById('oa-result').innerHTML = `
      <div class="value">Ganancia Av = -Rf/R1 = ${Av.toFixed(3)} V/V (${(20*Math.log10(Math.abs(Av))).toFixed(1)} dB)</div>
      <div class="value">Vout = Av × Vin = ${Vout.toFixed(3)} V</div>
      <div class="value">Señal INVERTIDA (desfase 180°)</div>
      <div class="value">Impedancia de entrada ≈ ${R1 >= 1e3 ? (R1/1e3).toFixed(1)+' kΩ' : R1.toFixed(0)+' Ω'}</div>
      <div class="value">Ancho de banda GBW requerido ≥ ${Math.abs(Av).toFixed(1)} × fmax</div>
    `;
  } else if (config === 'noninverting') {
    const R1 = parseFloat(document.getElementById('oa-r1').value) * (document.getElementById('oa-r1-unit').value === 'k' ? 1e3 : 1e6);
    const Rf = parseFloat(document.getElementById('oa-rf').value) * (document.getElementById('oa-rf-unit').value === 'k' ? 1e3 : 1e6);
    const Vin = parseFloat(document.getElementById('oa-vin').value);
    
    const Av = 1 + Rf / R1;
    const Vout = Av * Vin;
    
    document.getElementById('oa-result').innerHTML = `
      <div class="value">Ganancia Av = 1 + Rf/R1 = ${Av.toFixed(3)} V/V (${(20*Math.log10(Av)).toFixed(1)} dB)</div>
      <div class="value">Vout = Av × Vin = ${Vout.toFixed(3)} V</div>
      <div class="value">Señal NO invertida (desfase 0°)</div>
      <div class="value">Impedancia de entrada ≈ MUY ALTA (MΩ típico)</div>
    `;
  } else if (config === 'summing') {
    const R1 = parseFloat(document.getElementById('oa-r1').value) * (document.getElementById('oa-r1-unit').value === 'k' ? 1e3 : 1e6);
    const R2 = parseFloat(document.getElementById('oa-r2').value) * (document.getElementById('oa-r2-unit').value === 'k' ? 1e3 : 1e6);
    const Rf = parseFloat(document.getElementById('oa-rf').value) * (document.getElementById('oa-rf-unit').value === 'k' ? 1e3 : 1e6);
    const V1 = parseFloat(document.getElementById('oa-vin').value);
    const V2 = parseFloat(document.getElementById('oa-vin2').value);
    
    const Vout = -Rf * (V1/R1 + V2/R2);
    
    document.getElementById('oa-result').innerHTML = `
      <div class="value">Vout = -Rf × (V1/R1 + V2/R2) = ${Vout.toFixed(3)} V</div>
      <div class="value">Peso V1: -${(Rf/R1).toFixed(2)} | Peso V2: -${(Rf/R2).toFixed(2)}</div>
      <div class="value">Si R1=R2: Vout = -${(Rf/R1).toFixed(2)} × (V1 + V2)</div>
    `;
  } else if (config === 'differential') {
    const R1 = parseFloat(document.getElementById('oa-r1').value) * (document.getElementById('oa-r1-unit').value === 'k' ? 1e3 : 1e6);
    const R2 = parseFloat(document.getElementById('oa-r2').value) * (document.getElementById('oa-r2-unit').value === 'k' ? 1e3 : 1e6);
    const Rf = parseFloat(document.getElementById('oa-rf').value) * (document.getElementById('oa-rf-unit').value === 'k' ? 1e3 : 1e6);
    const Rg = parseFloat(document.getElementById('oa-rg').value) * (document.getElementById('oa-rg-unit').value === 'k' ? 1e3 : 1e6);
    const V1 = parseFloat(document.getElementById('oa-vin').value);
    const V2 = parseFloat(document.getElementById('oa-vin2').value);
    
    const Vout = (V2 - V1) * (Rf / R1);
    const CMRR_warning = (R1 !== R2 || Rf !== Rg) ? '⚠️ Resistencias desbalanceadas → CMRR reducido' : '';
    
    document.getElementById('oa-result').innerHTML = `
      <div class="value">Vout = (V2 - V1) × Rf/R1 = ${Vout.toFixed(3)} V</div>
      <div class="value">Ganancia diferencial = Rf/R1 = ${(Rf/R1).toFixed(2)} V/V</div>
      <div class="value">Entrada+ pondera V2, Entrada- pondera V1</div>
      <div class="value">${CMRR_warning || '✓ Resistencias balanceadas (buen CMRR)'}</div>
    `;
  } else if (config === 'comparator') {
    const V1 = parseFloat(document.getElementById('oa-vin').value);
    const V2 = parseFloat(document.getElementById('oa-vin2').value);
    const Vsat = parseFloat(document.getElementById('oa-vsat').value) || 12;
    
    const Vout = (V1 > V2) ? +Vsat : -Vsat;
    
    document.getElementById('oa-result').innerHTML = `
      <div class="value">V1 ${V1 > V2 ? '>' : '≤'} V2 → Vout = ${Vout > 0 ? '+' : '-'}${Vsat}V (saturación)</div>
      <div class="value">Resultado: ${V1 > V2 ? 'ALTO (+Vsat)' : 'BAJO (-Vsat)'}</div>
      <div class="value">⚡ Sin retroalimentación — lazo abierto (ganancia ~100,000)</div>
    `;
  } else if (config === 'schmitt') {
    const R1 = parseFloat(document.getElementById('oa-r1').value) * (document.getElementById('oa-r1-unit').value === 'k' ? 1e3 : 1e6);
    const R2 = parseFloat(document.getElementById('oa-r2').value) * (document.getElementById('oa-r2-unit').value === 'k' ? 1e3 : 1e6);
    const Vsat = parseFloat(document.getElementById('oa-vsat').value) || 12;
    const Vin = parseFloat(document.getElementById('oa-vin').value);
    
    const beta = R1 / (R1 + R2);
    const Vth_high = beta * Vsat;
    const Vth_low = -beta * Vsat;
    const hysteresis = Vth_high - Vth_low;
    
    const state = (Vin >= Vth_high) ? 'ALTO (+Vsat)' : (Vin <= Vth_low) ? 'BAJO (-Vsat)' : 'MANTIENE estado anterior';
    
    document.getElementById('oa-result').innerHTML = `
      <div class="value">Umbral alto (Vth+) = ${Vth_high.toFixed(3)} V</div>
      <div class="value">Umbral bajo (Vth−) = ${Vth_low.toFixed(3)} V</div>
      <div class="value">Histéresis = ${hysteresis.toFixed(3)} V (${(hysteresis/Vsat*100).toFixed(1)}% de Vsat)</div>
      <div class="value">Estado actual para Vin=${Vin}V: <strong>${state}</strong></div>
      <div class="value">β = R1/(R1+R2) = ${beta.toFixed(4)}</div>
    `;
  }
}

function updateOpAmpFields() {
  const config = document.getElementById('oa-config').value;
  
  const v2group = document.getElementById('oa-v2-group');
  const rgGroup = document.getElementById('oa-rg-group');
  const vsatGroup = document.getElementById('oa-vsat-group');
  const r2group = document.getElementById('oa-r2-group');
  
  if (config === 'comparator' || config === 'differential' || config === 'summing' || config === 'schmitt') {
    v2group.style.display = '';
  } else {
    v2group.style.display = 'none';
  }
  
  if (config === 'differential') {
    rgGroup.style.display = '';
    r2group.style.display = '';
  } else if (config === 'summing') {
    r2group.style.display = '';
    rgGroup.style.display = 'none';
  } else {
    rgGroup.style.display = 'none';
    r2group.style.display = 'none';
  }
  
  if (config === 'comparator' || config === 'schmitt') {
    vsatGroup.style.display = '';
  } else {
    vsatGroup.style.display = 'none';
  }
  
  calcOpAmp();
}

window.addEventListener('load', () => {
  if (document.getElementById('simCanvas')) initSim();
  if (document.getElementById('oa-config')) {
    document.getElementById('oa-config').addEventListener('change', updateOpAmpFields);
    // Also listen to all inputs
    document.querySelectorAll('.calc-row input').forEach(el => {
      el.addEventListener('input', () => { if (typeof calcOpAmp === 'function') calcOpAmp(); });
    });
    updateOpAmpFields();
  }
});
