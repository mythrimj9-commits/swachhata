import { useState, useEffect } from 'react'
import { fineService } from '../../services/complaint.service'
import { formatDate, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { FaMoneyBillWave, FaCreditCard, FaFilter } from 'react-icons/fa'

const MyFinesPage = () => {
    const [fines, setFines] = useState([])
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [payingId, setPayingId] = useState(null)

    useEffect(() => {
        fetchFines()
    }, [pagination.page, filter])

    const fetchFines = async () => {
        setIsLoading(true)
        try {
            const response = await fineService.getMyFines({
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

    const handlePayFine = async (fineId) => {
        if (!confirm('Proceed with mock payment?')) return

        setPayingId(fineId)
        try {
            await fineService.pay(fineId)
            toast.success('Payment successful!')
            fetchFines()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed')
        } finally {
            setPayingId(null)
        }
    }

    // Calculate totals
    const totalUnpaid = fines
        .filter(f => f.paymentStatus === 'unpaid')
        .reduce((sum, f) => sum + f.amount, 0)

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>My Fines</h1>
                {totalUnpaid > 0 && (
                    <div className="total-unpaid">
                        Total Unpaid: <strong>{formatCurrency(totalUnpaid)}</strong>
                    </div>
                )}
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
                <div className="fines-list">
                    {fines.map(fine => (
                        <div key={fine._id} className="fine-card card">
                            <div className="fine-image">
                                <img
                                    src={fine.complaintId?.imageUrl}
                                    alt="Complaint"
                                />
                            </div>
                            <div className="fine-details">
                                <div className="fine-info">
                                    <h3>🚗 {fine.vehicleNo}</h3>
                                    <p className="fine-location">{fine.complaintId?.address || 'Location marked'}</p>
                                    <p className="fine-date">Issued: {formatDate(fine.issuedAt)}</p>
                                    {fine.remarks && <p className="fine-remarks">{fine.remarks}</p>}
                                </div>
                                <div className="fine-amount-section">
                                    <p className="fine-amount">{formatCurrency(fine.amount)}</p>
                                    <span className={`payment-badge ${fine.paymentStatus}`}>
                                        {fine.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                                    </span>
                                    {fine.paymentStatus === 'unpaid' && (
                                        <button
                                            className="btn btn-primary btn-sm mt-2"
                                            onClick={() => handlePayFine(fine._id)}
                                            disabled={payingId === fine._id}
                                        >
                                            <FaCreditCard />
                                            {payingId === fine._id ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    )}
                                    {fine.paymentStatus === 'paid' && (
                                        <p className="payment-ref">Ref: {fine.paymentReference}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
        </div>
    )
}

export default MyFinesPage
