import { db } from '../utils/db';

async function main() {
  console.log('Seeding database with coupons...');

  const couponsToSeed = [
    { code: 'FREE100', discountPercent: 100 },
    { code: 'WELCOME50', discountPercent: 50 },
    { code: 'SAVE20', discountPercent: 20 },
    { code: 'OFFER30', discountPercent: 30 },
    { code: 'SPECIAL90', discountPercent: 90 },
  ];

  for (const item of couponsToSeed) {
    const coupon = await db.coupon.upsert({
      where: { code: item.code },
      update: {
        discountPercent: item.discountPercent,
        active: true,
      },
      create: {
        code: item.code,
        discountPercent: item.discountPercent,
        active: true,
      },
    });
    console.log(
      `Seeded coupon: ${coupon.code} (ID: ${coupon.id}) with ${coupon.discountPercent}% discount`,
    );
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
