require("dotenv").config();

const {
  createClient,
} = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {

  // =========================================
  // CORS
  // =========================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {

    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const {
      data,
      table,
      username,
    } = req.body;

    // =====================================
    // VALIDASI
    // =====================================

    if (!table) {

      return res.status(400).json({
        message: "Tabel belum dipilih",
      });
    }

    if (!data || data.length === 0) {

      return res.status(400).json({
        message: "Data kosong",
      });
    }

    // =====================================
    // AMBIL KOLOM DB
    // =====================================

    const {
      data: columnsData,
      error: columnError,
    } = await supabase.rpc(
      "get_table_columns",
      {
        p_table_name: table,
      }
    );

    if (columnError) {

      return res.status(500).json({
        message: "Gagal ambil struktur tabel",
        error: columnError.message,
      });
    }

    const dbColumns =
      columnsData.map(
        (c) => c.column_name
      );

    // exclude auto column
    const insertColumns =
      dbColumns.filter(
        (c) =>
          c !== "id" &&
          c !== "created_at" &&
          c !== "pic"
      );

    // =====================================
    // VALIDASI JUMLAH KOLOM
    // =====================================

    const excelColumns =
      Object.keys(data[0]);
    console.log("EXCEL COLUMNS:", excelColumns);
console.log("DB COLUMNS:", insertColumns);

    if (
      excelColumns.length !==
      insertColumns.length
    ) {

      return res.status(400).json({
        message:
          `Jumlah kolom tidak cocok. ` +
          `Excel: ${excelColumns.length}, ` +
          `DB: ${insertColumns.length}`,
      });
    }

    // =====================================
    // FORMAT CREATED_AT
    // =====================================

    const now = new Date();

    const pad = (n) =>
      String(n).padStart(2, "0");

    const created_at =
      `${now.getFullYear()}-` +
      `${pad(now.getMonth() + 1)}-` +
      `${pad(now.getDate())} ` +
      `${pad(now.getHours())}:` +
      `${pad(now.getMinutes())}:` +
      `${pad(now.getSeconds())}`;

    const created_at_id =
      `${now.getFullYear()}` +
      `${pad(now.getMonth() + 1)}` +
      `${pad(now.getDate())}` +
      `${pad(now.getHours())}` +
      `${pad(now.getMinutes())}` +
      `${pad(now.getSeconds())}`;

    // =====================================
    // MAPPING
    // =====================================

const finalData = data.map(
  (row, index) => {

    const obj = {};

    insertColumns.forEach(
      (col, i) => {

        obj[col] =
          row[`COL_${i}`];
      }
    );

    // otomatis isi PIC
    obj.pic =
      username ||
      "UNKNOWN";

    const firstValue =
      row["COL_0"];

    const cleaned =
      String(firstValue)
        .replace(
          /[^0-9]/g,
          ""
        );

    obj.id =
      created_at_id +
      cleaned +
      String(
        index + 1
      ).padStart(
        3,
        "0"
      );

    obj.created_at =
      created_at;

    return obj;
  }
);

    // =====================================
    // INSERT
    // =====================================

    const { error } =
      await supabase
        .from(table)
        .insert(finalData);

    if (error) {

      console.error(error);

      return res.status(500).json({
        message: "DB error",
        error: error.message,
      });
    }

    res.json({
      message:
        "Data berhasil disimpan",
      total: finalData.length,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
