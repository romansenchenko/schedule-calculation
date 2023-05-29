import React, { useMemo, useState } from "react";
import { useTable } from "react-table";
import MOCK_DATA from "./MOCK_DATA.json";
import { GROUPED_COLUMNS } from "./columns";
import "./schedule.css";
import * as XLSX from "xlsx";
import { calculateBreaksModeling } from "./algoModel";
import { simulatedAnnealing } from "./algoSimulated Annealing";
import { scheduleBreaksGenetic } from "./algoGenetic";
import { scheduleBreaksLinear } from "./algoLinearProgrammingMethod";
import { scheduleBreaksGeneticTest } from "./algoGeneticCopy";
import {
  existingCountBreaks,
  scheduleBreaksStrictScript,
  timeToMinutes,
} from "./algoStrictScript";

export const StaffSchedule = () => {
  const columns = useMemo(() => GROUPED_COLUMNS, []);
  const [fileName, setFileName] = useState(null);
  const mockData = useMemo(() => MOCK_DATA, []);
  const [data, setData] = useState(() => mockData);
  const [breaksSchedule, setBreaksSchedule] = useState(null);
  const [maximumIntersection, setMaximumIntersection] = useState(null);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  const handleOnExport = () => {
    var wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "MySheet1");

    XLSX.writeFile(wb, "MyExcel.xlsx");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.readFile(data);

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(jsonData);
    setData(jsonData);
  };

  const handleOnCalculateBreaksModeling = (e) => {
    setBreaksSchedule(calculateBreaksModeling(data));
    console.log(calculateBreaksModeling(data));
  };

  const handleSimulatedAnnealing = (e) => {
    setBreaksSchedule(simulatedAnnealing(data));
    console.log(simulatedAnnealing(data));
  };

  const handleOnLinearProgrammingMethod = (e) => {
    setBreaksSchedule(scheduleBreaksLinear(data));
    console.log(scheduleBreaksLinear(data));
  };

  const handleOnCalculateGenetic = (e) => {
    setBreaksSchedule(scheduleBreaksGenetic(data, setMaximumIntersection));
    console.log(scheduleBreaksGenetic(data, setMaximumIntersection));
  };

  // const handleOnCalculateTemp = (e) => {
  //   setBreaksSchedule(scheduleBreaksGeneticTest(data, setMaximumIntersection));
  // };

  const handleOnScriptDirect = () => {
    let employees = data.slice(0, data.length - 1);
    let arrayOfMaxBreaks = data[data.length - 1];

    scheduleBreaksStrictScript(employees, arrayOfMaxBreaks, true);
    setBreaksSchedule(
      scheduleBreaksStrictScript(employees, arrayOfMaxBreaks, true)
    );
  };

  const handleOnScriptReverse = () => {
    let employees = data.slice(0, data.length - 1);
    let arrayOfMaxBreaks = data[data.length - 1];

    scheduleBreaksStrictScript(employees, arrayOfMaxBreaks, false);
    setBreaksSchedule(
      scheduleBreaksStrictScript(employees, arrayOfMaxBreaks, false)
    );
  };

  const getTimeCellColor = (cellValue, shift, idEmp) => {
    if (idEmp === data.length) {
      if (breaksSchedule === null) {
        return "#dff0e1";
      } else {
        console.log(
          `Для времени ${cellValue} всего перерывов - ` +
            data[data.length - 1][cellValue]
        );
        console.log(
          `А по факту - ` +
            existingCountBreaks(timeToMinutes(cellValue), breaksSchedule)
        );

        if (Number(data[data.length - 1][cellValue]) === 0) {
          return "#ddd";
        } else if (
          existingCountBreaks(timeToMinutes(cellValue), breaksSchedule) ===
          Number(data[data.length - 1][cellValue])
        ) {
          return "#4eff26";
        } else if (
          existingCountBreaks(timeToMinutes(cellValue), breaksSchedule) <
          Number(data[data.length - 1][cellValue])
        ) {
          return "yellow";
        } else return "red";
      }
    }
    const lunchRangeColor = "#fcf8e3";
    const breakColor = "yellow";
    const lunchColor = "orange";
    const offShiftColor = "#fae3e6"; //"#fcdee1";
    const firstAndLastHourOfShiftColor = "#fab6bd";

    const [shiftStart, shiftEnd] = shift.split("-");
    const [hShiftStart, mShiftStart] = shiftStart.split(":");
    const [hShiftEnd, mShiftEnd] = shiftEnd.split(":");
    const [h1Cell, m1Cell] = cellValue.split(":");

    const dateCell = new Date(`01/01/2000 ${h1Cell}:${m1Cell}`);
    const dateShiftStart = new Date(`01/01/2000 ${hShiftStart}:${mShiftStart}`);
    const dateShiftEnd = new Date(2000, 0, 1, hShiftEnd, mShiftEnd);
    const dateLunchRangeStart = new Date(2000, 0, 1, 11, 30);
    const dateLunchRangeEnd = new Date(2000, 0, 1, 15, 0);

    if (breaksSchedule === null) {
      if (
        dateCell >= dateShiftStart &&
        dateCell <
          new Date(dateShiftStart.setHours(dateShiftStart.getHours() + 1))
      ) {
        return firstAndLastHourOfShiftColor;
      } else if (
        dateCell >= new Date(dateShiftEnd.getTime() - 45 * 60 * 1000) &&
        dateCell < dateShiftEnd
      ) {
        return firstAndLastHourOfShiftColor;
      } else if (
        dateCell >= dateLunchRangeStart &&
        dateCell <= dateLunchRangeEnd
      ) {
        if (dateCell < dateShiftStart || dateCell >= dateShiftEnd) {
          return offShiftColor;
        }
        return lunchRangeColor;
      } else if (dateCell >= dateShiftStart && dateCell < dateShiftEnd) {
        return "white";
      }
      return offShiftColor;
    } else {
      const [hFirstBreakStart, mFirstBreakStart] =
        breaksSchedule[idEmp].firstBreak.start.split(":");
      const [hFirstBreakEnd, mFirstBreakEnd] =
        breaksSchedule[idEmp].firstBreak.end.split(":");

      const [hSecondBreakStart, mSecondBreakStart] =
        breaksSchedule[idEmp].secondBreak.start.split(":");
      const [hSecondBreakEnd, mSecondBreakEnd] =
        breaksSchedule[idEmp].secondBreak.end.split(":");

      const [hThirdBreakStart, mThirdBreakStart] =
        breaksSchedule[idEmp].thirdBreak.start.split(":");
      const [hThirdBreakEnd, mThirdBreakEnd] =
        breaksSchedule[idEmp].thirdBreak.end.split(":");

      const dateFirstBreakStart = new Date(
        2000,
        0,
        1,
        hFirstBreakStart,
        mFirstBreakStart
      );
      const dateFirstBreakEnd = new Date(
        2000,
        0,
        1,
        hFirstBreakEnd,
        mFirstBreakEnd
      );

      const dateSecondBreakStart = new Date(
        2000,
        0,
        1,
        hSecondBreakStart,
        mSecondBreakStart
      );
      const dateSecondBreakEnd = new Date(
        2000,
        0,
        1,
        hSecondBreakEnd,
        mSecondBreakEnd
      );

      const dateThirdBreakStart = new Date(
        2000,
        0,
        1,
        hThirdBreakStart,
        mThirdBreakStart
      );
      const dateThirdBreakEnd = new Date(
        2000,
        0,
        1,
        hThirdBreakEnd,
        mThirdBreakEnd
      );

      //проверка на наличие обеда
      if (!breaksSchedule[idEmp].hasOwnProperty("lunch")) return "white";

      const [hLunchStart, mLunchStart] =
        breaksSchedule[idEmp].lunch.start.split(":");
      const [hLunchEnd, mLunchEnd] = breaksSchedule[idEmp].lunch.end.split(":");

      const dateLunchStart = new Date(2000, 0, 1, hLunchStart, mLunchStart);
      const dateLunchEnd = new Date(2000, 0, 1, hLunchEnd, mLunchEnd);

      if (
        (dateCell >= dateFirstBreakStart && dateCell < dateFirstBreakEnd) ||
        (dateCell >= dateSecondBreakStart && dateCell < dateSecondBreakEnd) ||
        (dateCell >= dateThirdBreakStart && dateCell < dateThirdBreakEnd)
      ) {
        return breakColor;
      } else if (dateCell >= dateLunchStart && dateCell < dateLunchEnd) {
        return lunchColor;
      }

      if (
        dateCell >= dateShiftStart &&
        dateCell <
          new Date(dateShiftStart.setHours(dateShiftStart.getHours() + 1))
      ) {
        return firstAndLastHourOfShiftColor;
      } else if (
        dateCell >= new Date(dateShiftEnd.getTime() - 45 * 60 * 1000) &&
        dateCell < dateShiftEnd
      ) {
        return firstAndLastHourOfShiftColor;
      } else if (
        dateCell >= dateLunchRangeStart &&
        dateCell <= dateLunchRangeEnd
      ) {
        if (dateCell < dateShiftStart || dateCell >= dateShiftEnd) {
          return offShiftColor;
        }
        return lunchRangeColor;
      } else if (dateCell >= dateShiftStart && dateCell < dateShiftEnd) {
        return "white";
      }

      return offShiftColor;
    }
  };

  const handleLeftClick = (cell) => {
    if (
      cell.column.parent.Header === "График" &&
      cell.row.original.full_name_of_the_employee === "Сумма"
    ) {
      setData((prevState) =>
        prevState.map((obj, index) => {
          //console.log(obj[cell.column.id]);
          return index === Number(cell.row.id)
            ? {
                ...obj,
                [cell.column.id]: String(Number(obj[cell.column.id]) + 1),
              }
            : obj;
        })
      );
    }
  };

  const handleRightClick = (event, cell) => {
    event.preventDefault();
    if (
      cell.column.parent.Header === "График" &&
      cell.row.original.full_name_of_the_employee === "Сумма"
    ) {
      setData((prevState) =>
        prevState.map((obj, index) => {
          //console.log(obj[cell.column.id]);
          return index === Number(cell.row.id)
            ? {
                ...obj,
                [cell.column.id]: String(Number(obj[cell.column.id]) - 1),
              }
            : obj;
        })
      );
    }
  };

  const getWidth = (cell) => {
    return cell.column?.id === "full_name_of_the_employee" ? "100px" : "";
  };

  return (
    <>
      <br></br>

      <div>
        <input
          className="input-file"
          type="file"
          onChange={(e) => handleImport(e)}
        ></input>
        <button className="exportImportBtn" onClick={handleOnExport}>
          Export
        </button>
      </div>

      {/* {fileName && (
        <p>
          FileName: <span>{fileName}</span>
        </p>
      )} */}

      <div></div>
      <br></br>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  style={{
                    width: getWidth(column),
                  }}
                  key={column.id}
                  {...column.getHeaderProps()}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      style={{
                        backgroundColor: getTimeCellColor(
                          cell.column.id,
                          cell.row.values.shift,
                          cell.row.values.id
                        ),
                        padding: "2px",
                        width: getWidth(cell),
                      }}
                      key={cell.id}
                      onClick={() => handleLeftClick(cell)}
                      onContextMenu={(event) => handleRightClick(event, cell)}
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <br></br>

      <div>
        <button
          className="generateBtn"
          style={{ fontSize: "16px", margin: "10px" }}
          onClick={handleOnScriptDirect}
        >
          Рассчет - обеды с начала
        </button>
      </div>

      <div>
        <button
          className="generateBtn"
          style={{ fontSize: "16px", margin: "10px" }}
          onClick={handleOnScriptReverse}
        >
          Рассчет - обеды с конца
        </button>
      </div>
      <br></br>
    </>
  );
};
