import { connectDb } from "@/lib/connectDb";
import { deleteFileFromS3, uploadFileToS3 } from "@/lib/uploadImageFileToS3";
import { Partner } from "@/models/Partner";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDb();
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const imageFiles = formData.getAll("images");
      const logos = await Promise.all(
        imageFiles
          .filter((file) => file.size > 0)
          .map((file) => uploadFileToS3(file)),
      );
      const partner = await Partner.create({
        logos,
        description: formData.get("description") || "",
      });

      return NextResponse.json({
        success: true,
        partner,
        message: "Logos added",
      });
    }

    const { description } = await req.json();
    const partner = await Partner.create({
      description,
    });

    return NextResponse.json({
      success: true,
      partner,
      message: "Partner description saved",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


export async function PUT(req) {
  try {
    await connectDb();
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const id = formData.get("_id");
      const partner = await Partner.findById(id);

      if (!partner) {
        return NextResponse.json(
          { success: false, message: "Partner not found" },
          { status: 404 },
        );
      }

      const removedImages = JSON.parse(formData.get("removedImages") || "[]");
      const removedUrls = removedImages.map((image) => image.url || image);
      const imageFiles = formData.getAll("images");
      const uploadedUrls = await Promise.all(
        imageFiles
          .filter((file) => file.size > 0)
          .map((file) => uploadFileToS3(file)),
      );

      for (const imageUrl of removedUrls) {
        const key = imageUrl.split("/").pop();
        if (key) await deleteFileFromS3(key);
      }

      const remainingLogos = partner.logos.filter(
        (logo) => !removedUrls.includes(logo),
      );
      const imagesOrder = JSON.parse(formData.get("imagesOrder") || "[]");
      const orderedLogos = imagesOrder.length
        ? imagesOrder.map((image) => image.url || image)
        : remainingLogos;

      partner.logos = [
        ...orderedLogos.filter((logo) => remainingLogos.includes(logo)),
        ...remainingLogos.filter((logo) => !orderedLogos.includes(logo)),
        ...uploadedUrls,
      ];
      await partner.save();

      return NextResponse.json({
        success: true,
        partner,
        message: "Saved",
      });
    }

    const { _id: id, description } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "_id is required for update" },
        { status: 400 }
      );
    }
    const partner = await Partner.findById(id);
    if (!partner) {
      return NextResponse.json(
        { success: false, message: "Partner not found" },
        { status: 404 }
      );
    }
    partner.description = description;
    await partner.save();
    return NextResponse.json({
      success: true,
      partner,
      message: "Saved"
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
