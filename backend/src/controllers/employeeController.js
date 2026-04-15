import { db } from '../config/db.js';

export const getAllEmployees = async (req, res) => {
  try {
    const sql = `
  SELECT 
  e.employee_id,
  e.first_name,
  e.last_name,
  e.department_id,
  e.job_title_id,
  e.salary,
  e.supervisor_id,
  e.emergency_contact_name,
  e.emergency_contact_phone,
  e.emergency_contact_relationship,
  e.account_id
FROM employees e
JOIN accounts a ON e.account_id = a.account_id
WHERE a.is_active = 1
ORDER BY e.employee_id ASC
`;

    const [rows] = await db.execute(sql);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('GET EMPLOYEES ERROR:', err.message || err);
    return res.status(500).json({ message: 'Error fetching employees.' });
  }
};

export const createEmployee = async (req, res) => {
  const {
    first_name,
    middle_initial,
    last_name,
    gender,
    date_of_birth,
    ssn,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    department_id,
    job_title_id,
    salary,
    start_date,
    supervisor_id,
    email,
    password
  } = req.body;

  try {
    const accountSql = `
      INSERT INTO accounts (email, password, is_active, role)
      VALUES (?, ?, ?, ?)
    `;

    const jobTitleIdNum = Number(job_title_id);

    let role = 'passenger';

    if (jobTitleIdNum === 1 || jobTitleIdNum === 2) {
      role = 'pilot';
    } else if (jobTitleIdNum === 3) {
      role = 'flightcrew';
    } else if (jobTitleIdNum === 6) {
      role = 'maintenance';
    } else if (jobTitleIdNum === 8 || jobTitleIdNum === 9) {
      role = 'manager';
    }

    const [accountResult] = await db.execute(accountSql, [
      email,
      password,
      1,
      role
    ]);

    const accountId = accountResult.insertId;

    const employeeSql = `
      INSERT INTO employees
      (
        first_name,
        middle_initial,
        last_name,
        gender,
        date_of_birth,
        ssn,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        department_id,
        job_title_id,
        salary,
        start_date,
        supervisor_id,
        account_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [employeeResult] = await db.execute(employeeSql, [
      first_name,
      middle_initial || null,
      last_name,
      gender,
      date_of_birth,
      ssn,
      emergency_contact_name || null,
      emergency_contact_phone || null,
      emergency_contact_relationship || null,
      department_id,
      job_title_id,
      salary,
      start_date,
      supervisor_id || null,
      accountId
    ]);

    return res.status(201).json({
      message: 'Employee registered successfully.',
      employee: {
        employee_id: employeeResult.insertId,
        account_id: accountId,
        email,
        role
      }
    });
  } catch (err) {
    console.error('CREATE EMPLOYEE ERROR:', err.sqlMessage || err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Duplicate entry. Email or SSN may already exist.' });
    }

    return res.status(500).json({ message: 'Error creating employee.' });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const findSql = `
      SELECT account_id
      FROM employees
      WHERE employee_id = ?
    `;
    const [rows] = await db.execute(findSql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const accountId = rows[0].account_id;

    await db.execute(
      'UPDATE accounts SET is_active = 0 WHERE account_id = ?',
      [accountId]
    );

    return res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (err) {
    console.error('DELETE EMPLOYEE ERROR:', err.message || err);
    return res.status(500).json({ message: 'Error deleting employee.' });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    department_id,
    job_title_id,
    salary,
    supervisor_id,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship
  } = req.body;

  try {
    const sql = `
  UPDATE employees
  SET 
    first_name = ?,
    last_name = ?,
    department_id = ?,
    job_title_id = ?,
    salary = ?,
    supervisor_id = ?,
    emergency_contact_name = ?,
    emergency_contact_phone = ?,
    emergency_contact_relationship = ?
  WHERE employee_id = ?
`;

    await db.execute(sql, [
      first_name,
      last_name,
      department_id,
      job_title_id,
      salary,
      supervisor_id,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      id
    ]);

    return res.status(200).json({ message: "Employee updated successfully." });

  } catch (err) {
    console.error('UPDATE EMPLOYEE ERROR:', err.message || err);
    return res.status(500).json({ message: 'Error updating employee.' });
  }
};
