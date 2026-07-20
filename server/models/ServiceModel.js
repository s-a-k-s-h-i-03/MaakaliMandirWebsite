import db from "../config/db.js";

const baseSelect = `
  SELECT
    id,
    title,
    slug,
    description,
    short_description,
    image,
    icon,
    display_order,
    status,
    created_at,
    updated_at
  FROM services
`;

export async function findAll() {
  const [rows] = await db.execute(`${baseSelect} ORDER BY display_order ASC, created_at DESC`);
  return rows;
}

export async function findActive() {
  const [rows] = await db.execute(
    `${baseSelect} WHERE status = 'Active' ORDER BY display_order ASC, created_at DESC`,
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await db.execute(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function findBySlug(slug) {
  const [rows] = await db.execute(`${baseSelect} WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

export async function create(payload) {
  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? `
        INSERT INTO services (
          title,
          slug,
          description,
          short_description,
          image,
          icon,
          display_order,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `
      : `
        INSERT INTO services (
          title,
          slug,
          description,
          short_description,
          image,
          icon,
          display_order,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    [
      payload.title,
      payload.slug,
      payload.description,
      payload.short_description,
      payload.image,
      payload.icon,
      payload.display_order,
      payload.status,
    ],
  );

  return findById(result.insertId ?? resultRows?.[0]?.id);
}

export async function update(id, payload) {
  const [result] = await db.execute(
    `
      UPDATE services
      SET
        title = ?,
        slug = ?,
        description = ?,
        short_description = ?,
        image = ?,
        icon = ?,
        display_order = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      payload.title,
      payload.slug,
      payload.description,
      payload.short_description,
      payload.image,
      payload.icon,
      payload.display_order,
      payload.status,
      id,
    ],
  );

  return result.affectedRows > 0 ? findById(id) : null;
}

export async function remove(id) {
  const [result] = await db.execute("DELETE FROM services WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
