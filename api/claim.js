import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const id = req.query?.id;

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "Не указан id"
      });
    }

    // Получаем пользователя
    const result = await sql`
      SELECT id, balance
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;

    // Если пользователя нет — создаём
    if (result.length === 0) {
      await sql`
        INSERT INTO users (id, balance)
        VALUES (${id}, 0)
      `;

      return res.status(200).json({
        ok: true,
        id,
        balance: 0,
        claimed: false
      });
    }

    return res.status(200).json({
      ok: true,
      id: result[0].id,
      balance: Number(result[0].balance),
      claimed: false
    });

  } catch (error) {
    console.error("CLAIM ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Ошибка базы данных"
    });
  }
}
