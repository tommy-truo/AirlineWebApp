import { db } from '../config/db.js'

export const getAssignments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        fea.assignment_id,

        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        jt.title_name,

        fr.flight_number,
        dep.city AS departure_city,
        arr.city AS arrival_city,

        fi.scheduled_departure_datetime,
        fi.scheduled_arrival_datetime,

        fat.type_name

      FROM flight_employee_assignments fea

      JOIN employees e 
        ON fea.employee_id = e.employee_id

      LEFT JOIN job_titles jt 
        ON e.job_title_id = jt.job_title_id

      JOIN flight_instances fi 
        ON fea.flight_instance_id = fi.flight_instance_id

      JOIN flight_routes fr 
        ON fi.flight_route_id = fr.flight_route_id

      JOIN airports dep 
        ON fr.departure_airport_id = dep.airport_id

      JOIN airports arr 
        ON fr.arrival_airport_id = arr.airport_id

      LEFT JOIN flight_employee_assignment_types fat
        ON fea.assignment_type_id = fat.assignment_type_id

      ORDER BY fi.scheduled_departure_datetime DESC
    `

    const [rows] = await db.execute(sql)
    res.json(rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching assignments' })
  }
}

export const createAssignment = async (req, res) => {
  const { employee_id, flight_instance_id, assignment_type_id } = req.body

  try {
    const [existing] = await db.execute(`
      SELECT * FROM flight_employee_assignments
      WHERE employee_id = ? AND flight_instance_id = ?
    `, [employee_id, flight_instance_id])

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Employee is already assigned to this flight.'
      })
    }

    const sql = `
      INSERT INTO flight_employee_assignments
      (flight_instance_id, employee_id, assignment_type_id)
      VALUES (?, ?, ?)
    `

    await db.execute(sql, [
      flight_instance_id,
      employee_id,
      assignment_type_id
    ])

    res.json({ message: 'Assignment created' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating assignment' })
  }
}

export const deleteAssignment = async (req, res) => {
  const { id } = req.params

  try {
    await db.execute(
      `DELETE FROM flight_employee_assignments WHERE assignment_id = ?`,
      [id]
    )

    res.json({ message: 'Assignment removed' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error deleting assignment' })
  }
}

export const getAssignmentTypes = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT assignment_type_id, type_name
      FROM flight_employee_assignment_types
    `)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching assignment types' })
  }
}
