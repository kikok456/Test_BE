require("dotenv").config();

const { createClient } =
  require("@supabase/supabase-js");



// koneksi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);



// GET USERS

module.exports = async (req, res) => {

  // =========================
  // CORS
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // hanya GET
  if (req.method !== "GET") {

    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const {
      data,
      error,
    } = await supabase
      .from("user_lgn")
      .select("id, username");

    if (error) {

      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
};
