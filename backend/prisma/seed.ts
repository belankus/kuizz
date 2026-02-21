import { PrismaClient } from '../src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})


dotenv.config();

const prisma = new PrismaClient({
    adapter,
});


async function main() {
    const email = process.env.SUPERADMIN_EMAIL || 'admin@kuizz.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'Admin@123456';

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log(`Superadmin already exists: ${email}`);
        return;
    }

    const hashed = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
        data: {
            email,
            name: 'Super Admin',
            password: hashed,
            role: 'SUPERADMIN',
        },
    });

    console.log(`✅ Superadmin created: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
