import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return res.status(403).json({ message: "この操作を行う権限がありません。" });
  }

  if (req.method === 'POST') {
    try {
      const { name, model, licensePlate, shopId } = req.body;

      const car = await prisma.car.create({
        data: {
          name,
          model,
          licensePlate,
          shopId: session.user.role === 'SHOP_ADMIN' ? session.user.shopId : shopId,
        },
      });

      res.status(201).json(car);
    } catch (error) {
      res.status(500).json({ message: "車両の登録中にエラーが発生しました。" });
    }
  } else if (req.method === 'GET') {
    try {
      const cars = await prisma.car.findMany({
        include: {
          shop: true,
        },
        ...(session.user.role === 'SHOP_ADMIN' ? { where: { shopId: session.user.shopId } } : {}),
      });

      res.status(200).json(cars);
    } catch (error) {
      res.status(500).json({ message: "車両の取得中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}