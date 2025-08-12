export const fetchEmployeeData = async () => {
  const sheetId = process.env.REACT_APP_SHEET_ID;
  const apiKey = process.env.REACT_APP_SHEETS_API_KEY;
  const range = "Sheet1!A1:Z1000";

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length < 2) {
      throw new Error("No employee data found in sheet");
    }

    const [headers, ...rows] = data.values;

    const normalizedHeaders = headers.map((header) =>
      header.toLowerCase().trim()
    );

    return rows.map((row) => {
      const employee = {};
      normalizedHeaders.forEach((header, index) => {
        // Only change: map "bio" column to "address"
        const key = header === "bio" ? "address" : header;
        employee[key] = row[index] ? row[index].trim() : "";
      });

      if (employee.name) {
        employee.slug = employee.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }

      return employee;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};
