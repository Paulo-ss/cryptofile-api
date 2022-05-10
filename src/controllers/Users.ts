import { Request, Response } from "express";
import { prisma } from "../index";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import JWTSecret from "../JWTsecret";

interface UserCreateBody {
  name: string;
  email: string;
  password: string;
}

interface UserAuthBody {
  email: string;
  password: string;
}

class Users {
  async create(req: Request<{}, {}, UserCreateBody>, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.statusCode = 400;
      res.json({
        message: "Você deve fornecer um nome, email e senha para se cadastrar!",
      });
      return;
    }

    const doesEmailAlreadyExist = await prisma.users.findFirst({
      where: { email },
    });

    if (doesEmailAlreadyExist) {
      res.statusCode = 400;
      res.json({
        message: "O e-mail digitado já está cadastrado!",
      });
      return;
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      id: uuid(),
      name,
      email,
      password: hashPassword,
    };

    await prisma.users.create({ data: newUser });

    res.statusCode = 200;
    res.json({
      message: "Cadastro realizado com sucesso!",
    });
  }

  async userAuth(req: Request<{}, {}, UserAuthBody>, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      res.statusCode = 400;
      res.json({
        message:
          "Você deve fornecer um email e senha válidos para efetuar login!",
      });
      return;
    }

    // Procurando o usuário pelo e-mail
    const user = await prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      res.statusCode = 400;
      res.json({
        message: "O e-mail digitado não está cadastrado!",
      });
      return;
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      res.statusCode = 400;
      res.json({
        message: "A senha digitada está incorreta!",
      });
      return;
    }

    // Criando um JWT
    const token = jwt.sign(
      { user: { id: user.id, name: user.name, email: user.email } },
      JWTSecret,
      { expiresIn: "48h" }
    );

    res.statusCode = 200;
    res.json({ token });
  }
}

export default new Users();
