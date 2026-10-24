import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CvUploaderWrapper } from "@/components/profile/cv-uploader-wrapper";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [profile, documents] = await Promise.all([
    userId
      ? prisma.profile.findUnique({
          where: { userId },
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 5,
            },
          },
        })
      : null,
    userId
      ? prisma.document.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [],
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil Profesional & CV Maestro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sube tu currículum para extraer tus datos automáticamente con IA o edita manualmente cada sección.
        </p>
      </div>

      <CvUploaderWrapper initialProfile={profile} initialDocuments={documents} />
    </div>
  );
}
