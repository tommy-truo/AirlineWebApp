import { useState, useEffect } from 'react';
import '../components/styles.css';

function TransactionHistory() {

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const transactionsPerPage = 8;

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  async function fetchTransactions() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_BASE_URL}/api/transactions`);

      if (!res.ok) {
        throw new Error("Failed to fetch transactions.");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.log(err);
      setError("Error fetching transactions.");
      setMessage('');
    }
  }

  const filteredTransactions = data.filter((transaction) => {
    const matchesSearch =
      String(transaction.transaction_id).includes(searchTerm) ||
      String(transaction.booking_id).includes(searchTerm) ||
      (transaction.payment_method || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.transaction_type || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === 'ALL' ||
      (transaction.transaction_type || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  return (
    <div className="container-fluid form-wrapper">

      <div className="card signup-container directory-card shadow-sm border-danger">

        <div className="card-body">

          <h2 className="form-title mb-3">Transaction History</h2>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap">

              <input
                type="text"
                className="form-control"
                placeholder="Search by transaction ID, booking ID, type, or payment method"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "280px" }}
              />

              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: "220px" }}
              >
                <option value="ALL">All Transactions</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
                <option value="canceled">Canceled</option>
              </select>

            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered">

              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking ID</th>
                  <th>Amount</th>
                  <th>Date / Time</th>
                  <th>Transaction Type</th>
                  <th>Payment Method</th>
                </tr>
              </thead>

              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td>{transaction.transaction_id}</td>
                      <td>{transaction.booking_id}</td>
                      <td>${Number(transaction.transaction_amount).toFixed(2)}</td>
                      <td>{transaction.transaction_datetime}</td>
                      <td>{transaction.transaction_type}</td>
                      <td>{transaction.payment_method}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-danger"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="fw-semibold">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              className="btn btn-outline-danger"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default TransactionHistory;
