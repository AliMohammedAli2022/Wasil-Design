// Named fictional accounts requested for the browser preview.
export function addPreviewCouriers(data) {
  const account = {
    id: "COU-HASSAN-MOHAMMED-ALI",
    role: "courier",
    accountType: "courier",
    name: "حسن محمد علي",
    phone: "07700000201",
    province: "بغداد",
    area: "الجادرية",
    address: "شارع الجامعة — قرب مجمع الياسمين، زقاق 8، دار 14",
    location: null,
    vehicle: "sedan",
    plate: "بغداد 48261",
    approved: true,
    demo: true,
    walletId: "W-COU-HASSAN-MOHAMMED-ALI",
    available: false,
    budget: 0,
    radius: 5,
    addresses: [],
    customers: [],
    cancellations: [],
    failures: [],
  };
  if (
    !data.users.some(
      (user) =>
        user.id === account.id ||
        (user.role === "courier" && user.phone === account.phone),
    )
  )
    data.users.push(account);
}
