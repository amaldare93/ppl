"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function PDFUploadCard() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("pdf-file") as File | null;

    if (!file) {
      console.log("Please select a PDF file to upload.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/events/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF file.");
      }

      console.log("PDF file uploaded successfully!");
    } catch (error) {
      console.error(error);
      console.log("An error occurred while uploading the PDF file.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF Upload</CardTitle>
        <CardDescription>
          Upload a PDF file to extract and process data for the league.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="pdf-file">PDF File</FieldLabel>
                <Input
                  type="file"
                  id="pdf-file"
                  name="pdf-file"
                  accept=".pdf"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Importing..." : "Import Event Data"}
          </Button>
        </form>

        {/* {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null} */}
      </CardContent>
    </Card>
  );
}
