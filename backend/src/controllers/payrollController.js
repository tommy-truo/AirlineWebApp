import { db } from '../config/db.js';

export const getPayrollDropdowns = async (req, res) => {
    try {
        const departmentsSql = `
            SELECT department_id, department_name
            FROM departments
            ORDER BY department_name
        `;

        const jobTitlesSql = `
            SELECT job_title_id, title_name
            FROM job_titles
            ORDER BY title_name
        `;

        const [[departments], [jobTitles]] = await Promise.all([
            db.execute(departmentsSql),
            db.execute(jobTitlesSql)
        ]);

        return res.status(200).json({
            departments,
            jobTitles
        });
    } catch (err) {
        console.error("GET PAYROLL DROPDOWNS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error fetching payroll dropdown data."
        });
    }
};

export const getPayrollReports = async (req, res) => {
    try {
        const {
            departmentId,
            jobTitleId,
            activeOnly,
            startDateFrom,
            startDateTo
        } = req.query;

        let whereClauses = [];
        let params = [];

        if (departmentId) {
            whereClauses.push("e.department_id = ?");
            params.push(departmentId);
        }

        if (jobTitleId) {
            whereClauses.push("e.job_title_id = ?");
            params.push(jobTitleId);
        }

        if (activeOnly === 'true') {
            whereClauses.push("a.is_active = 1");
        }

        if (activeOnly === 'inactive') {
            whereClauses.push("a.is_active = 0");
        }

        if (startDateFrom) {
            whereClauses.push("e.start_date >= ?");
            params.push(startDateFrom);
        }

        if (startDateTo) {
            whereClauses.push("e.start_date <= ?");
            params.push(startDateTo);
        }

        const whereSql = whereClauses.length > 0
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const rawSql = `
            SELECT
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                d.department_name,
                jt.title_name AS job_title,
                e.salary,
                e.start_date,
                a.is_active
            FROM employees e
            JOIN departments d
                ON e.department_id = d.department_id
            JOIN job_titles jt
                ON e.job_title_id = jt.job_title_id
            JOIN accounts a
                ON e.account_id = a.account_id
            ${whereSql}
            ORDER BY d.department_name, jt.title_name, e.last_name, e.first_name
        `;

        const [rawData] = await db.execute(rawSql, params);

        const formattedSql = `
            SELECT
                d.department_name,
                jt.title_name AS job_title,
                COUNT(*) AS employee_count,
                SUM(e.salary) AS total_salary,
                AVG(e.salary) AS average_salary
            FROM employees e
            JOIN departments d
                ON e.department_id = d.department_id
            JOIN job_titles jt
                ON e.job_title_id = jt.job_title_id
            JOIN accounts a
                ON e.account_id = a.account_id
            ${whereSql}
            GROUP BY d.department_name, jt.title_name
            ORDER BY d.department_name, jt.title_name
        `;

        const [formattedReport] = await db.execute(formattedSql, params);

        const reportMeta = {
            reportName: "Payroll Salary Report",
            departmentId: departmentId || null,
            jobTitleId: jobTitleId || null,
            activeOnly: activeOnly || '',
            startDateFrom: startDateFrom || null,
            startDateTo: startDateTo || null
        };

        return res.status(200).json({
            reportMeta,
            formattedReport,
            rawData
        });
    } catch (err) {
        console.error("GET PAYROLL REPORTS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error generating payroll report."
        });
    }
};