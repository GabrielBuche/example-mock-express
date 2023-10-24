const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jsonfile = require("jsonfile");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const app = express();
const port = 3001;

app.use(bodyParser.json());

const secretKey = "1234";

// verifica se email é valido

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

//generte ID

function generateUniqueId() {
  return uuidv4();
}

// config header

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const dbFile = "dbFile.json";
const db = jsonfile.readFileSync(dbFile);

//login user

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

  console.debug(user);

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

// realiza o registro de novos usuarios

app.post("/api/user/register", (req, res) => {
  try {
    const { name, email, password, c_password } = req.body;

    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

    const currentDateTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ");

    const newUser = {
      id: generateUniqueId(),
      name,
      email,
      password,
      created_at: currentDateTime,
      updated_at: currentDateTime,
    };

    db.users.push(newUser);
    jsonfile.writeFileSync(dbFile, db);

    console.debug(newUser);

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        data: {
          error: "VE001 - ValidationException",
          message:
            "Erro de validação para o registro de usuário. Por favor, verifique os campos e tente novamente.",
        },
      });

      return;
    }

    if (res) {
      res.json({
        success: true,
        data: {
          message: "Usuário registrado com sucesso.",
          result: {
            name: newUser.name,
            token: token,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// realizar a cadastro de empresas

app.post("/api/bpf/enterprises", (req, res) => {
  try {
    const { name, cnpj } = req.body;
    const currentDateTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ");
    const newEnterprise = {
      id: generateUniqueId(),
      name,
      cnpj,
      created_at: currentDateTime,
      updated_at: currentDateTime,
    };

    db.users.push(newEnterprise);
    jsonfile.writeFileSync(dbFile, db);

    console.debug(newEnterprise);

    if (!name || !cnpj) {
      res.status(400).json({
        success: false,
        data: {
          error: "VE001 - ValidationException",
          message:
            "Erro de validação para o registro de usuário. Por favor, verifique os campos e tente novamente.",
        },
      });

      return;
    }

    if (res) {
      res.json({
        success: true,
        data: {
          message: "Nova empresa cadastrada.",
          result: {
            id: newEnterprise.id,
            name: newEnterprise.name,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// listar empresas

app.get("/api/bpf/enterprises", (req, res) => {
  try {
    const enterprises = db.enterprises;
    console.debug(enterprises);

    const response = {
      success: true,
      data: {
        message: "Listagem de empresas",
        result: {
          current_page: 1,
          data: enterprises.map((enterprise) => ({
            id: enterprise.id,
            name: enterprise.name,
            cnpj: enterprise.cnpj,
            created_at: enterprise.created_at,
            updated_at: enterprise.updated_at,
          })),
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      data: {
        error: "Erro interno do servidor",
        message: "Ocorreu um erro interno no servidor ao buscar as empresas.",
      },
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor mock está ouvindo na porta ${port}`);
});
