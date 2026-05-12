require("dotenv").config();

const bcrypt = require("bcrypt");

const { createClient } =
  require("@supabase/supabase-js");



// koneksi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);



// REGISTER API
module.exports = async (req, res) => {

  // hanya POST
  if (req.method !== "POST") {

    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {

    const {
      username,
      password,
      status,
    } = req.body;

    // validasi kosong
    if (!username || !password || !status) {

      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    // cek duplicate username
    const {
      data: existingUser,
      error: checkError,
    } = await supabase
      .from("user_lgn")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    // error selain "not found"
    if (checkError) {

      console.error(checkError);

      return res.status(500).json({
        message: "DB Error",
      });
    }

    // username sudah ada
    if (existingUser) {

      return res.status(400).json({
        message: "Username sudah ada",
      });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // insert user
    const {
      error: insertError,
    } = await supabase
      .from("user_lgn")
      .insert([
        {
          username,
          password: hashedPassword,
          status,

          // kolom tambahan
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

    res.json({
      message: "Register berhasil",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};