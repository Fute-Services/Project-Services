import { NextRequest, NextResponse } from "next/server";
import { addClient, getAllClients } from "@/lib/clients";

export async function GET() {
  return NextResponse.json({ clients: getAllClients() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Client name required" }, { status: 400 });
  }

  const client = addClient(name);
  return NextResponse.json({ client });
}
