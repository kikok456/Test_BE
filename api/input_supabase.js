require("dotenv").config();

const { createClient } =
  require("@supabase/supabase-js");



// koneksi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


module.exports = async (req, res) => {

  // =========================
  // CORS
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }


  // hanya POST
  if (req.method !== "POST") {

    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const { data } = req.body;

    // validasi kosong
    if (!data || data.length === 0) {

      return res.status(400).json({
        message: "Data kosong",
      });
    }

    // insert bulk
    const { error } = await supabase
      .from("test_tb")
      .insert(data);

    if (error) {

      console.error(error);

      return res.status(500).json({
        message: "DB error",
        error: error.message,
      });
    }

    res.json({
      message: "Success insert",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
