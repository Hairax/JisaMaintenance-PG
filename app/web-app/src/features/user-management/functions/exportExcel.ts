import { User } from '../types/user.types';
import * as XLSX from 'xlsx';

export function exportUsersToExcel(users: User[], fileName = 'users.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(users);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  XLSX.writeFile(workbook, fileName);
}
