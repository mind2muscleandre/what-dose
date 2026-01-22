import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Terra webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("terra-signature")

    // Store webhook in staging table for processing
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from("terra_webhook_staging")
      .insert({
        payload: body,
        terra_signature: signature || null,
        processed: false,
      })

    if (error) {
      console.error("Error storing webhook:", error)
      return NextResponse.json({ error: "Failed to store webhook" }, { status: 500 })
    }

    // Return success immediately (processing happens async)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

