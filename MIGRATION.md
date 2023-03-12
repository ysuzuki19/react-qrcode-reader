# 1 to 2

Move `deviceId` prop into `videoConstraints` prop.

```typescript
<QrCodeReader
  delay={100}
  width={600}
  height={500}
  action={setVal}
  deviceId="YOUR_DEVICE_ID"
/>
```

```typescript
<QrCodeReader
  delay={100}
  width={600}
  height={500}
  action={setVal}
  videoConstraints={{ deviceId: 'YOUR_DEVICE_ID' }}
/>
```
