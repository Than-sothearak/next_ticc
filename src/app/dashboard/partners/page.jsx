import { connectDb } from "@/lib/connectDb";
import { Partner } from "@/models/Partner";
import { ImageManagerForm } from "../(components)/ImageManagerForm";
import { PartnerForm } from "../(components)/partner-form/PartnerForm";

export default async function SettingPage() {
  await connectDb();
  const partners = await Partner.findOne().lean();

  if (!partners) {
    return <div className="w-full h-screen m-auto flex justify-center items-center">Not found</div>;
  }

  const partnerData = JSON.parse(JSON.stringify(partners));
  const logos = partnerData.logos || [];

  return (
    <div className="flex flex-col gap-4 mt-8 items-center m-auto w-full px-2">
      <div className="md:w-[580px] w-full space-y-6">
        <PartnerForm partnerData={partnerData} />
        <ImageManagerForm
          title="Partner logos"
          decription="Add, remove, or reorder the logos shown in the partner section."
          id={partnerData._id}
          apiEndpoint="/api/partner"
          collectionName="partner"
          imageKey="logos"
          initialImages={logos}
        />
      </div>
    </div>
  );
}
