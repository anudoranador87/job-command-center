import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@jobcommand.local" },
    update: {},
    create: {
      email: "demo@jobcommand.local",
      name: "José Pérez",
      password: hashedPassword,
      profile: {
        create: {
          headline: "Senior Full Stack & AI Solutions Engineer",
          summary: "Especialista en desarrollo web moderno con Next.js, TypeScript y arquitecturas basadas en IA.",
          targetRole: "Senior Full Stack Engineer",
          location: "España (Remoto)",
          skills: [
            { name: "TypeScript", category: "Frontend & Backend", level: "Expert" },
            { name: "React / Next.js", category: "Frontend", level: "Expert" },
            { name: "Node.js", category: "Backend", level: "Senior" },
            { name: "PostgreSQL", category: "Database", level: "Senior" },
            { name: "Docker", category: "DevOps", level: "Intermediate" },
          ],
        },
      },
    },
  });

  console.log("Seed completed. Demo user created:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
