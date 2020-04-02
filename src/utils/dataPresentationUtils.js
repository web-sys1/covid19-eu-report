import 'fix-date';
import { MONTHS } from '../definitions/constants';

export const getHumanFormattedDate = date => {
  const humanDate = new Date(date);
  return `${humanDate.getDate()} ${
    MONTHS[humanDate.getMonth()][1]
  } ${humanDate.getFullYear()}`;
};

export const getStatLineWidth = (entry, total) =>
  entry ? `${(entry / total) * 100}%` : 0;

export const getEUtotals = euTotalsByDate =>
  euTotalsByDate[Object.keys(euTotalsByDate)[0]];

export const formatThousands = num =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const getChartData = (
  piechartBg,
  trackingColour,
  trackingTitle,
  trackingValue
) => [
  {
    title: trackingTitle,
    value: trackingValue,
    color: trackingColour,
  },
  {
    title: 'World',
    value: 100 - trackingValue,
    color: piechartBg,
  },
];
