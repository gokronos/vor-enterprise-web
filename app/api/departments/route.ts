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

export async function GET() {
  try {
    const [rows] = await pool.query(
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
