import React, {useState} from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { computeOnRoadCost, calculateEMI } from './src/EMICalculator';

export default function App(){
  const [showroomRate, setShowroomRate] = useState('120500');
  const [marginPercent, setMarginPercent] = useState('10');
  const [processingFeePercent, setProcessingFeePercent] = useState('2.5');
  const [gstPercent, setGstPercent] = useState('18');
  const [docCharges, setDocCharges] = useState('500');
  const [accessories, setAccessories] = useState('4000');
  const [insurance, setInsurance] = useState('1700');
  const [downPayment, setDownPayment] = useState('17849');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [result, setResult] = useState(null);

  const compute = () => {
    const inputs = {
      showroomRate: Number(showroomRate),
      marginPercent: Number(marginPercent),
      processingFeePercent: Number(processingFeePercent),
      gstPercent: Number(gstPercent),
      docCharges: Number(docCharges),
      accessories: Number(accessories),
      insurance: Number(insurance)
    };

    const onRoad = computeOnRoadCost(inputs);
    const loanAmount = onRoad.totalOnRoad - Number(downPayment);
    const emi = calculateEMI({loanAmount, tenureMonths: Number(tenureMonths)});

    setResult({onRoad, loanAmount, emi});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>VehicleScheme — EMI Calculator</Text>

        <Text>Showroom Rate</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={showroomRate} onChangeText={setShowroomRate} />

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

        <Text>Down Payment</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={downPayment} onChangeText={setDownPayment} />

        <Text>Tenure (months, e.g., 12,18,24)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={tenureMonths} onChangeText={setTenureMonths} />

        <View style={{marginVertical:10}}>
          <Button title="Calculate EMI" onPress={compute} />
        </View>

        {result && (
          <View style={styles.result}>
            <Text style={styles.h3}>Breakdown</Text>
            <Text>Margin Money: {result.onRoad.marginMoney.toFixed(0)}</Text>
            <Text>Net Showroom Cost: {result.onRoad.netShowroomCost.toFixed(0)}</Text>
            <Text>Processing Fee: {result.onRoad.processingFee.toFixed(0)}</Text>
            <Text>GST: {result.onRoad.gst.toFixed(0)}</Text>
            <Text>Total On-Road: {result.onRoad.totalOnRoad.toFixed(0)}</Text>
            <Text>Down Payment: {Number(downPayment).toFixed(0)}</Text>
            <Text>Net Financed Loan: {result.loanAmount.toFixed(0)}</Text>

            <Text style={styles.h3}>EMI Details</Text>
            <Text>Tenure: {result.emi.tenureMonths} months</Text>
            <Text>Monthly Principal: {result.emi.principalMonthly.toFixed(0)}</Text>
            <Text>Interest %: {result.emi.interest}%</Text>
            <Text>One-off %: {result.emi.oneOff}%</Text>
            <Text>Interest Amount (monthly): {result.emi.interestAmount.toFixed(0)}</Text>
            <Text>Charges (monthly): {result.emi.charges.toFixed(0)}</Text>
            <Text>EMI (monthly): {result.emi.emi.toFixed(0)}</Text>
            <Text>Total Payable: {result.emi.totalPayable.toFixed(0)}</Text>
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
