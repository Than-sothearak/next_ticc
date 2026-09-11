"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SaveButton } from "../button/SaveButton";
import TextEditor from "../TextEditor";

export const PartnerForm = ({ partnerData }) => {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(!partnerData);
  const [partnerId, setPartnerId] = useState(partnerData?._id);
  const [description, setDescription] = useState(partnerData?.description || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    startTransition(async () => {
      const method = partnerId ? "PUT" : "POST";

      try {
        const res = await fetch("/api/partner", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: partnerId,
            description,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setPartnerId(result.partner?._id || partnerId);
        setDescription(result.partner?.description || description);
        setIsEditing(false);
        alert(result.message);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleCancel = () => {
    setDescription(partnerData?.description || "");
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="md:w-[580px] w-full m-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div className="space-y-2">
            <CardTitle>Partner description</CardTitle>
            <CardDescription>
              Update the description shown in the partner section.
            </CardDescription>
          </div>
          <SaveButton
            isEditing={isEditing}
            isPending={isPending}
            onEdit={() => setIsEditing(true)}
            onCancel={handleCancel}
          />
        </CardHeader>
        <CardContent>
          <div className="w-full space-y-2">
            <Label htmlFor="description">Description</Label>
            <TextEditor
              value={description}
              onChange={setDescription}
              editable={isEditing}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
