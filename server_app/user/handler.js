const express = require("express");
const bodyParser = require("body-parser");
const userService = require("./service");
const userValitor = require("./validator");
const decipher = require("../helpers/crypto");

const router = express.Router();
router.use(bodyParser.json());

const userLogin = async(req, res) => {
  try {
    const username = decipher.decode(req.body.username);
    const password = decipher.decode(req.body.password);
    const sessionId = req.sessionID;

    const validation = userValitor.validateLoginParams({username, password});

    if(!validation.valid) {
      return res.status(422).send(validation.message);
    }

    const user = await userService.login({username, password});

    if (user == null) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json({...user, "sessionId": sessionId});
  } catch (error) {
    console.error(error);
    return res.status(500).send("There's an error while treating your login request");
  }
}

const userCreate = async(req, res) => {
  try {
    const username = req.body.username;
    const mail = decipher.decode(req.body.email);
    const password = decipher.decode(req.body.password);

    const validation = userValitor.validateSignUpParams({username, mail, password});

    if(!validation.valid) {
      return res.status(422).send(validation.message);
    }

    await userService.create({username, mail, password});

    return res.sendStatus(201);
  } catch (error) {
    console.error(error);
    if(error.code == 'USER_ERROR_ALREADY_EXISTS') {
      return res.status(409).send("Usuário já existente!")
    }
    return res.status(500).send("Ocorreu um erro no tratamento do seu request!");
  }
}

const userRecovery = async(req, res) => {
  try {
    const email = req.body.email;
    await userService.recovery(email);
    return res.sendStatus(202);
  } catch (error) {
    console.error(error);
    if(error.code == 'USER_DO_NOT_EXISTS') {
      return res.status(400).send("Usuário não existente!")
    }
    return res.status(500).send("Ocorreu um erro no tratamento do seu request!");
  }
}

const userRecoveryValidate = async(req, res) => {
  try {
    const mail = req.query.mail;
    const code = req.query.code;
    const isValid = await userService.isValidRecovery(mail, code);
    return res.status(200).json({valid: isValid});
  } catch (error) {
    console.error(error);
    return res.status(500).send("Ocorreu um erro no tratamento do seu request!");
  }
}

const resetPassword = async(req, res) => {
  try {
    const mail = decipher.decode(req.body.mail);
    const newPassword = decipher.decode(req.body.newPassword);
    const code = req.body.code;
    const isValid = await userService.resetPassword(mail, code, newPassword);
    return res.status(200).json({valid: isValid});
  } catch (error) {
    console.error(error);
    return res.status(500).send("Ocorreu um erro no tratamento do seu request!");
  }
}

const deleteAccount = async (req, res) => {
	try {
		const userId = req.body.userId;
		const isDeleted = await userService.deleteAccount(userId);
		return res.status(200).json({ "deleted": isDeleted });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Error while deleting account!");
	}
}


module.exports = router
	.post("/create", userCreate)
	.post("/login", userLogin)
	.post("/recovery", userRecovery)
	.post("/reset", resetPassword)
	.delete("/delete", deleteAccount)
	.get("/recovery/validate", userRecoveryValidate);