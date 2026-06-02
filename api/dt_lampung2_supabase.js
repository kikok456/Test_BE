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

function parseRupiah(value) {

  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  if (!value) {
    return 0;
  }

  let str =
    String(value)
      .trim();

  str = str
    .replace(/Rp/gi, "")
    .replace(/\s/g, "");

  if (
    /^\d{1,3}(,\d{3})+$/.test(
      str
    )
  ) {

    str =
      str.replace(
        /,/g,
        ""
      );
  }

  else if (
    /^\d{1,3}(\.\d{3})+$/.test(
      str
    )
  ) {

    str =
      str.replace(
        /\./g,
        ""
      );
  }

  else if (
    str.includes(".") &&
    str.includes(",")
  ) {

    str = str
      .replace(/\./g, "")
      .replace(",", ".");
  }

  else if (
    /^\d+,\d+$/.test(
      str
    )
  ) {

    str =
      str.replace(
        ",",
        "."
      );
  }

  return (
    Number(str) || 0
  );
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
      .from(
        "data_lampung"
      )
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
      data.map(
        (row) => ({

          ...row,

          waktu_pengeluaran:
            excelDateToJSDate(
              row.waktu_pengeluaran
            ),
        })
      );

    // =================================
    // GROUP BY BARANG
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

        grouped[key]
          .push(row);
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

          const itemsWithHarga =
            items.map(
              (item) => ({

                ...item,

                harga_numeric:
                  parseRupiah(
                    item.harga_satuan
                  ),
              })
            );

          // ===========================
          // HARGA TERTINGGI
          // ===========================

          const highest =
            itemsWithHarga.reduce(
              (
                prev,
                curr
              ) =>
                curr.harga_numeric >
                prev.harga_numeric
                  ? curr
                  : prev
            );

          // ===========================
          // HARGA TERENDAH
          // ===========================

          const lowest =
            itemsWithHarga.reduce(
              (
                prev,
                curr
              ) =>
                curr.harga_numeric <
                prev.harga_numeric
                  ? curr
                  : prev
            );

          // ===========================
          // PEMBELIAN TERBARU
          // ===========================

          const latest =
            [...itemsWithHarga]
              .sort(
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

            // TERTINGGI
            harga_tertinggi:
              highest.harga_numeric,

            toko_tertinggi:
              highest.nama_toko,

            // TERENDAH
            harga_terendah:
              lowest.harga_numeric,

            toko_terendah:
              lowest.nama_toko,

            // TERBARU
            harga_terbaru:
              latest.harga_numeric,

            toko_terbaru:
              latest.nama_toko,

            // PEMBELIAN TERAKHIR
            waktu_pengeluaran:
              latest.waktu_pengeluaran,

            // OPTIONAL
            jumlah_pembelian:
              items.length,
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
