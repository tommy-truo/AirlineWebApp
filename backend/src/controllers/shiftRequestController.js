import { db } from '../config/db.js'

export const getAllRequests = async (req, res) => {
  try {
    const sql = `
      SELECT 
  sr.shift_request_id,
  sr.employee_id,

  CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
  d.department_name,
  jt.title_name,

  fr.flight_number,

  sr.request_type,
  sr.reason,
  sr.status,
  sr.submitted_datetime,
  sr.reviewed_datetime

FROM shift_requests sr

JOIN employees e 
  ON sr.employee_id = e.employee_id

LEFT JOIN departments d 
  ON e.department_id = d.department_id

LEFT JOIN job_titles jt 
  ON e.job_title_id = jt.job_title_id

LEFT JOIN flight_employee_assignments fea
  ON sr.assignment_id = fea.assignment_id

LEFT JOIN flight_instances fi
  ON fea.flight_instance_id = fi.flight_instance_id

LEFT JOIN flight_routes fr
  ON fi.flight_route_id = fr.flight_route_id

ORDER BY sr.submitted_datetime DESC;
    `

    const [rows] = await db.execute(sql)
    res.status(200).json(rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching requests' })
  }
}

export const updateRequestStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const sql = `
      UPDATE shift_requests
      SET status = ?, reviewed_datetime = NOW()
      WHERE shift_request_id = ?
    `

    await db.execute(sql, [status, id])

    // HANDLE DROP ONLY (simple logic)
    if (status === 'Approved') {
      const [reqData] = await db.execute(
        `SELECT * FROM shift_requests WHERE shift_request_id = ?`,
        [id]
      )

      const request = reqData[0]

      if (request.request_type === 'drop' && request.assignment_id) {
        await db.execute(
          `DELETE FROM flight_employee_assignments WHERE assignment_id = ?`,
          [request.assignment_id]
        )
      }
    }

    res.status(200).json({ message: 'Request updated' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error updating request' })
  }
}