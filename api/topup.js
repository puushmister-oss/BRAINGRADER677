import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Метод должен быть POST"
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    const { id, amount } = req.body || {};

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "Не указан ID игрока"
      });
    }

    const add = Number(amount);

    if (!Number.isFinite(add) || add <= 0) {
      return res.status(400).json({
        ok: false,
        error: "Некорректная сумма"
      });
    }

    const result = await sql`
      INSERT INTO users (id, balance)
      VALUES (${String(id)}, ${add})
      ON CONFLICT (id)
      DO UPDATE SET balance = users.balance + ${add}
      RETURNING id, balance
    `;

    return res.status(200).json({
      ok: true,
      id: result[0].id,
      balance: Number(result[0].balance),
      added: add
    });

  } catch (error) {
    console.error("TOPUP ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Ошибка базы данных"
    });
  }
}
