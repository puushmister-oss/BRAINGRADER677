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

    // Проверяем пользователя
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
        VALUES (${id}, 100)
      `;

      return res.status(200).json({
        ok: true,
        id,
        balance: 100,
        claimed: true
      });
    }

    // Если пользователь уже существует — начисляем 100
    const updated = await sql`
      UPDATE users
      SET balance = balance + 100
      WHERE id = ${id}
      RETURNING id, balance
    `;

    return res.status(200).json({
      ok: true,
      id: updated[0].id,
      balance: Number(updated[0].balance),
      claimed: true
    });

  } catch (error) {
    console.error("CLAIM ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Ошибка базы данных"
    });
  }
}
