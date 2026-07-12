import { MONTHLY_ANALYTICS, pctChange } from "@/data/analytics";
import { PARTNERS } from "@/data/partners";
import { APIS } from "@/data/apis";
import { API_PRODUCTS } from "@/data/apiProducts";
import { mulberry32, linearForecast } from "@/lib/utils";

const rnd = mulberry32(9191);

export const REVENUE_BY_MONTH = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, revenueAed: m.revenueAed }));

export const REVENUE_BY_PARTNER = PARTNERS.map((p) => ({ name: p.name, revenueAed: p.revenueAed })).sort((a, b) => b.revenueAed - a.revenueAed);

export const REVENUE_BY_API_PRODUCT = API_PRODUCTS.map((p) => ({
  name: p.name,
  revenueAed: Math.round(p.monthlyFeeAed * (6 + rnd() * 20)),
}));

export const REVENUE_BY_DOMAIN = (() => {
  const domains = Array.from(new Set(APIS.map((a) => a.category)));
  return domains.map((d) => ({
    name: d,
    revenueAed: Math.round(APIS.filter((a) => a.category === d).reduce((sum, a) => sum + a.subscribers * 4200, 0)),
  })).sort((a, b) => b.revenueAed - a.revenueAed);
})();

const total = REVENUE_BY_MONTH.reduce((s, m) => s + m.revenueAed, 0);
export const SUBSCRIPTION_REVENUE_AED = Math.round(total * 0.42);
export const TRANSACTION_FEE_REVENUE_AED = Math.round(total * 0.58);

export const CURRENT_MONTH_REVENUE = REVENUE_BY_MONTH[REVENUE_BY_MONTH.length - 1].revenueAed;
export const PREVIOUS_MONTH_REVENUE = REVENUE_BY_MONTH[REVENUE_BY_MONTH.length - 2].revenueAed;
export const MOM_REVENUE_CHANGE = pctChange(CURRENT_MONTH_REVENUE, PREVIOUS_MONTH_REVENUE);

// "Same period last year" comparisons are illustrative: the seed dataset only
// covers a trailing 12-month window, so the earliest month in that window
// stands in for "last year" rather than a true 24-month history.
export const SAME_MONTH_LAST_YEAR_REVENUE = REVENUE_BY_MONTH[0].revenueAed;
export const YOY_MONTH_REVENUE_CHANGE = pctChange(CURRENT_MONTH_REVENUE, SAME_MONTH_LAST_YEAR_REVENUE);

const monthly = REVENUE_BY_MONTH.map((m) => m.revenueAed);
export const FORECAST_NEXT_MONTH_REVENUE = linearForecast(monthly, 1);
export const FORECAST_NEXT_QUARTER_REVENUE = linearForecast(monthly, 1) + linearForecast(monthly, 2) + linearForecast(monthly, 3);
export const FORECAST_NEXT_HALF_YEAR_REVENUE = Array.from({ length: 6 }, (_, i) => linearForecast(monthly, i + 1)).reduce((a, b) => a + b, 0);
export const FORECAST_NEXT_FULL_YEAR_REVENUE = Array.from({ length: 12 }, (_, i) => linearForecast(monthly, i + 1)).reduce((a, b) => a + b, 0);

// Trailing 4/6/12-month actuals, used as the "previous period" side of the
// quarter/half-year/full-year comparison cards on Dashboard and Revenue pages.
export const TRAILING_QUARTER_REVENUE = monthly.slice(-3).reduce((a, b) => a + b, 0);
export const TRAILING_HALF_YEAR_REVENUE = monthly.slice(-6).reduce((a, b) => a + b, 0);
export const TRAILING_FULL_YEAR_REVENUE = monthly.reduce((a, b) => a + b, 0);
