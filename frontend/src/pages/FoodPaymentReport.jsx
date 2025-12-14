import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { RiCalendarLine, RiMoneyDollarCircleLine, RiLineChartLine, RiListOrdered } from 'react-icons/ri';
import "react-datepicker/dist/react-datepicker.css";
import './FoodPaymentReport.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const FoodPaymentReport = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [transactionsData, setTransactionsData] = useState(null);
    const [error, setError] = useState('');

    // Helper function to get user timezone
    const getUserTimezone = () => {
        return 'Asia/Kolkata';
    };

    // Function to export summary data to CSV
    const exportSummaryToCSV = () => {
        if (!summaryData) {
            setError('No summary data available to export');
            return;
        }

        // Create sections for CSV
        const sections = [
            // Overall Summary
            {
                title: 'Overall Summary',
                headers: ['Metric', 'Value'],
                rows: [
                    ['Total Collection', summaryData.total_collection || 0],
                    ['Total Refunds', summaryData.total_refunds || 0],
                    ['Net Collection', summaryData.net_collection || 0],
                    ['Total Food Orders', summaryData.total_orders || 0],
                    ['Total Order Amount', summaryData.total_amount || 0],
                    ['Total Paid Amount', summaryData.total_paid || 0],
                    ['Total Due Amount', summaryData.total_due || 0]
                ]
            },
            // Transaction Counts
            {
                title: 'Transaction Counts',
                headers: ['Type', 'Count'],
                rows: [
                    ['Total Transactions', summaryData.transaction_counts?.total || 0],
                    ['Payment Transactions', summaryData.transaction_counts?.payments || 0],
                    ['Refund Transactions', summaryData.transaction_counts?.refunds || 0]
                ]
            },
            // Payment Methods - Payments
            {
                title: 'Payments By Method',
                headers: ['Payment Method', 'Amount'],
                rows: Object.entries(summaryData.payment_mode_totals?.payments || {}).map(([method, amount]) => [
                    method,
                    amount || 0
                ])
            },
            // Payment Methods - Refunds
            {
                title: 'Refunds By Method',
                headers: ['Payment Method', 'Amount'],
                rows: Object.entries(summaryData.payment_mode_totals?.refunds || {}).map(([method, amount]) => [
                    method,
                    amount || 0
                ])
            }
        ];

        // Combine all sections into CSV content
        const csvContent = sections.map(section => {
            return [
                section.title,
                section.headers.join(','),
                ...section.rows.map(row => row.join(','))
            ].join('\n');
        }).join('\n\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `food-payment-summary-${format(startDate, 'dd-MM-yyyy')}-to-${format(endDate, 'dd-MM-yyyy')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to export transactions data to CSV
    const exportTransactionsToCSV = () => {
        if (!transactionsData || transactionsData.length === 0) {
            setError('No data available to export');
            return;
        }

        const headers = ['Transaction ID', 'Food Order ID', 'Booking ID', 'Date', 'Time', 'Amount', 'Payment Mode', 'Type', 'Status', 'Notes'];
        const rows = transactionsData.map(trans => {
            const dateTime = new Date(trans.created_at);
            return [
                trans.id,
                trans.food_order_id,
                trans.booking_id,
                format(dateTime, 'dd-MM-yyyy'),
                format(dateTime, 'HH:mm:ss'),
                trans.amount_paid,
                trans.payment_mode,
                trans.is_refund ? 'Refund' : 'Payment',
                trans.transaction_status,
                trans.notes || ''
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `food-payment-transactions-${format(startDate, 'dd-MM-yyyy')}-to-${format(endDate, 'dd-MM-yyyy')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to export trends data to CSV
    const exportTrendsToCSV = () => {
        if (!trendsData || trendsData.length === 0) {
            setError('No data available to export');
            return;
        }

        const headers = [
            'Date',
            'Total Payments',
            'Total Refunds',
            'Net Collection',
            'Cash Payments',
            'Card Payments',
            'UPI Payments',
            'Bank Transfer Payments',
            'Other Payments',
            'Cash Refunds',
            'Card Refunds',
            'UPI Refunds',
            'Bank Transfer Refunds',
            'Other Refunds',
            'Total Transactions',
            'Payment Count',
            'Refund Count'
        ];

        const rows = trendsData.map(day => {
            return [
                day.date,
                day.total_payments || 0,
                day.total_refunds || 0,
                day.net_collection || 0,
                day.payments?.Cash || 0,
                day.payments?.Card || 0,
                day.payments?.UPI || 0,
                day.payments?.['Bank Transfer'] || 0,
                day.payments?.Other || 0,
                day.refunds?.Cash || 0,
                day.refunds?.Card || 0,
                day.refunds?.UPI || 0,
                day.refunds?.['Bank Transfer'] || 0,
                day.refunds?.Other || 0,
                (day.payment_count || 0) + (day.refund_count || 0),
                day.payment_count || 0,
                day.refund_count || 0
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `food-payment-trends-${format(startDate, 'dd-MM-yyyy')}-to-${format(endDate, 'dd-MM-yyyy')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Fetch summary data
    const fetchSummary = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/food-payments/summary`, {
                params: {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                    end_date: format(endDate, 'yyyy-MM-dd'),
                    timezone: getUserTimezone()
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log('Food payment summary:', response.data);
            setSummaryData(response.data);
        } catch (err) {
            setError('Failed to fetch summary data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch trends data
    const fetchTrends = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/food-payments/trends`, {
                params: {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                    end_date: format(endDate, 'yyyy-MM-dd'),
                    timezone: getUserTimezone()
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log('Food payment trends:', response.data);
            setTrendsData(response.data);
        } catch (err) {
            setError('Failed to fetch trends data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transactions data
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/food-payments/transactions`, {
                params: {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                    end_date: format(endDate, 'yyyy-MM-dd'),
                    timezone: getUserTimezone()
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log('Food payment transactions:', response.data);
            setTransactionsData(response.data || []);
        } catch (err) {
            setError('Failed to fetch transactions data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab === 'summary') {
            fetchSummary();
        } else if (activeTab === 'trends') {
            fetchTrends();
        } else if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab, startDate, endDate]);

    return (
        <div className="cashier-report">
            {/* Tabs */}
            <div className="report-tabs">
                <button
                    className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('summary');
                        setError('');
                    }}>
                    <RiMoneyDollarCircleLine /> Summary
                </button>
                <button
                    className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('trends');
                        setError('');
                    }}>
                    <RiLineChartLine /> Trends
                </button>
                <button
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('transactions');
                        setError('');
                    }}>
                    <RiListOrdered /> Transactions
                </button>
            </div>

            {/* Date Selection */}
            <div className="date-selection">
                <div className="date-section">
                    <div className="date-range">
                        <div className="date-picker-container">
                            <label>Start Date</label>
                            <DatePicker
                                selected={startDate}
                                onChange={setStartDate}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={new Date()}
                                dateFormat="dd/MM/yyyy"
                                className="date-picker"
                            />
                        </div>
                        <div className="date-picker-container">
                            <label>End Date</label>
                            <DatePicker
                                selected={endDate}
                                onChange={setEndDate}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                maxDate={new Date()}
                                dateFormat="dd/MM/yyyy"
                                className="date-picker"
                            />
                        </div>
                    </div>
                    {activeTab === 'summary' && (
                        <button className="export-csv-btn" onClick={exportSummaryToCSV}>
                            Export CSV
                        </button>
                    )}
                    {activeTab === 'trends' && (
                        <button className="export-csv-btn" onClick={exportTrendsToCSV}>
                            Export CSV
                        </button>
                    )}
                    {activeTab === 'transactions' && (
                        <button className="export-csv-btn" onClick={exportTransactionsToCSV}>
                            Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Loading State */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="report-content">
                    {/* Summary Tab */}
            {activeTab === 'summary' && summaryData && (
                <div className="summary-container">
                    {/* Main Financial Cards */}
                    <div className="summary-cards">
                        <div className="summary-card income-card">
                            <div className="card-icon income">
                                <RiMoneyDollarCircleLine />
                            </div>
                            <div className="card-content">
                                <h3>Total Collection</h3>
                                <p className="positive">{formatCurrency(summaryData.total_collection || 0)}</p>
                                <small>Total Payments Received</small>
                                <div className="card-footer">
                                    <span>{summaryData.transaction_counts?.payments || 0} payments</span>
                                </div>
                            </div>
                        </div>

                        <div className="summary-card refunds-card">
                            <div className="card-icon refunds">
                                <RiMoneyDollarCircleLine />
                            </div>
                            <div className="card-content">
                                <h3>Total Refunds</h3>
                                <p className="negative">{formatCurrency(summaryData.total_refunds || 0)}</p>
                                <small>Total Refunds Processed</small>
                                <div className="card-footer">
                                    <span>{summaryData.transaction_counts?.refunds || 0} refunds</span>
                                </div>
                            </div>
                        </div>

                        <div className="summary-card net-card">
                            <div className="card-icon net">
                                <RiMoneyDollarCircleLine />
                            </div>
                            <div className="card-content">
                                <h3>Net Collection</h3>
                                <p className="neutral">{formatCurrency(summaryData.net_collection || 0)}</p>
                                <small>Collection - Refunds</small>
                                <div className="card-footer">
                                    <span>{summaryData.transaction_counts?.total || 0} total transactions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Food Order Statistics */}
                    <div className="stats-section">
                        <h3>Food Order & Payment Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Total Food Orders</h4>
                                <p>{summaryData.total_orders || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Total Order Amount</h4>
                                <p>{formatCurrency(summaryData.total_amount || 0)}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Total Paid</h4>
                                <p>{formatCurrency(summaryData.total_paid || 0)}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Total Due</h4>
                                <p>{formatCurrency(summaryData.total_due || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Counts */}
                    <div className="stats-section">
                        <h3>Transaction Summary</h3>
                        <div className="status-grid">
                            <div className="status-card">
                                <h4>Total Transactions</h4>
                                <p>{summaryData.transaction_counts?.total || 0}</p>
                            </div>
                            <div className="status-card">
                                <h4>Payment Transactions</h4>
                                <p>{summaryData.transaction_counts?.payments || 0}</p>
                            </div>
                            <div className="status-card">
                                <h4>Refund Transactions</h4>
                                <p>{summaryData.transaction_counts?.refunds || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="payment-methods-summary">
                        <h3>Payment Methods Breakdown</h3>
                        <div className="payment-breakdown">
                            <div className="payment-section">
                                <h4>Payments Received</h4>
                                <div className="payment-methods-grid">
                                    {Object.entries(summaryData.payment_mode_totals?.payments || {}).map(([method, amount]) => (
                                        <div key={method} className="payment-method-card">
                                            <h4>{method}</h4>
                                            <p>{formatCurrency(amount || 0)}</p>
                                        </div>
                                    ))}
                                    {Object.keys(summaryData.payment_mode_totals?.payments || {}).length === 0 && (
                                        <div className="payment-method-card empty">
                                            <p>No payments data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="payment-section">
                                <h4>Refunds Given</h4>
                                <div className="payment-methods-grid">
                                    {Object.entries(summaryData.payment_mode_totals?.refunds || {}).map(([method, amount]) => (
                                        <div key={method} className="payment-method-card">
                                            <h4>{method}</h4>
                                            <p>{formatCurrency(amount || 0)}</p>
                                        </div>
                                    ))}
                                    {Object.keys(summaryData.payment_mode_totals?.refunds || {}).length === 0 && (
                                        <div className="payment-method-card empty">
                                            <p>No refunds data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && trendsData && (
                <div className="trends-container">
                    <table className="trends-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Total Payments</th>
                                <th>Total Refunds</th>
                                <th>Net Collection</th>
                                <th>Cash Payments</th>
                                <th>Card Payments</th>
                                <th>UPI Payments</th>
                                <th>Bank Transfer</th>
                                <th>Others</th>
                                <th>Cash Refunds</th>
                                <th>Card Refunds</th>
                                <th>UPI Refunds</th>
                                <th>Bank Refunds</th>
                                <th>Others Refunds</th>
                                <th>Transactions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trendsData.map((day) => {
                                const localDate = new Date(day.date);
                                
                                return (
                                    <tr key={day.date}>
                                        <td>{format(localDate, 'dd MMM yyyy')}</td>
                                        <td className="amount positive">{formatCurrency(day.total_payments || 0)}</td>
                                        <td className="amount negative">{formatCurrency(day.total_refunds || 0)}</td>
                                        <td className={`amount ${day.net_collection >= 0 ? 'positive' : 'negative'}`}>
                                            {formatCurrency(day.net_collection || 0)}
                                        </td>
                                        <td className="amount">{formatCurrency(day.payments?.Cash || 0)}</td>
                                        <td className="amount">{formatCurrency(day.payments?.Card || 0)}</td>
                                        <td className="amount">{formatCurrency(day.payments?.UPI || 0)}</td>
                                        <td className="amount">{formatCurrency(day.payments?.['Bank Transfer'] || 0)}</td>
                                        <td className="amount">{formatCurrency(day.payments?.Other || 0)}</td>
                                        <td className="amount">{formatCurrency(day.refunds?.Cash || 0)}</td>
                                        <td className="amount">{formatCurrency(day.refunds?.Card || 0)}</td>
                                        <td className="amount">{formatCurrency(day.refunds?.UPI || 0)}</td>
                                        <td className="amount">{formatCurrency(day.refunds?.['Bank Transfer'] || 0)}</td>
                                        <td className="amount">{formatCurrency(day.refunds?.Other || 0)}</td>
                                        <td>{(day.payment_count || 0) + (day.refund_count || 0)} ({day.payment_count || 0} payments, {day.refund_count || 0} refunds)</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && transactionsData && (
                <div className="transactions-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Date & Time</th>
                                <th>Food Order ID</th>
                                <th>Booking ID</th>
                                <th>Transaction</th>
                                <th>Amount</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionsData.map((trans) => {
                                const localTime = new Date(trans.created_at);
                                return (
                                    <tr key={trans.id} 
                                        className={`transaction-row ${trans.is_refund ? 'refund-row' : 'payment-row'}`}>
                                        <td className="transaction-id">
                                            <span className="id-text">{trans.id.slice(0, 8)}...</span>
                                        </td>
                                        <td>{format(localTime, 'dd MMM yyyy hh:mm a')}</td>
                                        <td className="transaction-id">
                                            <span className="id-text">{trans.food_order_id?.slice(0, 8)}...</span>
                                        </td>
                                        <td className="booking-id">#{trans.booking_id}</td>
                                        <td>
                                            <span className={`transaction-type ${trans.is_refund ? 'type-refund' : 'type-payment'}`}>
                                                {trans.is_refund ? 'Refund' : 'Payment'}
                                            </span>
                                        </td>
                                        <td className={`amount ${trans.is_refund ? 'amount-refund' : 'amount-payment'}`}>
                                            {formatCurrency(trans.amount_paid)}
                                        </td>
                                        <td>
                                            <span className={`payment-mode mode-${trans.payment_mode.toLowerCase().replace(' ', '-')}`}>
                                                {trans.payment_mode}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`payment-status status-${trans.transaction_status.toLowerCase()}`}>
                                                {trans.transaction_status}
                                            </span>
                                        </td>
                                        <td>{trans.notes || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
                </div>
            )}
        </div>
    );
};

export default FoodPaymentReport;
