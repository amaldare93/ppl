import { NextResponse } from "next/server";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
// TODO: this route is accepting the standings PDF, and parsing it into a readable JSON Object
// The JSON Object still needs to be converted to an Event object, an Event Standings object, and any new players need to be added as well,
//  and then stored in the database
function parseEventFromPdfText(text: string) {
  console.log("[events/upload] parsing PDF text", text);
  const splitRows = text
    .split("\n")
    .map((row) => row.split("\t").map((cell) => cell.trim()));

  const columnHeaders = splitRows.find((row) => row[0] === "RANK") || [];
  const tableRows = splitRows
    .filter((row) => row.length === columnHeaders.length)
    .slice(1);
  if (
    !columnHeaders ||
    !tableRows ||
    columnHeaders.length === 0 ||
    tableRows.length === 0
  ) {
    throw new Error("Unable to parse the PDF text.");
  }

  const tableData = tableRows.reduce<Record<string, string>[]>((acc, row) => {
    const rowData: Record<string, string> = {};
    columnHeaders.forEach((header, index) => {
      rowData[header] = row[index];
    });
    acc.push(rowData);
    return acc;
  }, []);

  const secondLastRow = splitRows[splitRows.length - 2];
  const lastRow = splitRows[splitRows.length - 1];
  const [printDate] = secondLastRow[0].split(", ");
  const title = secondLastRow[1]
    .replace("EventLink - Standings for", "")
    .trim();
  const [url, page] = lastRow;
  const urlParts = url.split("/");

  const storeId = urlParts[4];
  const eventId = urlParts[6];
  const roundNumber = urlParts[8];

  return {
    title,
    url,
    page,
    storeId,
    printDate,
    eventId,
    roundNumber,
    tableData,
  };
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart form upload." },
      { status: 400 },
    );
  }

  const file = formData.get("pdf-file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A PDF file is required in the 'pdf-file' field." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "The PDF file is empty." },
      { status: 400 },
    );
  }

  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { error: "The uploaded file must be a PDF." },
      { status: 415 },
    );
  }

  const parser = new PDFParse({
    data: Buffer.from(await file.arrayBuffer()),
  });

  try {
    const textResult = await parser.getText();
    const {
      tableData,
      title,
      printDate,
      url,
      page,
      storeId,
      eventId,
      roundNumber,
    } = parseEventFromPdfText(textResult.pages[0].text);

    return NextResponse.json({
      filename: file.name,
      // pageCount: result.total,
      // text: result.text,
      tableData,
      title,
      printDate,
      url,
      page,
      storeId,
      eventId,
      roundNumber,
    });
  } catch (error) {
    console.error("[events/upload] failed to parse PDF", error);
    return NextResponse.json(
      {
        error: "Unable to read the uploaded PDF.",
      },
      { status: 422 },
    );
  } finally {
    await parser.destroy();
  }
}
