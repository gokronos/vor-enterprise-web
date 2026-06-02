import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vor_enterprise",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET(
  request: Request,
  { params }: { params: { departmentId: string } }
) {
  try {
    const departmentId = parseInt(params.departmentId);
    
    if (isNaN(departmentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de departamento inválido",
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
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
