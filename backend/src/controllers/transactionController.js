import { db } from '../config/db.js';

export const getAllTransactions = async (req, res) => {
    try {
        const sql = `
    SELECT
        t.transaction_id,
        t.booking_id,
        t.amount AS transaction_amount,
        t.transaction_datetime,
        tt.type_name AS transaction_type,
        pm.payment_method_name AS payment_method
    FROM transactions t
    JOIN transaction_types tt 
        ON t.transaction_type_id = tt.transaction_type_id
    JOIN transaction_payment_methods pm 
        ON t.payment_method_id = pm.transaction_payment_method_id
    ORDER BY t.transaction_datetime DESC
    LIMIT 200
`;

        const [rows] = await db.execute(sql);

        return res.status(200).json(rows);
    } catch (err) {
        console.error("GET TRANSACTIONS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error fetching transactions."
        });
    }
};

export const getTransactionDropdowns = async (req, res) => {
    try {
        const typesSql = `
            SELECT transaction_type_id, type_name
            FROM transaction_types
            ORDER BY type_name
        `;

        const methodsSql = `
            SELECT transaction_payment_method_id, payment_method_name
            FROM transaction_payment_methods
            ORDER BY payment_method_name
        `;

        const [[types], [methods]] = await Promise.all([
            db.execute(typesSql),
            db.execute(methodsSql)
        ]);

        return res.status(200).json({
            transactionTypes: types,
            paymentMethods: methods
        });

    } catch (err) {
        console.error("GET TRANSACTION DROPDOWNS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error fetching dropdown data."
        });
    }
};

export const getTransactionReports = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            transactionTypeId,
            paymentMethodId
        } = req.query;

        let whereClauses = [];
        let params = [];

        if (startDate) {
            whereClauses.push("t.transaction_datetime >= ?");
            params.push(startDate);
        }

        if (endDate) {
            whereClauses.push("t.transaction_datetime <= ?");
            params.push(endDate);
        }

        if (transactionTypeId) {
            whereClauses.push("t.transaction_type_id = ?");
            params.push(transactionTypeId);
        }

        if (paymentMethodId) {
            whereClauses.push("t.payment_method_id = ?");
            params.push(paymentMethodId);
        }

        const whereSql = whereClauses.length > 0
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const rawSql = `
            SELECT
                t.transaction_id,
                t.booking_id,
                t.amount,
                t.transaction_datetime,
                tt.type_name AS transaction_type,
                pm.payment_method_name AS payment_method
            FROM transactions t
            JOIN transaction_types tt 
                ON t.transaction_type_id = tt.transaction_type_id
            JOIN transaction_payment_methods pm 
                ON t.payment_method_id = pm.transaction_payment_method_id
            ${whereSql}
            ORDER BY t.transaction_datetime DESC
        `;

        const [rawData] = await db.execute(rawSql, params);

        const formattedSql = `
            SELECT
                tt.type_name AS transaction_type,
                COUNT(*) AS transaction_count,
                SUM(t.amount) AS total_amount
            FROM transactions t
            JOIN transaction_types tt 
                ON t.transaction_type_id = tt.transaction_type_id
            ${whereSql}
            GROUP BY tt.type_name
        `;

        const [formattedReport] = await db.execute(formattedSql, params);

        const reportMeta = {
            reportName: "Transaction Activity Report",
            startDate: startDate || null,
            endDate: endDate || null,
            transactionType: transactionTypeId || null,
            paymentMethod: paymentMethodId || null
        };

        return res.status(200).json({
            reportMeta,
            formattedReport,
            rawData
        });

    } catch (err) {
        console.error("GET TRANSACTION REPORTS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error generating transaction report."
        });
    }
};