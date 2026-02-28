import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) { console.log("No user found"); return; }
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { mentorProfile: true, menteeProfile: true }
    })
    console.log("Success:", !!profile)
  } catch (e) {
    console.error("Prisma error:", e.message)
  } finally {
    await prisma.$disconnect()
  }
}
test()
