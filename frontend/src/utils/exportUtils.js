import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data, fileName) => {
  // Create a new worksheet from the JSON data
  const ws = XLSX.utils.json_to_sheet(data);

  // Create a new workbook and append the worksheet
  const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };

  // Write the workbook to an array buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // Create a Blob from the array buffer
  const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});

  // Use file-saver to trigger a download
  saveAs(blob, `${fileName}.xlsx`);
};
