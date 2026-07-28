# VehicleScheme

React Native (Expo) app to compute vehicle EMI using a custom flat-interest/charge model.

Quick start:
1. Install dependencies: npm install or yarn
2. Start Expo: npm start
3. Build an APK with EAS or use: expo run:android (requires Android toolchain)

Formula summary:
- Compute Net Financed Loan from showroom and fees.
- EMI uses flat monthly principal = loan / months
- Monthly interest portion = principal * (interestRate/100)
- One-off is applied as percentage of the interest amount
- Charges = interest * (1 + oneOff/100)
- EMI = principal + charges

Open the app and provide showroom price, fees, down payment and tenure; defaults mirror the example values provided.
