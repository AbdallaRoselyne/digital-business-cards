export const fetchEmployeeData = async () => {
  const sheetId = process.env.REACT_APP_SHEET_ID;
  const apiKey = process.env.REACT_APP_SHEETS_API_KEY;
  const range = 'Sheet1!A1:Z100';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    );
    const data = await response.json();
    const [headers, ...rows] = data.values;
    
    return rows.map(row => {
      return headers.reduce((obj, header, index) => {
        obj[header.toLowerCase()] = row[index];
        return obj;
      }, {});
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
};