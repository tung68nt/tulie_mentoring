import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing connecting to DB...')
        const result = await prisma.$queryRaw`SELECT 1 as result`
        console.log('Connection successful:', result)
    } catch (err) {
        console.error('Connection failed:', err)
    } finally {
        await prisma.$disconnect()
    }
}

main()
