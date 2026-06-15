import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/citizens/[id]">
) {
  try {
    const { id } = await ctx.params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("citizens")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Habitant non trouvé" },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ citizen: data })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/citizens/[id]">
) {
  try {
    const { id } = await ctx.params
    const updates = await req.json()
    const supabase = createAdminClient()

    updates.updated_at = new Date().toISOString()

    const { data } = await supabase
      .from("citizens")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    revalidatePath(`/dashboard/citizens/${id}`)
    revalidatePath("/dashboard/citizens")
    return NextResponse.json({ citizen: data })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/citizens/[id]">
) {
  try {
    const { id } = await ctx.params
    const supabase = createAdminClient()

    await supabase.from("citizens").delete().eq("id", id)

    revalidatePath("/dashboard/citizens")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}
