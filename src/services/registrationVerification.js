// Local demo only. The real OTP provider belongs behind the API adapter.
export function verifyDemoRegistrationCode(code) {
  if (typeof code !== "string" || !/^[0-9]{6}$/.test(code))
    throw Error("أدخل كود التحقق المكوّن من 6 أرقام إنجليزية");
  if (code !== "111111") throw Error("كود التحقق غير صحيح، حاول مرة أخرى");
  return { method: "demo", verifiedAt: new Date().toISOString() };
}
