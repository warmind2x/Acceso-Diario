import ExcelJS from "exceljs";

// =======================
// DATOS FIJOS
// =======================
const FIXED = {
  col10: "Jhonnathan Garban-CONT",
  col11: "ZA51560",
  col12: "jhonnathan_garban@goodyear.com",
  col13: "961596209",
  col14: "Project Engineer",
  appr1: "Manuel Denis",
};

const baseUrl = "http://10.107.194.70/rrhh/visitas/asset/php/put_reg.php";

// =======================
// HELPERS
// =======================

// Convierte CUALQUIER fecha de Excel a ISO YYYY-MM-DD (sin timezone bugs)
function excelDateToISO(value: any): string | null {
  // Excel serial number
  if (typeof value === "number") {
    const d = ExcelJS.DateUtils.excelToJsDate(value);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }

  // Date (forzar UTC)
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${String(
      value.getUTCMonth() + 1,
    ).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }

  // String DD-MM-YYYY
  if (typeof value === "string" && /^\d{2}-\d{2}-\d{4}$/.test(value.trim())) {
    const [d, m, y] = value.trim().split("-");
    return `${y}-${m}-${d}`;
  }

  return null;
}

function getCellValue(cell: any) {
  if (!cell) return "";

  if (typeof cell === "object" && cell.formula !== undefined) {
    return cell.result ?? "";
  }

  return cell ?? "";
}

// =======================
// HANDLER
// =======================
export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "No file" });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(new Uint8Array(file.data).buffer);
  const ws = workbook.worksheets[0];

  const visitors: any[] = [];
  const col19List: string[] = [];

  let col21Value: string | null = null;
  let col22Value: string | null = null;

  ws.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return;

    const v = row.values as any[];

    const name = `${getCellValue(v[2])} ${getCellValue(v[3])}`.trim();
    const rut = getCellValue(v[4]);
    const empresa = getCellValue(v[5]);
    const cargo = getCellValue(v[6]);

    if (!name && !rut && !empresa && !cargo) return;

    visitors.push({ name, rut, empresa, cargo });

    // col19
    if (v[7]) col19List.push(String(v[7]).trim());

    // col21 (primer valor)
    if (!col21Value && v[8]) {
      col21Value = String(v[8]).trim();
    }

    // col22 (fecha, solo una vez)
    if (!col22Value) {
      const rawCell = row.getCell(9).value;
      const value =
        typeof rawCell === "object" && rawCell?.result
          ? rawCell.result
          : rawCell;

      const iso = excelDateToISO(value);

      if (iso) {
        col22Value = iso;
        console.log("FECHA OK:", iso);
      } else {
        console.warn("Fecha no reconocida:", rawCell);
      }
    }
  });

  // =======================
  // PARAMETROS DINAMICOS
  // =======================
  const dynamicParams: Record<string, string> = {};

  if (visitors.length > 0) {
    const first = visitors[0];
    dynamicParams.col15 = first.name;
    dynamicParams.col16 = first.rut;
    dynamicParams.col17 = first.empresa;
    dynamicParams.col18 = first.cargo;
  }

  dynamicParams.total = String(visitors.length - 1);

  let index = 110;
  for (let i = 1; i < visitors.length; i++) {
    const p = visitors[i];
    dynamicParams[`nam${index}`] = p.name;
    dynamicParams[`nam${index + 1}`] = p.rut;
    dynamicParams[`nam${index + 2}`] = p.empresa;
    dynamicParams[`nam${index + 3}`] = p.cargo;
    index += 10;
  }

  dynamicParams.col19 = col19List.join("//");
  dynamicParams.col21 = col21Value || "";
  dynamicParams.col22 = col22Value || "";
  dynamicParams.col23 = "08:00";
  dynamicParams.col24 = "17:00";
  dynamicParams.col25 = "Zona Exteriores";
  dynamicParams.col26 = "Si";
  dynamicParams.col27 = "";

  // =======================
  // URL FINAL
  // =======================
  const url = new URL(baseUrl);

  Object.entries(FIXED).forEach(([k, v]) => url.searchParams.append(k, v));

  Object.entries(dynamicParams).forEach(([k, v]) =>
    url.searchParams.append(k, v),
  );

  return {
    url: url.toString(),
    step: 1,
    inHour: dynamicParams.col23,
    outHour: dynamicParams.col24,
    date: dynamicParams.col22,
    visitors: visitors.map((v, i) => ({
      Visitante: i + 1,
      Nombre: v.name,
      Rut: v.rut,
      Empresa: v.empresa,
      Cargo: v.cargo,
    })),
  };
});
