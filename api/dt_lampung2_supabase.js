const result =
  Object.keys(grouped)
    .map((nama_barang) => {

      const items =
        grouped[nama_barang];

      // tambahkan harga numeric
      const itemsWithHarga =
        items.map((item) => ({
          ...item,
          harga_numeric:
            parseRupiah(
              item.harga_satuan
            ),
        }));

      // harga tertinggi
      const highest =
        itemsWithHarga.reduce(
          (prev, curr) =>
            curr.harga_numeric >
            prev.harga_numeric
              ? curr
              : prev
        );

      // harga terendah
      const lowest =
        itemsWithHarga.reduce(
          (prev, curr) =>
            curr.harga_numeric <
            prev.harga_numeric
              ? curr
              : prev
        );

      // pembelian terbaru
      const latest =
        [...itemsWithHarga]
          .sort(
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

        // tertinggi
        harga_tertinggi:
          highest.harga_numeric,

        toko_tertinggi:
          highest.nama_toko,

        // terendah
        harga_terendah:
          lowest.harga_numeric,

        toko_terendah:
          lowest.nama_toko,

        // terbaru
        harga_terbaru:
          latest.harga_numeric,

        toko_terbaru:
          latest.nama_toko,

        // tanggal pembelian terakhir
        waktu_pengeluaran:
          latest.waktu_pengeluaran,
      };
    });
