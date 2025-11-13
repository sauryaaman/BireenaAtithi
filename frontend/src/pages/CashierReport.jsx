import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { RiCalendarLine, RiMoneyDollarCircleLine, RiLineChartLine, RiListOrdered } from 'react-icons/ri';
import "react-datepicker/dist/react-datepicker.css";
import './CashierReport.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const CashierReport = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [singleDate, setSingleDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [transactionsData, setTransactionsData] = useState(null);
    const [error, setError] = useState('');

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
                    ['Total Bookings', summaryData.total_bookings || 0],
                    ['Total Booking Amount', summaryData.total_amount || 0],
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
        link.setAttribute('download', `summary-report-${format(startDate, 'dd-MM-yyyy')}-to-${format(endDate, 'dd-MM-yyyy')}.csv`);
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

        // Create CSV headers
        const headers = [
            'Transaction ID',
            'Date & Time',
            'Booking ID',
            'Transaction Type',
            'Amount',
            'Payment Mode',
            'Booking Status',
            'Payment Status',
            'Total Amount',
            'Paid Amount',
            'Due Amount',
            'Refund Amount'
        ];

        // Create CSV rows
        const rows = transactionsData.map(transaction => {
            const booking = transaction.bookings || {};
            // Prefer created_at_ist, fallback to payment_date
            const dateString = transaction.created_at_ist || transaction.payment_date || transaction.created_at;
            const localTime = dateString ? new Date(dateString) : new Date();
            return [
                transaction.transaction_id,
                format(localTime, 'dd/MM/yyyy hh:mm a'),
                transaction.booking_id,
                transaction.is_refund ? 'Refund' : 'Payment',
                transaction.amount_paid,
                transaction.payment_mode,
                booking.status || '',
                booking.payment_status || '',
                booking.total_amount || '',
                booking.amount_paid || '',
                booking.amount_due || 0,
                booking.refund_amount || 0
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions-${format(startDate, 'dd-MM-yyyy')}-to-${format(endDate, 'dd-MM-yyyy')}.csv`);
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

        // Create CSV headers
        const headers = [
            'Date',
            'Total Payments',
            'Total Refunds',
            'Net Collection',
            'Cash Payments',
            'Card Payments',
            'UPI Payments',
            'Bank Transfer',
            'Others',
            'Cash Refunds',
            'Card Refunds',
            'UPI Refunds',
            'Bank Refunds',
            'Others Refunds',
            'Total Transactions',
            'Payment Transactions',
            'Refund Transactions'
        ];

        // Create CSV rows
        const rows = trendsData.map(day => {
            const date = new Date(day.date);
            // Format date without quotes and use a format that Excel recognizes directly
            return [
                //format(date, 'dd/MM/yyyy'),
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

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `cashier-report-trends-${format(startDate, 'dd-MM-yyyy')}-to-${format(endDate, 'dd-MM-yyyy')}.csv`);
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

    // const getUserTimezone = () => {
    //     // You might want to get this from user preferences or system settings
    //     return 'Asia/Kolkata';
    // };

    // Fetch summary data
    const fetchSummary = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/cashier/summary`, {
                params: {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                    end_date: format(endDate, 'yyyy-MM-dd'),
                    timezone: getUserTimezone()
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);
            setSummaryData(response.data);
        } catch (err) {
            setError('Failed to fetch summary data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // // Fetch trends data
    // const fetchTrends = async () => {
    //     try {
    //         setLoading(true);
    //         const token = localStorage.getItem('token');
            
    //         // Generate array of all dates between start and end date
    //         const dates = [];
    //         let currentDate = new Date(startDate);
    //         const endDateTime = new Date(endDate);
            
    //         while (currentDate <= endDateTime) {
    //             dates.push(format(currentDate, 'yyyy-MM-dd'));
    //             currentDate.setDate(currentDate.getDate() + 1);
    //         }
            
    //         const response = await axios.get(`${BASE_URL}/api/cashier/payment-trends`, {
    //             params: {
    //                 start_date: format(startDate, 'yyyy-MM-dd'),
    //                 end_date: format(endDate, 'yyyy-MM-dd'),
    //                 timezone: getUserTimezone()
    //             },
    //             headers: { Authorization: `Bearer ${token}` }
    //         });

    //         // Create a map of existing data
    //         const dataMap = response.data.reduce((acc, item) => {
    //             acc[item.date] = item;
    //             return acc;
    //         }, {});

    //         // Fill in missing dates with zero values
    //         const filledData = dates.map(date => {
    //             if (dataMap[date]) {
    //                 return dataMap[date];
    //             }
    //             return {
    //                 date,
    //                 total_payments: 0,
    //                 total_refunds: 0,
    //                 net_collection: 0,
    //                 payment_count: 0,
    //                 refund_count: 0,
    //                 payments: {
    //                     Cash: 0,
    //                     Card: 0,
    //                     UPI: 0,
    //                     'Bank Transfer': 0,
    //                     Other: 0
    //                 },
    //                 refunds: {
    //                     Cash: 0,
    //                     Card: 0,
    //                     UPI: 0,
    //                     'Bank Transfer': 0,
    //                     Other: 0
    //                 }
    //             };
    //         });

    //         setTrendsData(filledData);
    //         setError('');
    //     } catch (err) {
    //         setError('Failed to fetch trends data');
    //         console.error('Error fetching trends data:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };


 const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

const fetchTrends = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(`${BASE_URL}/api/cashier/payment-trends`, {
            params: {
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
                timezone: getUserTimezone() // IANA timezone
            },
            headers: { Authorization: `Bearer ${token}` }
        });
       console.log("satart",startDate,"end", endDate, response.data);

        // Map backend response to local dates for UI
        const dates = [];
        let currentDate = new Date(startDate);
        const endDateTime = new Date(endDate);
        while (currentDate <= endDateTime) {
            dates.push(format(currentDate, 'yyyy-MM-dd'));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const dataMap = response.data.reduce((acc, item) => {
            acc[item.date] = item;
            return acc;
        }, {});

        const filledData = dates.map(date => dataMap[date] || {
            date,
            total_payments: 0,
            total_refunds: 0,
            net_collection: 0,
            payment_count: 0,
            refund_count: 0,
            payments: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 },
            refunds: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 }
        });

        setTrendsData(filledData);
        setError('');
    } catch (err) {
        setError('Failed to fetch trends data');
        console.error('Error fetching trends data:', err);
    } finally {
        setLoading(false);
    }
};


 



    // Fetch transactions data (accepts start_date & end_date range)
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/cashier/daily-transactions`, {
                params: {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                    end_date: format(endDate, 'yyyy-MM-dd'),
                    timezone: getUserTimezone()
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            // The backend returns a flat list of transactions across the date range
            setTransactionsData(response.data || []);
        } catch (err) {
            setError('Failed to fetch transactions data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Effect for fetching data based on active tab
    useEffect(() => {
        if (activeTab === 'summary') {
            fetchSummary();
        } else if (activeTab === 'trends') {
            fetchTrends();
        } else if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab, startDate, endDate, singleDate]);

    // Render summary section
    const renderSummary = () => {
        if (!summaryData) return null;

        const {
            total_bookings = 0,
            total_amount = 0,
            total_paid = 0,
            total_due = 0,
            total_collection = 0,
            total_refunds = 0,
            net_collection = 0,
            transaction_counts = {
                payments: 0,
                refunds: 0,
                total: 0
            },
            payment_mode_totals = {
                payments: {},
                refunds: {}
            },
            time_period = {
                start_date: '',
                end_date: '',
                is_single_day: false
            }
        } = summaryData;

        return (
            <div className="summary-container">
                

                {/* Main Financial Cards */}
                <div className="summary-cards">
                    <div className="summary-card income-card">
                        <div className="card-icon income">
                            <RiMoneyDollarCircleLine />
                        </div>
                        <div className="card-content">
                            <h3>Total Collection</h3>
                            <p className="positive">{formatCurrency(total_collection || 0)}</p>
                            <small>Total Payments Received</small>
                            <div className="card-footer">
                                <span>{transaction_counts.payments || 0} payments</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card refunds-card">
                        <div className="card-icon refunds">
                            <RiMoneyDollarCircleLine />
                        </div>
                        <div className="card-content">
                            <h3>Total Refunds</h3>
                            <p className="negative">{formatCurrency(total_refunds || 0)}</p>
                            <small>Total Refunds Processed</small>
                            <div className="card-footer">
                                <span>{transaction_counts.refunds || 0} refunds</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card net-card">
                        <div className="card-icon net">
                            <RiMoneyDollarCircleLine />
                        </div>
                        <div className="card-content">
                            <h3>Net Collection</h3>
                            <p className="neutral">{formatCurrency(net_collection || 0)}</p>
                            <small>Collection - Refunds</small>
                            <div className="card-footer">
                                <span>{transaction_counts.total || 0} total transactions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Statistics */}
                <div className="stats-section">
                    <h3>Booking & Payment Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h4>Total Bookings</h4>
                            <p>{total_bookings || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Total Booking Amount</h4>
                            <p>{formatCurrency(total_amount || 0)}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Total Paid</h4>
                            <p>{formatCurrency(total_paid || 0)}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Total Due</h4>
                            <p>{formatCurrency(total_due || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Transaction Counts */}
                <div className="stats-section">
                    <h3>Transaction Summary</h3>
                    <div className="status-grid">
                        <div className="status-card">
                            <h4>Total Transactions</h4>
                            <p>{transaction_counts.total || 0}</p>
                        </div>
                        <div className="status-card">
                            <h4>Payment Transactions</h4>
                            <p>{transaction_counts.payments || 0}</p>
                        </div>
                        <div className="status-card">
                            <h4>Refund Transactions</h4>
                            <p>{transaction_counts.refunds || 0}</p>
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
                                {Object.entries(payment_mode_totals.payments).map(([method, amount]) => (
                                    <div key={method} className="payment-method-card">
                                        <h4>{method}</h4>
                                        <p>{formatCurrency(amount || 0)}</p>
                                    </div>
                                ))}
                                {Object.keys(payment_mode_totals.payments).length === 0 && (
                                    <div className="payment-method-card empty">
                                        <p>No payments data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="payment-section">
                            <h4>Refunds Given</h4>
                            <div className="payment-methods-grid">
                                {Object.entries(payment_mode_totals.refunds).map(([method, amount]) => (
                                    <div key={method} className="payment-method-card">
                                        <h4>{method}</h4>
                                        <p>{formatCurrency(amount || 0)}</p>
                                    </div>
                                ))}
                                {Object.keys(payment_mode_totals.refunds).length === 0 && (
                                    <div className="payment-method-card empty">
                                        <p>No refunds data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render trends section
    const renderTrends = () => {
        if (!trendsData) return null;

        return (
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
                            // The date is already in local timezone format
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
        );
    };

    // Render transactions section
    const renderTransactions = () => {
        if (!transactionsData) return null;

        return (
            <div className="transactions-container">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Date & Time</th>
                            <th>Booking ID</th>
                            <th>Transaction</th>
                            <th>Amount</th>
                            <th>Mode</th>
                            <th>Booking Status</th>
                            <th>Payment Status</th>
                            <th>Booking Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionsData.map((transaction) => {
                            const booking = transaction.bookings;
                            // The date is already in local timezone format
                            const localTime = new Date(transaction.payment_date);

                            return (
                                <tr key={transaction.transaction_id} 
                                    className={`transaction-row ${transaction.is_refund ? 'refund-row' : 'payment-row'}`}>
                                    <td className="transaction-id">
                                        <span className="id-text">{transaction.transaction_id.slice(0, 8)}...</span>
                                    </td>
                                    <td>{format(localTime, 'dd MMM yyyy hh:mm a')}</td>
                                    <td className="booking-id">#{transaction.booking_id}</td>
                                    <td>
                                        <span className={`transaction-type ${transaction.is_refund ? 'type-refund' : 'type-payment'}`}>
                                            {transaction.is_refund ? 'Refund' : 'Payment'}
                                        </span>
                                    </td>
                                    <td className={`amount ${transaction.is_refund ? 'amount-refund' : 'amount-payment'}`}>
                                        {formatCurrency(transaction.amount_paid)}
                                    </td>
                                    <td>
                                        <span className={`payment-mode mode-${transaction.payment_mode.toLowerCase().replace(' ', '-')}`}>
                                            {transaction.payment_mode}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`booking-status status-${booking.status.toLowerCase().replace(' ', '-')}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`payment-status status-${booking.payment_status.toLowerCase()}`}>
                                            {booking.payment_status}
                                        </span>
                                    </td>
                                    <td className="booking-details">
                                        <div className="details-grid">
                                            <div>Total: {formatCurrency(booking.total_amount)}</div>
                                            <div>Paid: {formatCurrency(booking.amount_paid)}</div>
                                            {booking.amount_due > 0 && (
                                                <div className="amount-due">Due: {formatCurrency(booking.amount_due)}</div>
                                            )}
                                            {booking.refund_amount > 0 && (
                                                <div className="refund-amount">Refunded: {formatCurrency(booking.refund_amount)}</div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="cashier-report">
            <h1>Cashier Report</h1>

            {/* Tabs */}
            <div className="report-tabs">
                <button 
                    className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('summary');
                        setError(''); // Clear error when switching tabs
                    }}>
                    <RiMoneyDollarCircleLine /> Summary
                </button>
                <button 
                    className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('trends');
                        setError(''); // Clear error when switching tabs
                    }}>
                    <RiLineChartLine /> Trends
                </button>
                <button 
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('transactions');
                        setError(''); // Clear error when switching tabs
                    }}>
                    <RiListOrdered /> Transactions
                </button>
            </div>

            {/* Date Selection */}
            <div className="date-selection">
                {activeTab !== 'transactions' ? (
                    <>
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
                            {(activeTab === 'trends' || activeTab === 'summary') && (
                                <button 
                                    className="export-csv-btn"
                                    onClick={activeTab === 'trends' ? exportTrendsToCSV : exportSummaryToCSV}>
                                    Export CSV
                                </button>
                            )}
                        </div>
                    </>
                ) : (
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
                        <button 
                            className="export-csv-btn"
                            onClick={exportTransactionsToCSV}>
                            Export CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Loading State */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                // Content based on active tab
                <div className="report-content">
                    {activeTab === 'summary' && renderSummary()}
                    {activeTab === 'trends' && renderTrends()}
                    {activeTab === 'transactions' && renderTransactions()}
                </div>
            )}
        </div>
    );
};

export default CashierReport;