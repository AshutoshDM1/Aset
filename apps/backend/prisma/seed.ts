import { db } from '../src/utils/db';

async function main() {
  console.log('Seeding database with coupons...');

  const couponCode = 'FREE100';
  const coupon = await db.coupon.upsert({
    where: { code: couponCode },
    update: {
      discountPercent: 100,
      active: true,
    },
    create: {
      code: couponCode,
      discountPercent: 100,
      active: true,
    },
  });

  console.log(`Seeded coupon: ${coupon.code} (ID: ${coupon.id})`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
