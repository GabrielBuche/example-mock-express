const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jsonfile = require("jsonfile");

const app = express();
const port = 3001;

app.use(bodyParser.json());

const secretKey = "1234";

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const dbFile = "db.json";
const db = jsonfile.readFileSync(dbFile);

app.post("/api/user/login", (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    res.status(400).json({
      success: false,
      data: {
        error: "VE001 - ValidationException",
        message:
          "Erro de validação para o login. Por favor, verifique os campos e tente novamente.",
      },
    });

    return;
  }

  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

    res.json({
      success: true,
      data: {
        name: user.name,
        token,
      },
      message: "User login successfully.",
    });

  } else {
    res.status(401).json({
      success: false,
      data: {
        error: "Usuário não autorizado.",
        message: "Invalid credentials",
      },
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor mock está ouvindo na porta ${port}`);
});
