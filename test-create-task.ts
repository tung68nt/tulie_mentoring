import { prisma } from './src/lib/db'

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found");
      return;
    }
    const task = await prisma.todoItem.create({
      data: {
        title: "demo",
        description: null,
        priority: "medium",
        dueDate: null,
        startDate: null,
        reflectionId: null,
        menteeId: user.id,
        status: "todo",
        column: "todo",
        checklist: JSON.stringify([]),
        completedPercentage: 0
      }
    })
    console.log("Success:", task)
  } catch (e: any) {
    console.error("Prisma Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main()
