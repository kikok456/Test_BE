require("dotenv").config();

const {
  createClient,
} = require("@supabase/supabase-js");

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

module.exports = async (
  req,
  res
) => {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  try {

    // ambil semua data
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

    // group by nama_barang
    const grouped = {};

    data.forEach((row) => {

      const key =
        row.nama_barang;

      if (!grouped[key]) {

        grouped[key] = [];
      }

      grouped[key].push(row);
    });

    // summary
    const result =
      Object.keys(grouped).map(
        (nama_barang) => {

          const items =
            grouped[
              nama_barang
            ];

          const hargaList =
            items.map(
              (x) =>
                Number(
                  x.harga_satuan
                ) || 0
            );

          // cari pembelian terakhir
          const latest =
            items.sort(
              (a, b) =>
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

    return res.json(result);

  } catch (err) {

    console.error(err);

    return res
      .status(500)
      .json({
        message:
          "Server error",
      });
  }
};
