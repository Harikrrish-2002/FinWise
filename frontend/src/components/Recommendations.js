import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  PiggyBank,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingsGoal, setSavingsGoal] = useState('');
  const [goalTimeframe, setGoalTimeframe] = useState('12');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Temporary mock FD data (you can remove this when backend provides real data)
  useEffect(() => {
    if (recommendationData && !recommendationData.fixed_deposits) {
      setRecommendationData((prev) => ({
        ...prev,
        fixed_deposits: [
          {
            bank_name: "State Bank of India",
            amount: 100000,
            interest_rate: 6.8,
            tenure_years: 3,
            compounding_frequency: 4 // Quarterly
          },
          {
            bank_name: "India Post Office",
            amount: 50000,
            interest_rate: 7.5,
            tenure_years: 5,
            compounding_frequency: 4
          },
          {
            bank_name: "HDFC Bank",
            amount: 75000,
            interest_rate: 7.0,
            tenure_years: 2,
            compounding_frequency: 4
          }
        ]
      }));
    }
  }, [recommendationData]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('/api/recommendations');
      setRecommendationData(response.data);
    } catch (error) {
      toast.error('Failed to fetch recommendations');
      console.error('Recommendations fetch error:', error);
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

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return <AlertTriangle size={24} />;
      case 'investment':
        return <TrendingUp size={24} />;
      case 'category_alert':
        return <Target size={24} />;
      default:
        return <Lightbulb size={24} />;
    }
  };

  const getRecommendationClass = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'alert':
        return 'danger';
      case 'investment':
        return 'success';
      case 'category_alert':
        return 'info';
      default:
        return 'info';
    }
  };

  const calculateGoalProgress = () => {
    if (!recommendationData || !savingsGoal) return null;
    const monthlyTarget = parseFloat(savingsGoal) / parseInt(goalTimeframe);
    const currentMonthlySavings = recommendationData.monthly_savings;
    const progress = (currentMonthlySavings / monthlyTarget) * 100;
    
    return {
      monthlyTarget,
      currentMonthlySavings,
      progress: Math.min(progress, 100),
      shortfall: Math.max(monthlyTarget - currentMonthlySavings, 0)
    };
  };

  const getInvestmentSuggestions = () => {
    if (!recommendationData) return [];
    const monthlySavings = recommendationData.monthly_savings;
    const suggestions = [];

    if (monthlySavings > 0) {
      suggestions.push({
        title: 'Emergency Fund',
        description: 'Build an emergency fund covering 6 months of expenses',
        allocation: Math.min(monthlySavings * 0.3, 10000),
        risk: 'Low',
        returns: '4-6% annually',
        instruments: ['Savings Account', 'Liquid Funds', 'Fixed Deposits']
      });

      if (monthlySavings > 5000) {
        suggestions.push({
          title: 'Systematic Investment Plan (SIP)',
          description: 'Invest in diversified equity mutual funds for long-term wealth creation',
          allocation: monthlySavings * 0.4,
          risk: 'Medium to High',
          returns: '12-15% annually',
          instruments: ['Large Cap Funds', 'Mid Cap Funds', 'Index Funds']
        });
      }

      suggestions.push({
        title: 'Tax Saving Investments',
        description: 'Save taxes under Section 80C while building wealth',
        allocation: Math.min(monthlySavings * 0.2, 12500),
        risk: 'Medium',
        returns: '8-12% annually',
        instruments: ['ELSS Funds', 'PPF', 'NSC', 'Tax Saver FDs']
      });

      if (monthlySavings > 3000) {
        suggestions.push({
          title: 'Gold Investment',
          description: 'Hedge against inflation with gold investments',
          allocation: monthlySavings * 0.1,
          risk: 'Medium',
          returns: '8-10% annually',
          instruments: ['Gold ETFs', 'Digital Gold', 'Gold Mutual Funds']
        });
      }
    }
    return suggestions;
  };

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your financial data...</p>
      </div>
    );
  }

  if (!recommendationData) {
    return (
      <div className="recommendations-error">
        <AlertTriangle size={48} />
        <h3>Unable to generate recommendations</h3>
        <p>Please add some income and expense data first.</p>
        <button className="btn btn-primary" onClick={fetchRecommendations}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const goalProgress = calculateGoalProgress();
  const investmentSuggestions = getInvestmentSuggestions();

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <div>
          <h1>Financial Recommendations</h1>
          <p>Personalized insights to improve your financial health</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchRecommendations}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Financial Overview */}
      <div className="financial-overview">
        <div className="overview-card income">
          <div className="overview-icon"><TrendingUp size={24} /></div>
          <div className="overview-content">
            <h3>Monthly Income</h3>
            <p>{formatCurrency(recommendationData.monthly_income)}</p>
          </div>
        </div>

        <div className="overview-card expenses">
          <div className="overview-icon"><DollarSign size={24} /></div>
          <div className="overview-content">
            <h3>Monthly Expenses</h3>
            <p>{formatCurrency(recommendationData.monthly_expenses)}</p>
          </div>
        </div>

        <div className="overview-card savings">
          <div className="overview-icon"><PiggyBank size={24} /></div>
          <div className="overview-content">
            <h3>Monthly Savings</h3>
            <p>{formatCurrency(recommendationData.monthly_savings)}</p>
          </div>
        </div>

        <div className="overview-card rate">
          <div className="overview-icon"><Target size={24} /></div>
          <div className="overview-content">
            <h3>Savings Rate</h3>
            <p>{recommendationData.savings_rate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Savings Goal Tracker */}
      <div className="savings-goal-section">
        <h2>Savings Goal Tracker</h2>
        <div className="goal-input-section">
          <div className="goal-inputs">
            <div className="form-group">
              <label htmlFor="savingsGoal">Target Amount (₹)</label>
              <input
                type="number"
                id="savingsGoal"
                className="form-control"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                placeholder="Enter your savings goal"
              />
            </div>
            <div className="form-group">
              <label htmlFor="goalTimeframe">Timeframe (months)</label>
              <select
                id="goalTimeframe"
                className="form-control"
                value={goalTimeframe}
                onChange={(e) => setGoalTimeframe(e.target.value)}
              >
                <option value="6">6 months</option>
                <option value="12">1 year</option>
                <option value="24">2 years</option>
                <option value="36">3 years</option>
                <option value="60">5 years</option>
              </select>
            </div>
          </div>
          
          {goalProgress && (
            <div className="goal-progress">
              <div className="progress-header">
                <h3>Goal Progress</h3>
                <span className="progress-percentage">{goalProgress.progress.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${goalProgress.progress}%` }}
                />
              </div>
              <div className="progress-details">
                <div className="progress-item">
                  <span>Monthly Target:</span>
                  <span>{formatCurrency(goalProgress.monthlyTarget)}</span>
                </div>
                <div className="progress-item">
                  <span>Current Savings:</span>
                  <span>{formatCurrency(goalProgress.currentMonthlySavings)}</span>
                </div>
                {goalProgress.shortfall > 0 && (
                  <div className="progress-item shortfall">
                    <span>Monthly Shortfall:</span>
                    <span>{formatCurrency(goalProgress.shortfall)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="recommendations-section">
        <h2>Personalized Recommendations</h2>
        <div className="recommendations-list">
          {recommendationData.recommendations.map((rec, index) => (
            <div key={index} className={`recommendation-card ${getRecommendationClass(rec.type)}`}>
              <div className="recommendation-icon">{getRecommendationIcon(rec.type)}</div>
              <div className="recommendation-content">
                <h3>{rec.title}</h3>
                <p className="recommendation-message">{rec.message}</p>
                <p className="recommendation-suggestion">{rec.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Suggestions */}
      {investmentSuggestions.length > 0 && (
        <div className="investment-section">
          <h2>Investment Recommendations</h2>
          <div className="investment-grid">
            {investmentSuggestions.map((investment, index) => (
              <div key={index} className="investment-card">
                <div className="investment-header">
                  <h3>{investment.title}</h3>
                  <span className={`risk-badge ${investment.risk.toLowerCase().replace(' ', '-')}`}>
                    {investment.risk} Risk
                  </span>
                </div>
                <p className="investment-description">{investment.description}</p>
                <div className="investment-details">
                  <div className="investment-allocation">
                    <span>Suggested Monthly Investment:</span>
                    <strong>{formatCurrency(investment.allocation)}</strong>
                  </div>
                  <div className="investment-returns">
                    <span>Expected Returns:</span>
                    <strong>{investment.returns}</strong>
                  </div>
                  <div className="investment-instruments">
                    <span>Instruments:</span>
                    <div className="instruments-list">
                      {investment.instruments.map((instrument, idx) => (
                        <span key={idx} className="instrument-tag">{instrument}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Fixed Deposit Investments Section */}
      {recommendationData.fixed_deposits && recommendationData.fixed_deposits.length > 0 && (
        <div className="fd-section">
          <h2>Fixed Deposit Investments</h2>
          <div className="fd-grid">
            {recommendationData.fixed_deposits.map((fd, index) => {
              const maturityAmount = fd.amount * Math.pow(1 + fd.interest_rate / 100 / fd.compounding_frequency, fd.tenure_years * fd.compounding_frequency);
              const totalReturn = maturityAmount - fd.amount;
              const annualizedReturn = ((maturityAmount / fd.amount) ** (1 / fd.tenure_years) - 1) * 100;

              return (
                <div key={index} className="fd-card">
                  <div className="fd-header">
                    <h3>{fd.bank_name}</h3>
                    <span className="fd-type">Fixed Deposit</span>
                  </div>
                  <div className="fd-details">
                    <div className="fd-item"><span>Principal:</span><strong>{formatCurrency(fd.amount)}</strong></div>
                    <div className="fd-item"><span>Interest Rate:</span><strong>{fd.interest_rate}% p.a.</strong></div>
                    <div className="fd-item"><span>Tenure:</span><strong>{fd.tenure_years} years</strong></div>
                    <div className="fd-item"><span>Maturity Amount:</span><strong>{formatCurrency(maturityAmount.toFixed(0))}</strong></div>
                    <div className="fd-item"><span>Estimated Returns:</span><strong className="fd-returns">+{formatCurrency(totalReturn.toFixed(0))}</strong></div>
                    <div className="fd-item"><span>Annualized Return:</span><strong>{annualizedReturn.toFixed(2)}%</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Spending Analysis */}
      {recommendationData.expense_categories && Object.keys(recommendationData.expense_categories).length > 0 && (
        <div className="category-analysis-section">
          <h2>Spending Analysis</h2>
          <div className="category-list">
            {Object.entries(recommendationData.expense_categories)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / recommendationData.monthly_expenses) * 100;
                return (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="category-amount">{formatCurrency(amount)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
