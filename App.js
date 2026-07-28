import React, {useState} from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { computeOnRoadCost, calculateEMIsForTenures, tenureDefaults } from './src/EMICalculator';

const TENURES = [12,18,24,36];

export default function App(){
  // showroom, downpayment and tenure inputs start empty per request
  const [showroomRate, setShowroomRate] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');

  // advanced editable fields default to example values
  const [marginPercent, setMarginPercent] = useState('10');
  const [processingFeePercent, setProcessingFeePercent] = useState('2.5');
  const [gstPercent, setGstPercent] = useState('18');
  const [docCharges, setDocCharges] = useState('500');
  const [accessories, setAccessories] = useState('4000');
  const [insurance, setInsurance] = useState('1700');

  // per-tenure overrides (interest and oneOff) editable in advanced mode
  const initialOverrides = Object.fromEntries(TENURES.map(t => [t, {interest: tenureDefaults[t].interest, oneOff: tenureDefaults[t].oneOff}]));
  const [overrides, setOverrides] = useState(initialOverrides);

  const [advanced, setAdvanced] = useState(false);
  const [result, setResult] = useState(null);

  const compute = () => {
    // require showroom and downpayment and at least one tenure (use TENURES if tenure empty)
    const sr = Number(showroomRate) || 0;
    const dp = Number(downPayment) || 0;
    const selectedTenure = Number(tenureMonths);
    const tenuresToCompute = selectedTenure ? [selectedTenure] : TENURES;

    const inputs = {
      showroomRate: sr || 120500, // fallback example if user leaves completely empty when computing breakdowns
      marginPercent: Number(marginPercent),
      processingFeePercent: Number(processingFeePercent),
      gstPercent: Number(gstPercent),
      docCharges: Number(docCharges),
      accessories: Number(accessories),
      insurance: Number(insurance)
    };

    const onRoad = computeOnRoadCost(inputs);
    const loanAmount = onRoad.totalOnRoad - dp;

    const emiList = calculateEMIsForTenures({loanAmount, tenures: tenuresToCompute, overrides});

    setResult({onRoad, loanAmount, emiList});
  };

  const updateOverride = (tenure, field, value) => {
    setOverrides(prev => ({...prev, [tenure]: {...prev[tenure], [field]: Number(value)}}));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>VehicleScheme — EMI Calculator</Text>

        <Text>Showroom Rate (leave empty to use example default)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={showroomRate} onChangeText={setShowroomRate} placeholder="e.g. 145000" />

        <Text>Down Payment (leave empty to use example default)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={downPayment} onChangeText={setDownPayment} placeholder="e.g. 20000" />

        <Text>Tenure (months) — leave empty to compute all: 12,18,24,36</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={tenureMonths} onChangeText={setTenureMonths} placeholder="12" />

        <View style={{flexDirection:'row',alignItems:'center',marginVertical:8}}>
          <Text style={{flex:1}}>Advanced (editable rates & charges)</Text>
          <Switch value={advanced} onValueChange={setAdvanced} />
        </View>

        {advanced && (
          <View style={{padding:8,backgroundColor:'#fff4e6',borderRadius:6,marginBottom:8}}>
            <Text style={{fontWeight:'600'}}>General Charges</Text>
            <Text>Margin Money %</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={marginPercent} onChangeText={setMarginPercent} />
            <Text>Processing Fee % (of net showroom)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={processingFeePercent} onChangeText={setProcessingFeePercent} />
            <Text>GST on Processing Fee %</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={gstPercent} onChangeText={setGstPercent} />
            <Text>Documentation Charges</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={docCharges} onChangeText={setDocCharges} />
            <Text>Showroom Accessories</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={accessories} onChangeText={setAccessories} />
            <Text>Insurance / Bundle Policy</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={insurance} onChangeText={setInsurance} />

            <Text style={{fontWeight:'600',marginTop:8}}>Per-tenure Rates (interest % and one-off %)</Text>
            {TENURES.map(t => (
              <View key={t} style={{marginBottom:6}}>
                <Text style={{fontWeight:'500'}}>Tenure {t} months</Text>
                <View style={{flexDirection:'row',gap:8}}>
                  <TextInput style={[styles.input,{flex:1}]} keyboardType="numeric" value={String(overrides[t].interest)} onChangeText={v=>updateOverride(t,'interest',v)} />
                  <TextInput style={[styles.input,{flex:1}]} keyboardType="numeric" value={String(overrides[t].oneOff)} onChangeText={v=>updateOverride(t,'oneOff',v)} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{marginVertical:10}}>
          <Button title="Calculate EMI" onPress={compute} />
        </View>

        {result && (
          <View style={styles.result}>
            <Text style={styles.h3}>On-Road Breakdown</Text>
            <Text>Margin Money: {result.onRoad.marginMoney.toFixed(0)}</Text>
            <Text>Net Showroom Cost: {result.onRoad.netShowroomCost.toFixed(0)}</Text>
            <Text>Processing Fee: {result.onRoad.processingFee.toFixed(0)}</Text>
            <Text>GST: {result.onRoad.gst.toFixed(0)}</Text>
            <Text>Total On-Road: {result.onRoad.totalOnRoad.toFixed(0)}</Text>
            <Text>Down Payment: {Number(downPayment || 20000).toFixed(0)}</Text>
            <Text style={{fontWeight:'600'}}>Net Financed Loan: {result.loanAmount.toFixed(0)}</Text>

            <Text style={[styles.h3,{marginTop:10}]}>EMI Breakdowns</Text>
            {result.emiList.map(e=> (
              <View key={e.tenureMonths} style={{padding:8,marginTop:8,backgroundColor:'#f6f6f6',borderRadius:6}}>
                <Text style={{fontWeight:'600'}}>Tenure: {e.tenureMonths} months</Text>
                <Text>Monthly Principal: {e.principalMonthly.toFixed(2)}</Text>
                <Text>Interest %: {e.interest}%</Text>
                <Text>One-off %: {e.oneOff}%</Text>
                <Text>Interest Amount (monthly): {e.interestAmount.toFixed(2)}</Text>
                <Text>Charges (monthly): {e.charges.toFixed(2)}</Text>
                <Text>EMI (monthly): {e.emi.toFixed(2)}</Text>
                <Text>Total Payable: {e.totalPayable.toFixed(2)}</Text>
              </View>
            ))}

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1},
  inner: {padding:16},
  title: {fontSize:20,fontWeight:'600',marginBottom:12},
  input: {borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8,borderRadius:6},
  result: {marginTop:16, padding:12, backgroundColor:'#f6f6f6', borderRadius:6},
  h3: {fontWeight:'600', marginTop:8}
});
