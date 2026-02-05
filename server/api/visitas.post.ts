import ExcelJS from "exceljs";

// Datos fijos
const FIXED = {
  col10: "Jhonnathan Garban-CONT",
  col11: "ZA51560",
  col12: "jhonnathan_garban@goodyear.com",
  col13: "961596209",
  col14: "Project Engineer",
  appr1: "Manuel Denis",
};

const baseUrl = "http://10.107.194.70/rrhh/visitas/asset/php/put_reg.php";

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");

  if (!file) throw createError({ statusCode: 400, statusMessage: "No file" });

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

    const name = getCellValue(v[2]) + " " + getCellValue(v[3]);
    const rut = getCellValue(v[4]);
    const empresa = getCellValue(v[5]);
    const cargo = getCellValue(v[6]);

    if (!name && !rut && !empresa && !cargo) return;

    // --- Guardar visitantes ---
    visitors.push({ name, rut, empresa, cargo });

    // --- col19: concatenado de v[7] ---
    if (v[7]) col19List.push(String(v[7]).trim());

    // --- col21: primer valor v[8] ---
    if (!col21Value && v[8]) col21Value = String(v[8]).trim();

    // --- col22: primer valor v[9] convertida a AAAA-MM-DD ---

    if (!col22Value) {
      const cell = row.getCell(9).value;

      // Caso 1: la celda viene como string dd-mm-yyyy
      if (typeof cell === "string" && /^\d{2}-\d{2}-\d{4}$/.test(cell.trim())) {
        const [d, m, y] = cell.trim().split("-");
        col22Value = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        console.log("STRING:", col22Value);
        return;
      }

      // Caso 2: ExcelJS la convirtió a Date
      if (cell instanceof Date) {
        const y = cell.getFullYear();
        const m = String(cell.getMonth() + 1).padStart(2, "0");
        const d = String(cell.getDate()).padStart(2, "0");

        col22Value = `${y}-${m}-${d}`;
        console.log("DATE:", col22Value);
        return;
      }

      console.log("No reconocido:", cell);
    }
  });

  const dynamicParams: Record<string, string> = {};

  // --- Primer registro: va a col15–col18 ---
  if (visitors.length > 0) {
    const first = visitors[0];
    dynamicParams.col15 = first.name;
    dynamicParams.col16 = first.rut;
    dynamicParams.col17 = first.empresa;
    dynamicParams.col18 = first.cargo;
  }

  dynamicParams.total = String(visitors.length - 1);

  // --- Resto de los visitantes van como nam110+ ---
  let index = 110;

  for (let i = 1; i < visitors.length; i++) {
    const person = visitors[i];

    dynamicParams[`nam${index}`] = person.name;
    dynamicParams[`nam${index + 1}`] = person.rut;
    dynamicParams[`nam${index + 2}`] = person.empresa;
    dynamicParams[`nam${index + 3}`] = person.cargo;

    index += 10;
  }

  // ✔ col19 concatenado con //
  dynamicParams.col19 = col19List.join("//");

  // ✔ col21 tomado del primer registro v[8]
  dynamicParams.col21 = col21Value || "";

  // ✔ col22 tomado del primer v[9] y formateado
  dynamicParams.col22 = col22Value || "";
  dynamicParams.col23 = "08:00";
  dynamicParams.col24 = "17:00";
  dynamicParams.col25 = "Zona Exteriores";
  dynamicParams.col26 = "Si";
  dynamicParams.col27 = "";

  // Construcción final del URL
  const url = new URL(baseUrl);

  Object.entries(FIXED).forEach(([k, v]) =>
    url.searchParams.append(k, String(v)),
  );

  Object.entries(dynamicParams).forEach(([k, v]) =>
    url.searchParams.append(k, String(v)),
  );

  function getCellValue(cell: any) {
    if (!cell) return "";

    // Caso fórmula: usar result si existe
    if (typeof cell === "object" && cell.formula !== undefined) {
      return cell.result ?? "";
    }

    return cell ?? "";
  }

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
