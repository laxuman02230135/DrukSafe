import DistrictExplorer from "@/components/DistrictExplorer";

export default async function DistrictPage({ searchParams }) {
  const params = await searchParams;

  return <DistrictExplorer initialDistrictId={params?.district} />;
}
