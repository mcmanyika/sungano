import { HallOfShameCaseView } from "@/components/hall-of-shame/HallOfShameCaseView";

export default async function HallOfShameCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HallOfShameCaseView id={id} />;
}
