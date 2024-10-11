import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "認証されていません。" });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
        include: {
          car: true,
          shop: true,
        },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (reservation.userId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN') {
        return res.status(403).json({ message: "この予約にアクセスする権限がありません。" });
      }

      res.status(200).json(reservation);
    } catch (error) {
      res.status(500).json({ message: "予約の取得中にエラーが発生しました。" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { startTime, endTime, status } = req.body;

      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (reservation.userId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN') {
        return res.status(403).json({ message: "この予約を更新する権限がありません。" });
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id: String(id) },
        data: {
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          status: status || undefined,
        },
      });

      res.status(200).json(updatedReservation);
    } catch (error) {
      res.status(500).json({ message: "予約の更新中にエラーが発生しました。" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (reservation.userId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN') {
        return res.status(403).json({ message: "この予約を削除する権限がありません。" });
      }

      await prisma.reservation.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "予約の削除中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}