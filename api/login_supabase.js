require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createClient } =
  require("@supabase/supabase-js");

const SECRET_KEY =
  process.env.JWT_SECRET;



// koneksi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);



export default async function handler(
  req,
  res
) {

  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

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

    const {
      username,
      password,
    } = req.body;

    // cari user
    const {
      data: user,
      error,
    } = await supabase
      .from("user_lgn")
      .select("*")
      .eq("username", username)
      .single();

    // user tidak ada
    if (error || !user) {

      return res.status(401).json({
        error:
          "invalid username or password",
      });
    }

    // compare password
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(401).json({
        error:
          "invalid username or password",
      });
    }

    // generate jwt
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      SECRET_KEY,
      {
        expiresIn: "10m",
      }
    );

    res.json({
      message: "login success",
      user_id: user.id,
      username: user.username,
      token,
      status: user.status,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
};
