import mongoose, { model, Schema, models } from "mongoose";

const PartnerSchema = new Schema(
  {
    logos: [{ type: String }],
    description: { type: String, default: "" },
  },
  {
  },
  { timestamps: true },
);

export const Partner = models.Partner || model("Partner", PartnerSchema);
