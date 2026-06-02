import { NextResponse, NextRequest } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ departmentId: string }> }
) {
  try {
    const { departmentId: departmentIdStr } = await context.params;
    const departmentId = parseInt(departmentIdStr);
    
    if (isNaN(departmentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de departamento inválido",
        },
        { status: 400 }
      );
    }

    const db = getMysqlPool();
    const [rows] = await db.query(
      "SELECT id, name FROM municipalities WHERE department_id = ? ORDER BY name ASC",
      [departmentId]
    );
    
    return NextResponse.json({
      success: true,
      municipalities: rows,
    });
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener los municipios",
      },
      { status: 500 }
    );
  }
}
