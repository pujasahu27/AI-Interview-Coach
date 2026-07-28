import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import {
  bucketToYears,
  isDifficulty,
  isExperienceBucket,
  isInterviewFocus,
} from "@/lib/interviewOptions";
import {
  assertFileSize,
  parseUploadedFile,
  UnsupportedFileTypeError,
} from "@/lib/parsing";
import { getCurrentUser } from "@/lib/session";

async function resolveText(
  formData: FormData,
  fileKey: string,
  textKey: string,
): Promise<string | null> {
  const file = formData.get(fileKey);
  if (file instanceof File) {
    assertFileSize(file);
    return parseUploadedFile(file);
  }
  const text = formData.get(textKey);
  if (typeof text === "string" && text.trim()) {
    return text.trim();
  }
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  let rawText: string | null;
  try {
    const reuseId = formData.get("reuseLastResumeId");
    if (typeof reuseId === "string" && reuseId) {
      const existing = await adminDb.collection("resumes").doc(reuseId).get();
      if (!existing.exists || existing.data()?.uid !== user.uid) {
        return NextResponse.json({ error: "resume not found" }, { status: 404 });
      }
      rawText = existing.data()!.rawText as string;
    } else {
      rawText = await resolveText(formData, "resumeFile", "resumeText");
    }
  } catch (error) {
    console.error("resume parse failed:", error);
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Could not read resume file. Try pasting text instead." },
      { status: 400 },
    );
  }

  if (!rawText) {
    return NextResponse.json({ error: "resume is required" }, { status: 400 });
  }

  let jobDescriptionText: string | null;
  try {
    jobDescriptionText = await resolveText(
      formData,
      "jobDescriptionFile",
      "jobDescriptionText",
    );
  } catch (error) {
    console.error("job description parse failed:", error);
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Could not read job description file. Try pasting text instead." },
      { status: 400 },
    );
  }

  if (!jobDescriptionText) {
    return NextResponse.json({ error: "job description is required" }, { status: 400 });
  }

  const experienceBucket = formData.get("experienceBucket");
  const interviewFocus = formData.get("interviewFocus");
  const difficulty = formData.get("difficulty");
  const targetCompany = formData.get("targetCompany");

  if (!isExperienceBucket(experienceBucket)) {
    return NextResponse.json({ error: "invalid experience bucket" }, { status: 400 });
  }
  if (!isInterviewFocus(interviewFocus)) {
    return NextResponse.json({ error: "invalid interview focus" }, { status: 400 });
  }
  if (!isDifficulty(difficulty)) {
    return NextResponse.json({ error: "invalid difficulty" }, { status: 400 });
  }

  const docRef = await adminDb.collection("resumes").add({
    uid: user.uid,
    rawText,
    jobDescriptionText,
    yearsOfExperience: bucketToYears(experienceBucket),
    experienceBucket,
    interviewFocus,
    difficulty,
    targetCompany: typeof targetCompany === "string" ? targetCompany.trim() : "",
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json(
    {
      resumeId: docRef.id,
      wordCount: rawText.split(/\s+/).filter(Boolean).length,
    },
    { status: 201 },
  );
}
