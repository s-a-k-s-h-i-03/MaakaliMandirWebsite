import db from "../config/db.js";

let gallerySchemaPromise;

async function ensureGallerySchema() {
  if (!gallerySchemaPromise) {
    gallerySchemaPromise = (async () => {
      await db.query(
        db.isPostgres
          ? `
            CREATE TABLE IF NOT EXISTS gallery (
              id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              image VARCHAR(500) NOT NULL,
              category VARCHAR(32) NOT NULL DEFAULT 'Other',
              display_order INTEGER NOT NULL DEFAULT 0,
              featured BOOLEAN NOT NULL DEFAULT FALSE,
              status VARCHAR(16) NOT NULL DEFAULT 'Active',
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
          `
          : `
            CREATE TABLE IF NOT EXISTS gallery (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              image VARCHAR(500) NOT NULL,
              category ENUM('Temple', 'Festival', 'Navratri', 'Puja', 'Events', 'Construction', 'Other') NOT NULL DEFAULT 'Other',
              display_order INT NOT NULL DEFAULT 0,
              featured TINYINT(1) NOT NULL DEFAULT 0,
              status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `,
      );

      const columns = await db.getColumns("gallery");

      if (db.isPostgres) {
        const statements = [];

        if (!columns.has("description")) {
          statements.push("ADD COLUMN description TEXT NULL");
        }

        if (!columns.has("image")) {
          statements.push("ADD COLUMN image VARCHAR(500) NOT NULL DEFAULT ''");
        }

        if (!columns.has("category")) {
          statements.push("ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'Other'");
        }

        if (!columns.has("display_order")) {
          statements.push("ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0");
        }

        if (!columns.has("featured")) {
          statements.push("ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE");
        }

        if (!columns.has("status")) {
          statements.push("ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'Active'");
        }

        if (!columns.has("created_at")) {
          statements.push("ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
        }

        if (!columns.has("updated_at")) {
          statements.push("ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
        }

        for (const statement of statements) {
          await db.query(`ALTER TABLE gallery ${statement}`);
        }
      } else {
        const statements = [];

        if (!columns.has("description")) {
          statements.push("ADD COLUMN description TEXT NULL AFTER title");
        }

        if (!columns.has("image")) {
          statements.push("ADD COLUMN image VARCHAR(500) NOT NULL DEFAULT '' AFTER description");
        }

        if (!columns.has("category")) {
          statements.push("ADD COLUMN category ENUM('Temple', 'Festival', 'Navratri', 'Puja', 'Events', 'Construction', 'Other') NOT NULL DEFAULT 'Other' AFTER image");
        }

        if (!columns.has("display_order")) {
          statements.push("ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER category");
        }

        if (!columns.has("featured")) {
          statements.push("ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0 AFTER display_order");
        }

        if (!columns.has("status")) {
          statements.push("ADD COLUMN status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active' AFTER featured");
        }

        if (!columns.has("created_at")) {
          statements.push("ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER status");
        }

        if (!columns.has("updated_at")) {
          statements.push("ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
        }

        if (statements.length > 0) {
          await db.query(`ALTER TABLE gallery ${statements.join(", ")}`);
        }
      }

      return db.getColumns("gallery");
    })();
  }

  return gallerySchemaPromise;
}

function selectExpression(columns, columnName, fallback, alias = columnName) {
  return columns.has(columnName)
    ? `${columnName} AS ${alias}`
    : `${fallback} AS ${alias}`;
}

async function buildSelectClause() {
  const columns = await ensureGallerySchema();

  return `
    SELECT
      id,
      title,
      ${selectExpression(columns, "description", "NULL")},
      ${selectExpression(columns, "image", "''")},
      ${selectExpression(columns, "category", "'Other'")},
      ${selectExpression(columns, "display_order", "0")},
      ${selectExpression(columns, "featured", "0")},
      ${selectExpression(columns, "status", "'Active'")},
      ${selectExpression(columns, "created_at", "NULL")},
      ${selectExpression(columns, "updated_at", "NULL")}
    FROM gallery
  `;
}

export async function findAll() {
  const selectClause = await buildSelectClause();
  const [rows] = await db.execute(
    `${selectClause} ORDER BY featured DESC, display_order ASC, created_at DESC`,
  );
  return rows;
}

export async function findFeatured(limit = 6) {
  const selectClause = await buildSelectClause();
  const [rows] = await db.execute(
    `${selectClause} WHERE status = 'Active' AND featured = ${db.isPostgres ? "TRUE" : "1"} ORDER BY display_order ASC, created_at DESC LIMIT ?`,
    [limit],
  );
  return rows;
}

export async function findActive() {
  const selectClause = await buildSelectClause();
  const [rows] = await db.execute(
    `${selectClause} WHERE status = 'Active' ORDER BY featured DESC, created_at DESC, display_order ASC`,
  );
  return rows;
}

export async function findCategory(category) {
  const selectClause = await buildSelectClause();
  const [rows] = await db.execute(
    `${selectClause} WHERE status = 'Active' AND category = ? ORDER BY featured DESC, created_at DESC, display_order ASC`,
    [category],
  );
  return rows;
}

export async function findById(id) {
  const selectClause = await buildSelectClause();
  const [rows] = await db.execute(`${selectClause} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function create(payload) {
  await ensureGallerySchema();

  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? `
        INSERT INTO gallery (
          title,
          description,
          image,
          category,
          display_order,
          featured,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `
      : `
        INSERT INTO gallery (
          title,
          description,
          image,
          category,
          display_order,
          featured,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    [
      payload.title,
      payload.description,
      payload.image,
      payload.category,
      payload.display_order,
      db.isPostgres ? Boolean(payload.featured) : payload.featured ? 1 : 0,
      payload.status,
    ],
  );

  return findById(result.insertId ?? resultRows?.[0]?.id);
}

export async function update(id, payload) {
  await ensureGallerySchema();

  const [result] = await db.execute(
    `
      UPDATE gallery
      SET
        title = ?,
        description = ?,
        image = ?,
        category = ?,
        display_order = ?,
        featured = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      payload.title,
      payload.description,
      payload.image,
      payload.category,
      payload.display_order,
      db.isPostgres ? Boolean(payload.featured) : payload.featured ? 1 : 0,
      payload.status,
      id,
    ],
  );

  return result.affectedRows > 0 ? findById(id) : null;
}

export async function remove(id) {
  await ensureGallerySchema();
  const [result] = await db.execute("DELETE FROM gallery WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
