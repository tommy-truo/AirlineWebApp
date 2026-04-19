import { db } from '../config/db.js'

export const getFlightReportDropdowns = async (req, res) => {
  try {
    const statusesSql = `
      SELECT flight_status_id, status_name
      FROM flight_statuses
      ORDER BY flight_status_id ASC
    `

    const airportsSql = `
      SELECT airport_id, iata, city
      FROM airports
      ORDER BY iata ASC
    `

    const [[statuses], [airports]] = await Promise.all([
      db.execute(statusesSql),
      db.execute(airportsSql)
    ])

    res.status(200).json({
      statuses,
      airports
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching flight report dropdowns' })
  }
}

export const getFlightReport = async (req, res) => {
  const {
    startDate,
    endDate,
    statusId,
    departureAirportId,
    arrivalAirportId
  } = req.query

  try {
    let sql = `
      SELECT
        fi.flight_instance_id,
        fr.flight_number,
        dep.city AS departure_city,
        arr.city AS arrival_city,
        a.aircraft_name,
        fs.status_name,
        fir.reason_name,
        fi.scheduled_departure_datetime,
        fi.scheduled_arrival_datetime,
        fi.actual_departure_datetime,
        fi.actual_arrival_datetime,
        dep.airport_id AS departure_airport_id,
        arr.airport_id AS arrival_airport_id,
        fi.status_id
      FROM flight_instances fi
      JOIN flight_routes fr ON fi.flight_route_id = fr.flight_route_id
      JOIN airports dep ON fr.departure_airport_id = dep.airport_id
      JOIN airports arr ON fr.arrival_airport_id = arr.airport_id
      JOIN aircrafts a ON fi.aircraft_id = a.aircraft_id
      JOIN flight_statuses fs ON fi.status_id = fs.flight_status_id
      LEFT JOIN flight_irregularity_reasons fir
        ON fi.status_reason_id = fir.flight_irregularity_reason_id
      WHERE 1=1
    `

    const params = []

    if (startDate) {
      sql += ` AND DATE(fi.scheduled_departure_datetime) >= ?`
      params.push(startDate)
    }

    if (endDate) {
      sql += ` AND DATE(fi.scheduled_departure_datetime) <= ?`
      params.push(endDate)
    }

    if (statusId) {
      sql += ` AND fi.status_id = ?`
      params.push(statusId)
    }

    if (departureAirportId) {
      sql += ` AND dep.airport_id = ?`
      params.push(departureAirportId)
    }

    if (arrivalAirportId) {
      sql += ` AND arr.airport_id = ?`
      params.push(arrivalAirportId)
    }

    sql += ` ORDER BY fi.scheduled_departure_datetime DESC`

    const [rows] = await db.execute(sql, params)

    const totalFlights = rows.length
    const onScheduleCount = rows.filter(row => Number(row.status_id) === 1).length
    const delayedCount = rows.filter(row => Number(row.status_id) === 3).length
    const cancelledCount = rows.filter(row => Number(row.status_id) === 4).length

    let statusName = 'All'
    let departureAirport = 'All'
    let arrivalAirport = 'All'

    if (statusId) {
      const [[statusRows]] = await db.execute(
        `SELECT status_name FROM flight_statuses WHERE flight_status_id = ?`,
        [statusId]
      )
      if (statusRows[0]) statusName = statusRows[0].status_name
    }

    if (departureAirportId) {
      const [[airportRows]] = await db.execute(
        `SELECT iata, city FROM airports WHERE airport_id = ?`,
        [departureAirportId]
      )
      if (airportRows[0]) {
        departureAirport = `${airportRows[0].iata} — ${airportRows[0].city}`
      }
    }

    if (arrivalAirportId) {
      const [[airportRows]] = await db.execute(
        `SELECT iata, city FROM airports WHERE airport_id = ?`,
        [arrivalAirportId]
      )
      if (airportRows[0]) {
        arrivalAirport = `${airportRows[0].iata} — ${airportRows[0].city}`
      }
    }

    res.status(200).json({
      reportMeta: {
        reportName: 'Flight Operations Report',
        startDate: startDate || '',
        endDate: endDate || '',
        statusName,
        departureAirport,
        arrivalAirport
      },
      summary: {
        totalFlights,
        onScheduleCount,
        delayedCount,
        cancelledCount
      },
      rawData: rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error generating flight report' })
  }
}