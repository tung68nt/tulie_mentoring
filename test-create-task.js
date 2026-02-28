const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const task = await prisma.todoItem.create({
    data: {
      title: "demo",
      description: null,
      priority: "medium",
      dueDate: undefined && !isNaN(undefined?.getTime() || NaN) ? undefined : null,
      startDate: undefined && !isNaN(undefined?.getTime() || NaN) ? undefined : null,
      reflectionId: null,
      menteeId: "clsj2l12k0000abcde1", // dummy id, might fail due to FK but let's see
      status: "todo",
      column: "todo",
      checklist: JSON.stringify([]),
      completedPercentage: 0
    }
  })
  console.log(task)
}
main().catch(console.error)
