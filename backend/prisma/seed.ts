import { PrismaClient, UserRole, UserStatus, TransactionType, TransactionStatus, CreditStatus, NotificationType, NotificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.creditRepayment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.savings.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create test users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      dateOfBirth: new Date('1990-01-15'),
      address: '123 Main Street',
      city: 'New York',
      country: 'USA',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1234567891',
      dateOfBirth: new Date('1992-05-20'),
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      country: 'USA',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'bob.wilson@example.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      phoneNumber: '+1234567892',
      dateOfBirth: new Date('1988-11-30'),
      address: '789 Pine Road',
      city: 'Chicago',
      country: 'USA',
      role: UserRole.CUSTOMER,
      status: UserStatus.PENDING_VERIFICATION,
      emailVerified: true,
      phoneVerified: false,
      kycVerified: false,
    },
  });

  console.log('✅ Created test users');

  // Create savings accounts
  const savings1 = await prisma.savings.create({
    data: {
      userId: customer1.id,
      accountNumber: 'SAV-' + Date.now() + '-001',
      balance: 5000.00,
      currency: 'USD',
      interestRate: 2.5,
      isActive: true,
    },
  });

  const savings2 = await prisma.savings.create({
    data: {
      userId: customer2.id,
      accountNumber: 'SAV-' + Date.now() + '-002',
      balance: 10000.00,
      currency: 'USD',
      interestRate: 2.5,
      isActive: true,
    },
  });

  const savings3 = await prisma.savings.create({
    data: {
      userId: customer3.id,
      accountNumber: 'SAV-' + Date.now() + '-003',
      balance: 1500.00,
      currency: 'USD',
      interestRate: 2.5,
      isActive: true,
    },
  });

  console.log('✅ Created savings accounts');

  // Create transactions
  await prisma.transaction.create({
    data: {
      userId: customer1.id,
      savingsId: savings1.id,
      type: TransactionType.DEPOSIT,
      amount: 2000.00,
      balanceBefore: 3000.00,
      balanceAfter: 5000.00,
      status: TransactionStatus.COMPLETED,
      description: 'Initial deposit',
      reference: 'TXN-' + Date.now() + '-001',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: customer2.id,
      savingsId: savings2.id,
      type: TransactionType.DEPOSIT,
      amount: 5000.00,
      balanceBefore: 5000.00,
      balanceAfter: 10000.00,
      status: TransactionStatus.COMPLETED,
      description: 'Salary deposit',
      reference: 'TXN-' + Date.now() + '-002',
    },
  });

  console.log('✅ Created transactions');

  // Create credits
  const credit1 = await prisma.credit.create({
    data: {
      userId: customer1.id,
      amount: 10000.00,
      interestRate: 12.0,
      tenure: 12,
      monthlyPayment: 888.49,
      totalRepayable: 10661.88,
      outstandingBalance: 10661.88,
      status: CreditStatus.APPROVED,
      purpose: 'Business expansion',
      creditScore: 750,
      approvedAt: new Date(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const credit2 = await prisma.credit.create({
    data: {
      userId: customer2.id,
      amount: 5000.00,
      interestRate: 10.0,
      tenure: 6,
      monthlyPayment: 856.07,
      totalRepayable: 5136.42,
      outstandingBalance: 5136.42,
      amountPaid: 0,
      status: CreditStatus.PENDING,
      purpose: 'Home renovation',
      creditScore: 720,
    },
  });

  console.log('✅ Created credits');

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: customer1.id,
      type: NotificationType.IN_APP,
      title: 'Credit Approved',
      message: 'Your credit application for $10,000 has been approved!',
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: customer1.id,
      type: NotificationType.EMAIL,
      title: 'Welcome to CreditJambo',
      message: 'Thank you for joining CreditJambo. Start managing your finances today!',
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      readAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: customer2.id,
      type: NotificationType.IN_APP,
      title: 'Deposit Successful',
      message: 'Your deposit of $5,000 has been successfully processed.',
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    },
  });

  console.log('✅ Created notifications');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Savings Accounts: ${await prisma.savings.count()}`);
  console.log(`   - Credits: ${await prisma.credit.count()}`);
  console.log(`   - Transactions: ${await prisma.transaction.count()}`);
  console.log(`   - Notifications: ${await prisma.notification.count()}`);
  console.log('\n👤 Test Credentials:');
  console.log('   Email: john.doe@example.com');
  console.log('   Email: jane.smith@example.com');
  console.log('   Email: bob.wilson@example.com');
  console.log('   Password: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

