import { db } from "../../../lib/db";

export async function updateUserImage(userId: string, imageUrl: string | null) {
  const r = await db.query(
    `update "user"
     set image = $1, "updatedAt" = now()
     where id = $2
     returning id, email, name, image`,
    [imageUrl, userId],
  );

  return r.rows[0] as { id: string; email: string; name: string; image: string | null } | undefined;
}

export async function getUserImage(userId: string) {
  const r = await db.query(`select image from "user" where id = $1 limit 1`, [userId]);
  return (r.rows[0] as { image: string | null } | undefined)?.image ?? null;
}
