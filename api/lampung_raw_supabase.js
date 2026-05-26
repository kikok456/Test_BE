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

  try {

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

    return res.json(
      data
    );

  } catch (err) {

    return res
      .status(500)
      .json({
        message:
          "Server error",
      });
  }
};
