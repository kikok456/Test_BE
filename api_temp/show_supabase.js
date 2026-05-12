require("dotenv").config();

const { createClient } =
  require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {

  // GET only
  if (req.method !== "GET") {

    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const { data, error } =
      await supabase.rpc("get_tables");

    if (error) {

      console.error(error);

      return res.status(500).json({
        message: "DB error",
      });
    }

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};