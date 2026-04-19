import { db } from '../config/db.js';

function formatMySQLDateTime(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const getFlashSales = async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM flash_sales
            ORDER BY start_datetime DESC
        `;

        const [rows] = await db.execute(sql);
        return res.status(200).json(rows);

    } catch (err) {
        console.error("GET FLASH SALES ERROR:", err);
        return res.status(500).json({ message: "Error fetching flash sales." });
    }
};

export const createFlashSale = async (req, res) => {
    const {
        name,
        start_datetime,
        end_datetime,
        discount_type,
        discount_value,
        departure_iata,
        arrival_iata,
        is_active
    } = req.body;

    try {
        const formattedStart = formatMySQLDateTime(start_datetime);
        const formattedEnd = formatMySQLDateTime(end_datetime);

        if (!formattedStart || !formattedEnd) {
            return res.status(400).json({
                message: "Invalid start or end datetime."
            });
        }

        const sql = `
            INSERT INTO flash_sales (
                name,
                start_datetime,
                end_datetime,
                discount_type,
                discount_value,
                departure_iata,
                arrival_iata,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            name,
            formattedStart,
            formattedEnd,
            discount_type,
            discount_value,
            departure_iata,
            arrival_iata,
            is_active ? 1 : 0
        ]);

        return res.status(201).json({
            message: "Flash sale created successfully.",
            flash_sale_id: result.insertId
        });

    } catch (err) {
        console.error("CREATE FLASH SALE ERROR:", err);
        return res.status(500).json({ message: "Error creating flash sale." });
    }
};

export const toggleFlashSaleStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
        const sql = `
            UPDATE flash_sales
            SET is_active = ?
            WHERE flash_sale_id = ?
        `;

        await db.execute(sql, [is_active ? 1 : 0, id]);

        return res.status(200).json({
            message: "Flash sale status updated."
        });

    } catch (err) {
        console.error("UPDATE FLASH SALE STATUS ERROR:", err);
        return res.status(500).json({ message: "Error updating flash sale." });
    }
};

export const deleteFlashSale = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            DELETE FROM flash_sales
            WHERE flash_sale_id = ?
        `;

        await db.execute(sql, [id]);

        return res.status(200).json({
            message: "Flash sale deleted."
        });

    } catch (err) {
        console.error("DELETE FLASH SALE ERROR:", err);
        return res.status(500).json({ message: "Error deleting flash sale." });
    }
};