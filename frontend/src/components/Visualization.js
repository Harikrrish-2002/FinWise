import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { BarChart3, TrendingUp, PieChart, Calendar, RefreshCw } from 'lucide-react';
import './Visualization.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Visualization = () => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('monthly');

  useEffect(() => {
    fetchVisualizationData();
  }, []);

  const fetchVisualizationData = async () => {
    try {
      const response = await axios.get('/api/visualization');
      setVisualizationData(response.data);
    } catch (error) {
      toast.error('Failed to fetch visualization data');
      console.error('Visualization fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const getMonthlyChartData = () => {
    if (!visualizationData?.monthly_chart) return null;

    const { labels, data } = visualizationData.monthly_chart;
    
    return {
      labels: labels.map(formatMonth),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: data,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  const getCategoryChartData = () => {
    if (!visualizationData?.category_chart) return null;

    const { labels, data } = visualizationData.category_chart;
    
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
      '#14b8a6', '#f43f5e', '#a855f7', '#22c55e', '#eab308'
    ];

    return {
      labels: labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color),
          borderWidth: 2,
        }
      ]
    };
  };

  const getTrendChartData = () => {
    if (!visualizationData?.monthly_chart) return null;

    const { labels, data } = visualizationData.monthly_chart;
    
    return {
      labels: labels.map(formatMonth),
      datasets: [
        {
          label: 'Spending Trend',
          data: data,
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  const getInsights = () => {
    if (!visualizationData) return [];

    const insights = [];
    const { monthly_chart, category_chart } = visualizationData;

    if (monthly_chart?.data?.length > 1) {
      const lastMonth = monthly_chart.data[monthly_chart.data.length - 1];
      const previousMonth = monthly_chart.data[monthly_chart.data.length - 2];
      const change = ((lastMonth - previousMonth) / previousMonth) * 100;

      if (change > 10) {
        insights.push({
          type: 'warning',
          title: 'Spending Increase',
          message: `Your expenses increased by ${change.toFixed(1)}% last month.`
        });
      } else if (change < -10) {
        insights.push({
          type: 'success',
          title: 'Spending Decrease',
          message: `Great job! Your expenses decreased by ${Math.abs(change).toFixed(1)}% last month.`
        });
      }
    }

    if (category_chart?.labels?.length > 0) {
      const maxIndex = category_chart.data.indexOf(Math.max(...category_chart.data));
      const topCategory = category_chart.labels[maxIndex];
      const topAmount = category_chart.data[maxIndex];
      const total = category_chart.data.reduce((a, b) => a + b, 0);
      const percentage = (topAmount / total) * 100;

      if (percentage > 40) {
        insights.push({
          type: 'info',
          title: 'Top Spending Category',
          message: `${topCategory} accounts for ${percentage.toFixed(1)}% of your total expenses.`
        });
      }
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="visualization-loading">
        <div className="loading-spinner"></div>
        <p>Loading visualization data...</p>
      </div>
    );
  }

  if (!visualizationData || (!visualizationData.monthly_chart?.data?.length && !visualizationData.category_chart?.data?.length)) {
    return (
      <div className="visualization-empty">
        <BarChart3 size={48} />
        <h3>No data to visualize</h3>
        <p>Add some expenses to see your spending patterns and trends.</p>
        <button className="btn btn-primary" onClick={fetchVisualizationData}>
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>
    );
  }

  const monthlyData = getMonthlyChartData();
  const categoryData = getCategoryChartData();
  const trendData = getTrendChartData();
  const insights = getInsights();

  return (
    <div className="visualization-page">
      <div className="visualization-header">
        <div>
          <h1>Spending Visualization</h1>
          <p>Analyze your financial patterns with interactive charts</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchVisualizationData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Chart Navigation */}
      <div className="chart-navigation">
        <button 
          className={`nav-btn ${activeChart === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveChart('monthly')}
        >
          <BarChart3 size={20} />
          Monthly Expenses
        </button>
        <button 
          className={`nav-btn ${activeChart === 'category' ? 'active' : ''}`}
          onClick={() => setActiveChart('category')}
        >
          <PieChart size={20} />
          Category Breakdown
        </button>
        <button 
          className={`nav-btn ${activeChart === 'trend' ? 'active' : ''}`}
          onClick={() => setActiveChart('trend')}
        >
          <TrendingUp size={20} />
          Spending Trend
        </button>
      </div>

      {/* Main Chart */}
      <div className="main-chart-container">
        <div className="chart-wrapper">
          {activeChart === 'monthly' && monthlyData && (
            <Bar data={monthlyData} options={chartOptions} />
          )}
          {activeChart === 'category' && categoryData && (
            <Doughnut data={categoryData} options={doughnutOptions} />
          )}
          {activeChart === 'trend' && trendData && (
            <Line data={trendData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h2>Spending Insights</h2>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'success' && <TrendingUp size={24} />}
                  {insight.type === 'warning' && <Calendar size={24} />}
                  {insight.type === 'info' && <PieChart size={24} />}
                </div>
                <div className="insight-content">
                  <h3>{insight.title}</h3>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-section">
        <h2>Summary Statistics</h2>
        <div className="summary-grid">
          {monthlyData && (
            <div className="summary-card">
              <h3>Average Monthly Spending</h3>
              <p className="summary-value">
                {formatCurrency(monthlyData.datasets[0].data.reduce((a, b) => a + b, 0) / monthlyData.datasets[0].data.length)}
              </p>
            </div>
          )}
          
          {categoryData && (
            <div className="summary-card">
              <h3>Total Categories</h3>
              <p className="summary-value">{categoryData.labels.length}</p>
            </div>
          )}
          
          {categoryData && (
            <div className="summary-card">
              <h3>Highest Category</h3>
              <p className="summary-value">
                {categoryData.labels[categoryData.datasets[0].data.indexOf(Math.max(...categoryData.datasets[0].data))]}
              </p>
            </div>
          )}
          
          {monthlyData && monthlyData.datasets[0].data.length > 1 && (
            <div className="summary-card">
              <h3>Latest Month</h3>
              <p className="summary-value">
                {formatCurrency(monthlyData.datasets[0].data[monthlyData.datasets[0].data.length - 1])}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualization;
