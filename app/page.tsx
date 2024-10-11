import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">車両予約システムへようこそ</h1>
        <p className="mb-4">サービスを利用するにはログインが必要です。</p>
        <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          ログイン
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">ようこそ、{session.user.name}さん</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/reservations" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
          予約一覧を見る
        </Link>
        <Link href="/reservations/new" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center">
          新しい予約を作成
        </Link>
        {(session.user.role === 'ADMIN' || session.user.role === 'SHOP_ADMIN') && (
          <Link href="/admin" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center">
            管理画面へ
          </Link>
        )}
      </div>
    </div>
  );
}