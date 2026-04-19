import { db } from '../config/db.js';

export const getAllEmployees = async (req, res) => {
  try {
    const sql = `
      SELECT 
  e.employee_id,
  e.first_name,
  e.last_name,
  e.department_id,
  d.department_name,
  e.job_title_id,
  j.title_name,
  e.salary,
  e.supervisor_id,
  CONCAT(s.first_name, ' ', s.last_name) AS supervisor_name,
  e.emergency_contact_name,
  e.emergency_contact_phone,
  e.emergency_contact_relationship,
  a.is_active
FROM employees e
JOIN accounts a 
  ON e.account_id = a.account_id
LEFT JOIN departments d 
  ON e.department_id = d.department_id
LEFT JOIN job_titles j 
  ON e.job_title_id = j.job_title_id
LEFT JOIN employees s 
  ON e.supervisor_id = s.employee_id
ORDER BY e.employee_id ASC
    `;

    const [rows] = await db.execute(sql);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('GET EMPLOYEES ERROR:', err);
    return res.status(500).json({ message: 'Error fetching employees.' });
  }
};

export const getEmployeeDropdowns = async (req, res) => {
  try {
    const departmentsSql = `
      SELECT department_id, department_name
      FROM departments
      ORDER BY department_name ASC
    `;

    const jobTitlesSql = `
      SELECT job_title_id, title_name
      FROM job_titles
      ORDER BY title_name ASC
    `;

    const supervisorsSql = `
      SELECT employee_id, first_name, last_name
      FROM employees
      WHERE job_title_id = 8 
      ORDER BY first_name ASC, last_name ASC
    `;

    const [departments] = await db.execute(departmentsSql);
    const [jobTitles] = await db.execute(jobTitlesSql);
    const [supervisors] = await db.execute(supervisorsSql);

    return res.status(200).json({
      departments,
      jobTitles,
      supervisors
    });
  } catch (err) {
    console.error('GET EMPLOYEE DROPDOWNS ERROR:', err.message || err);
    return res.status(500).json({ message: 'Error fetching employee dropdown data.' });
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
    email
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
      '',
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

    return res.status(200).json({ message: 'Employee deactivated successfully.' });
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
      supervisor_id || null,
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
