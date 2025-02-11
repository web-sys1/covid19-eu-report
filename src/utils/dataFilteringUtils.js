import { chain, mapValues } from 'lodash';
import 'fix-date';
import {
  EU_COUNTRIES,
  EU_FLAGS,
  FORMER_EU_COUNTRIES,
  MONTHS,
} from '../definitions/constants';

export const getWorldTotals = (apiData) =>
  Object.values(apiData).reduce(
    (euDayTotals, countryValues) => {
      const currentCountryTotals = countryValues[countryValues.length - 1];

      return {
        ...euDayTotals,
        confirmed: euDayTotals.confirmed + currentCountryTotals.confirmed,
        deaths: euDayTotals.deaths + currentCountryTotals.deaths,
        recovered: euDayTotals.recovered + currentCountryTotals.recovered,
      };
    },
    { confirmed: 0, deaths: 0, recovered: 0 }
  );

export const getFormattedPercentage = (part, total) =>
  parseFloat(((part / total) * 100).toFixed(2), 10);

export const getEuPercentVsRoW = (rowTotals, euTotals) => ({
  confirmed: getFormattedPercentage(euTotals.confirmed, rowTotals.confirmed),
  deaths: getFormattedPercentage(euTotals.deaths, rowTotals.deaths),
  recovered: getFormattedPercentage(euTotals.recovered, rowTotals.recovered),
});

export const getEUCovidData = (apiData) =>
  Object.keys(apiData).reduce((euCountries, country) => {
    if (EU_COUNTRIES.includes(country)) {
      return {
        ...euCountries,
        [country]: apiData[country],
      };
    }
    return euCountries;
  }, {});

export const getCountryFlagURL = (countryName) =>
  EU_FLAGS?.[countryName]?.country_code
    ? `https://www.countryflags.io/${EU_FLAGS[countryName].country_code}/flat/32.png`
    : '';

export const getTotalPropOfCountry = (countryData, prop) =>
  countryData[countryData.length - 1]?.[prop] || 0;

export const getTotalPropOfCountryYesterday = (countryData, prop) =>
  countryData[countryData.length - 2]?.[prop] || 0;

export const getCountiesTotalsDate = (countriesStats) => {
  const filteredStats = Object.keys(countriesStats).map((country) => {
    const totalDeaths = getTotalPropOfCountry(
      countriesStats[country],
      'deaths'
    );
    const deathsLast24h =
      totalDeaths -
      getTotalPropOfCountryYesterday(countriesStats[country], 'deaths');
    const totalCases = getTotalPropOfCountry(
      countriesStats[country],
      'confirmed'
    );
    const casesLast24h =
      totalCases -
      getTotalPropOfCountryYesterday(countriesStats[country], 'confirmed');
    const totalRecovered = getTotalPropOfCountry(
      countriesStats[country],
      'recovered'
    );
    const recoveredLast24h =
      totalRecovered -
      getTotalPropOfCountryYesterday(countriesStats[country], 'recovered');

    const countryNameLabel = `${
      FORMER_EU_COUNTRIES.includes(country) ? `${country}*` : country
    }`;

    return {
      countryName: countryNameLabel,
      flagSrc: getCountryFlagURL(country),
      totalDeaths,
      deathsLast24h,
      totalCases,
      casesLast24h,
      totalRecovered,
      recoveredLast24h,
    };
  });

  return chain(filteredStats).sortBy('totalDeaths').reverse().value();
};

export const getSortedColumns = (countriesData, column, columnStatus) =>
  columnStatus
    ? chain(countriesData).sortBy(column).reverse().value()
    : chain(countriesData).sortBy(column).value();

export const getSortedColumnsStatii = (
  column,
  columnStatus,
  sortedColumns
) => ({
  ...mapValues(sortedColumns, () => false),
  [column]: !columnStatus,
});

export const sortCountriesDataByColumn = (
  column,
  countriesData,
  sortedColumns,
  setSortedColumns,
  setCountriesData
) => {
  const columnStatus = sortedColumns[column];
  const sortedColumnsResult = getSortedColumns(
    countriesData,
    column,
    columnStatus
  );
  const sortedColumnsStatii = getSortedColumnsStatii(
    column,
    columnStatus,
    sortedColumns
  );

  setSortedColumns(sortedColumnsStatii);
  setCountriesData(sortedColumnsResult);
};

export const getLastUpdateFromData = (data = {}) => {
  const firstCountryEntry = Object.values(data)[0];
  const dateFromData =
    firstCountryEntry?.[firstCountryEntry.length - 1]?.date || '';

  if (dateFromData) {
    const date = new Date(dateFromData);
    return `${date.getDate()} ${
      MONTHS[date.getMonth()][1]
    } ${date.getFullYear().toString().substr(-2)}`;
  }

  return '';
};

export const getAllRecordsDates = (euCovidData, country = EU_COUNTRIES[0]) =>
  euCovidData[country]?.map((entry) => entry.date) ?? [];

export const getEUTotalsByDate = (euCovidData, country) =>
  getAllRecordsDates(euCovidData, country).reduce(
    (euDatesTotals, date, index) => ({
      ...euDatesTotals,
      [date]: Object.values(euCovidData).reduce(
        (euDayTotals, countryValues) => ({
          ...euDayTotals,
          confirmed: euDayTotals.confirmed + countryValues[index].confirmed,
          deaths: euDayTotals.deaths + countryValues[index].deaths,
          recovered: euDayTotals.recovered + countryValues[index].recovered,
        }),
        { confirmed: 0, deaths: 0, recovered: 0 }
      ),
    }),
    {}
  );

export const getEUTotalsByDateNewestFirst = (euCovidData, country) => {
  const dataOrigin = !country
    ? euCovidData
    : {
        [country]: euCovidData[country],
      };
  const euTotalsByDate = getEUTotalsByDate(dataOrigin, country);
  return chain(euTotalsByDate).toPairs().reverse().fromPairs().value();
};
