require("dotenv").config();

const {
  createClient,
} = require("@supabase/supabase-js");

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

// =====================================
// FORMAT EXCEL DATE
// =====================================

function excelDateToJSDate(
  serial
) {

  // kalau sudah string tanggal
  if (
    isNaN(serial)
  ) {
    return serial;
  }

  const utc_days =
    Math.floor(
      serial - 25569
    );

  const utc_value =
    utc_days * 86400;

  const date_info =
    new Date(
      utc_value * 1000
    );

  return date_info
    .toISOString()
    .split("T")[0];
}

// =====================================
// PARSE RUPIAH
// =====================================

function parseRupiah(
  value
) {

  if (!value) {
    return 0;
  }

  return Number(
    String(value)

      // hapus titik ribuan
      .replace(/\./g, "")

      // koma jadi titik
      .replace(",", ".")

      // sisakan angka & titik
      .replace(/[^\d.]/g, "")
  ) || 0;
}

module.exports = async (
  req,
  res
) => {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  try {

    // =================================
    // AMBIL DATA
    // =================================

    const {
      data,
      error,
    } = await supabase
      .from("data_lampung")
      .select("*");

    if (error) {

      return res
        .status(500)
        .json({
          message:
            error.message,
        });
    }

    // =================================
    // FIX DATE
    // =================================

    const fixedData =
      data.map((row) => ({

        ...row,

        waktu_pengeluaran:
          excelDateToJSDate(
            row.waktu_pengeluaran
          ),
      }));

    // =================================
    // GROUP BY NAMA BARANG
    // =================================

    const grouped = {};

    fixedData.forEach(
      (row) => {

        const key =
          row.nama_barang;

        if (
          !grouped[key]
        ) {

          grouped[key] =
            [];
        }

        grouped[key].push(
          row
        );
      }
    );

    // =================================
    // SUMMARY
    // =================================

    const result =
      Object.keys(
        grouped
      ).map(
        (
          nama_barang
        ) => {

          const items =
            grouped[
              nama_barang
            ];

          // ===========================
          // PARSE HARGA
          // ===========================

          const hargaList =
            items.map(
              (x) =>
                parseRupiah(
                  x.harga_satuan
                )
            );

          // ===========================
          // PEMBELIAN TERAKHIR
          // ===========================

          const latest =
            items.sort(
              (
                a,
                b
              ) =>
                new Date(
                  b.waktu_pengeluaran
                ) -
                new Date(
                  a.waktu_pengeluaran
                )
            )[0];

          return {

            nama_barang,

            harga_tertinggi:
              Math.max(
                ...hargaList
              ),

            harga_terendah:
              Math.min(
                ...hargaList
              ),

            waktu_pengeluaran:
              latest.waktu_pengeluaran,

            nama_toko:
              latest.nama_toko,
          };
        }
      );

    // =================================
    // RESPONSE
    // =================================

    return res.json(
      result
    );

  } catch (err) {

    console.error(
      err
    );

    return res
      .status(500)
      .json({
        message:
          "Server error",
      });
  }
};
