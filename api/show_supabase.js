require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

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
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  // =========================
  // MAIN LOGIC
  // =========================
  try {

    const { data, error } =
      await supabase.rpc("get_tables");

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return res.status(500).json({
        message: "DB error",
        error: error.message,
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
