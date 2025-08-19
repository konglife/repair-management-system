import { SaleDetailPageContent } from "./SaleDetailPageContent";

interface SaleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const resolvedParams = await params;
  return <SaleDetailPageContent saleId={resolvedParams.id} />;
}