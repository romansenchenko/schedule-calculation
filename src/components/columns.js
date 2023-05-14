import { format } from "date-fns";
import { ColumnFilter } from "./ColumnFilter";

export const dataTable = () => {
  const headerCells = [];
  for (let h = 0; h < 24; h++) {
    for (let m of ["00", "15", "30", "45"]) {
      const date = new Date(0, 0, 0, h, m, 0, 0); // создаем объект Date для каждого 15-минутного интервала
      const dateString = format(date, "HH:mm"); // преобразуем его в строку в формате HH:MM
      // headerCells.push(<th key={dateString}>{dateString}</th>);
      const formatDateString =
        dateString[0] == 0 ? dateString.slice(1) : dateString;
      headerCells.push({
        Header: <span className="time-column">{formatDateString}</span>,
        accessor: formatDateString,
      });
    }
  }
  return headerCells;
};

export const COLUMNS = [
  {
    Header: "Id",
    Footer: "Id",
    accessor: "id",
    Filter: ColumnFilter,
  },
  {
    Header: "ФИО сотрудника",
    Footer: "Full Name",
    accessor: "full_name_of_the_employee",
    Filter: ColumnFilter,
  },
  {
    Header: "Last Name",
    Footer: "Last Name",
    accessor: "last_name",
    Filter: ColumnFilter,
  },
  {
    Header: "Date of Birth",
    Footer: "Date of Birth",
    accessor: "date_of_birth",
    Cell: ({ value }) => {
      return format(new Date(value), "dd/MM/yyyy");
    },
    Filter: ColumnFilter,
  },
  {
    Header: "Country",
    Footer: "Country",
    accessor: "country",
    Filter: ColumnFilter,
  },
  {
    Header: "Phone",
    Footer: "Phone",
    accessor: "phone",
    Filter: ColumnFilter,
  },
];

export const GROUPED_COLUMNS = [
  {
    Header: "Сотрудник",
    columns: [
      {
        Header: "Id",
        accessor: "id",
      },
      {
        Header: <span className="name-column">ФИО сотрудника</span>,
        accessor: "full_name_of_the_employee",
      },
      {
        Header: "Смена (hh:mm-hh:mm)",
        accessor: "shift",
      },
    ],
  },
  {
    Header: "График",
    columns: dataTable(),
  },
];
