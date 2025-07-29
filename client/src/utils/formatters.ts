/**
 * 価格とサイズの表示フォーマット用ユーティリティ関数
 */

/**
 * 価格を適切な小数点桁数でフォーマット
 * 1以上: 小数点下2桁
 * 1未満: 小数点下4桁
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  const numPrice = Number(price);
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  if (numPrice >= 1) {
    return numPrice.toFixed(2);
  } else {
    return numPrice.toFixed(4);
  }
};

/**
 * ポジションサイズを適切な小数点桁数でフォーマット
 * 1以上: 小数点下2桁
 * 1未満: 小数点下4桁
 */
export const formatSize = (size: number | string | null | undefined): string => {
  const numSize = Number(size);
  if (isNaN(numSize)) {
    return '0.00';
  }
  
  if (numSize >= 1) {
    return numSize.toFixed(2);
  } else {
    return numSize.toFixed(4);
  }
};

/**
 * 通貨フォーマット（P&L用）
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

/**
 * パーセンテージフォーマット
 */
export const formatPercentage = (value: number | string | null | undefined): string => {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return '0.0%';
  }
  return `${numValue.toFixed(1)}%`;
};