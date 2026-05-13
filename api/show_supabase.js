require("dotenv").config();

const { createClient } =
  require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {

  // =========================
  // CORS FIX (WAJIB)
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // =========================
  // ONLY GET
  // =========================
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const { data, error } =
      await supabase.rpc("get_tables");

if (error) {
  console.error("SUPABASE ERROR:", error);

  return res.status(500).json({
    message: "DB error",
    error: error.message,
    details: error,
  });
}

    return res.json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
