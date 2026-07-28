// Simple EMI calculator matching the app logic
const TENURES = [12,18,24,36];
const tenureDefaults = {12:{interest:11,oneOff:1},18:{interest:11.5,oneOff:1.5},24:{interest:12,oneOff:2},36:{interest:13,oneOff:2.5}};

function computeOnRoadCost({showroomRate, marginPercent, processingFeePercent, gstPercent, docCharges, accessories, insurance}){
  const marginMoney = (marginPercent/100)*showroomRate;
  const netShowroomCost = showroomRate - marginMoney;
  const processingFee = (processingFeePercent/100)*netShowroomCost;
  const gst = (gstPercent/100)*processingFee;
  const totalOnRoad = netShowroomCost + processingFee + gst + docCharges + accessories + insurance;
  return {marginMoney, netShowroomCost, processingFee, gst, totalOnRoad};
}

function calculateEMI({loanAmount, tenureMonths, interestPercent, oneOffPercent}){
  const defaults = tenureDefaults[tenureMonths] || {interest: interestPercent||12, oneOff: oneOffPercent||2};
  const interest = (interestPercent!=null)?interestPercent:defaults.interest;
  const oneOff = (oneOffPercent!=null)?oneOffPercent:defaults.oneOff;
  const principalMonthly = loanAmount/tenureMonths;
  const interestAmount = principalMonthly*(interest/100);
  const charges = interestAmount*(1+(oneOff/100));
  const emi = principalMonthly + charges;
  return {tenureMonths, principalMonthly, interest, oneOff, interestAmount, charges, emi, totalPayable:emi*tenureMonths};
}

function calculateEMIsForTenures({loanAmount, tenures=TENURES, overrides={}}){
  return tenures.map(t=>calculateEMI({loanAmount, tenureMonths:t, interestPercent:overrides[t]?.interest, oneOffPercent:overrides[t]?.oneOff}));
}

// UI wiring
function $(id){return document.getElementById(id)}
function showAdvancedPanel(show){$('advancedPanel').style.display = show? 'block':'none';}

function initTenureOverrides(){
  const container = $('tenureOverrides');
  container.innerHTML = '';
  TENURES.forEach(t=>{
    const div = document.createElement('div');
    div.innerHTML = `<div style="margin-bottom:6px"><strong>${t} months</strong><div style="display:flex;gap:8px;margin-top:4px"><input id="ov_interest_${t}" type="number" value="${tenureDefaults[t].interest}" style="flex:1"/><input id="ov_oneoff_${t}" type="number" value="${tenureDefaults[t].oneOff}" style="flex:1"/></div></div>`;
    container.appendChild(div);
  });
}

function initApp(){
  initTenureOverrides();
  const adv = $('advancedToggle');
  if (adv) adv.addEventListener('change',e=>showAdvancedPanel(e.target.checked));
  const calc = $('calcBtn');
  if (calc) calc.addEventListener('click',()=>{
    const showroomRate = Number($('showroomRate').value) || 145000;
    const downPayment = Number($('downPayment').value) || 20000;
    const tenureInput = Number($('tenureMonths').value) || null;
    const tenuresToCompute = tenureInput? [tenureInput]:TENURES;

    const inputs = {
      showroomRate,
      marginPercent: Number($('marginPercent').value),
      processingFeePercent: Number($('processingFeePercent').value),
      gstPercent: Number($('gstPercent').value),
      docCharges: Number($('docCharges').value),
      accessories: Number($('accessories').value),
      insurance: Number($('insurance').value)
    };

    const onRoad = computeOnRoadCost(inputs);
    const loanAmount = onRoad.totalOnRoad - downPayment;

    const overrides = {};
    TENURES.forEach(t=>{
      overrides[t] = {interest: Number($(`ov_interest_${t}`)?.value||0), oneOff: Number($(`ov_oneoff_${t}`)?.value||0)};
    });

    const emiList = calculateEMIsForTenures({loanAmount, tenures:tenuresToCompute, overrides});

    renderResults({onRoad, loanAmount, emiList});
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function renderResults({onRoad, loanAmount, emiList}){
  const out = $('results');
  out.innerHTML = '';
  const fmt = new Intl.NumberFormat('en-IN');

  const b = document.createElement('div'); b.className='result-block';
  b.innerHTML = `<h3>On-Road Breakdown</h3>
    <div>Margin Money: ${fmt.format(Math.round(onRoad.marginMoney))}</div>
    <div>Net Showroom Cost: ${fmt.format(Math.round(onRoad.netShowroomCost))}</div>
    <div>Processing Fee: ${fmt.format(Math.round(onRoad.processingFee))}</div>
    <div>GST: ${fmt.format(Math.round(onRoad.gst))}</div>
    <div>Total On-Road: ${fmt.format(Math.round(onRoad.totalOnRoad))}</div>
    <div>Down Payment: ${fmt.format(Math.round(document.getElementById('downPayment').value||20000))}</div>
    <div style="font-weight:600">Net Financed Loan: ${fmt.format(Math.round(loanAmount))}</div>
  `;
  out.appendChild(b);

  emiList.forEach(e=>{
    const div = document.createElement('div'); div.className='result-block';
    div.innerHTML = `<h4>Tenure ${e.tenureMonths} months</h4>
      <div>Monthly Principal: ${fmt.format(Number(e.principalMonthly.toFixed(2)))}</div>
      <div>Interest %: ${e.interest}</div>
      <div>One-off %: ${e.oneOff}</div>
      <div>Interest Amount (monthly): ${fmt.format(Number(e.interestAmount.toFixed(2)))}</div>
      <div>Charges (monthly): ${fmt.format(Number(e.charges.toFixed(2)))}</div>
      <div style="font-weight:600">EMI (monthly): ${fmt.format(Number(e.emi.toFixed(2)))}</div>
      <div>Total Payable: ${fmt.format(Number(e.totalPayable.toFixed(2)))}</div>
    `;
    out.appendChild(div);
  });
}
