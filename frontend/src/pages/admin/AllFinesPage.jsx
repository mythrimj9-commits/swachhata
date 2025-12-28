import { useState, useEffect } from 'react'
import { fineService } from '../../services/complaint.service'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { FaFilter, FaMoneyBillWave } from 'react-icons/fa'

const AllFinesPage = () => {
    const [fines, setFines] = useState([])
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchFines()
    }, [pagination.page, filter])

    const fetchFines = async () => {
        setIsLoading(true)
        try {
            const response = await fineService.getAll({
                page: pagination.page,
                limit: 10,
                paymentStatus: filter || undefined
            })
            setFines(response.data.fines)
            setPagination(response.data.pagination)
        } catch (error) {
            console.error('Failed to fetch fines:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate totals
    const totals = fines.reduce((acc, f) => {
        acc.total += f.amount
        if (f.paymentStatus === 'paid') acc.paid += f.amount
        else acc.unpaid += f.amount
        return acc
    }, { total: 0, paid: 0, unpaid: 0 })

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>All Fines</h1>
                <div className="stats-summary">
                    <span>Total: {formatCurrency(totals.total)}</span>
                    <span className="paid">Paid: {formatCurrency(totals.paid)}</span>
                    <span className="unpaid">Unpaid: {formatCurrency(totals.unpaid)}</span>
                </div>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <FaFilter />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <span className="results-count">{pagination.total} fine(s)</span>
            </div>

            {isLoading ? (
                <div className="loading">Loading fines...</div>
            ) : fines.length === 0 ? (
                <div className="empty-state card">
                    <FaMoneyBillWave className="empty-icon" />
                    <p>No fines found</p>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Vehicle No</th>
                                    <th>Amount</th>
                                    <th>Issued By</th>
                                    <th>Issued Date</th>
                                    <th>Payment Status</th>
                                    <th>Paid Date</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fines.map(fine => (
                                    <tr key={fine._id}>
                                        <td className="vehicle-no">{fine.vehicleNo}</td>
                                        <td className="amount">{formatCurrency(fine.amount)}</td>
                                        <td>{fine.issuedBy?.name || '-'}</td>
                                        <td>{formatDate(fine.issuedAt)}</td>
                                        <td>
                                            <span className={`payment-badge ${fine.paymentStatus}`}>
                                                {fine.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td>{fine.paidAt ? formatDate(fine.paidAt) : '-'}</td>
                                        <td>{fine.paymentReference || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            >
                                Previous
                            </button>
                            <span>Page {pagination.page} of {pagination.pages}</span>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AllFinesPage
