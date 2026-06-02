import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

export async function GET() {
  try {
    const db = getMysqlPool();
    const [rows] = await db.query(
      "SELECT id, code, name FROM departments ORDER BY name ASC"
    );
    
    return NextResponse.json({
      success: true,
      departments: rows,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener los departamentos",
      },
      { status: 500 }
    );
  }
}
