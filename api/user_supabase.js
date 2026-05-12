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