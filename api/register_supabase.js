require("dotenv").config();

const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

// REGISTER API
module.exports = async (req, res) => {

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const { username, password, status } = req.body;

    if (!username || !password || !status) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const { data: existingUser, error: checkError } =
      await supabase
        .from("user_lgn")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (checkError) {
      console.error(checkError);
      return res.status(500).json({
        message: "DB Error",
      });
    }

    if (existingUser) {
      return res.status(400).json({
        message: "Username sudah ada",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: insertError } = await supabase
      .from("user_lgn")
      .insert([
        {
          username,
          password: hashedPassword,
          status,
          created_at: new Date(),
        },
      ]);

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({
        message: "Insert Error",
        error: insertError.message,
      });
    }

    return res.json({
      message: "Register berhasil",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};
