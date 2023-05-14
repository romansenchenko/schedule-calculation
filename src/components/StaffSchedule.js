import React, { useMemo, useState } from "react";
import { useTable } from "react-table";
import MOCK_DATA from "./MOCK_DATA.json";
import { GROUPED_COLUMNS } from "./columns";
import "./table.css";
import * as XLSX from "xlsx";
import { calculateBreaksModeling } from "./algoModel";
import { simulatedAnnealing } from './algoSimulated Annealing'
import { scheduleBreaksGenetic } from './algoGenetic'
import { scheduleBreaksLinear } from './algoLinearProgrammingMethod'

export const StaffSchedule = () => {
  const columns = useMemo(() => GROUPED_COLUMNS, []);
  const [fileName, setFileName] = useState(null);
  const mockData = useMemo(() => MOCK_DATA, []);
  const [data, setData] = useState(() => mockData);
  const [breaks, setBreaks] = useState(null);
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
    setBreaks(calculateBreaksModeling(data));
    console.log(calculateBreaksModeling(data));
  };

  const handleSimulatedAnnealing = (e) => {
    setBreaks(simulatedAnnealing(data));
    console.log(simulatedAnnealing(data));
  };

  const handleOnLinearProgrammingMethod = (e) => {
    setBreaks(scheduleBreaksLinear(data));
    console.log(scheduleBreaksLinear(data));
  };

  const handleOnCalculateGenetic = (e) => {
    setBreaks(scheduleBreaksGenetic(data, setMaximumIntersection));
  };

  const handleOnCalculateTemp = (e) => {
    setBreaks(scheduleBreaksGenetic(data, setMaximumIntersection));
  };

  const getTimeCellColor = (cellValue, shift, idEmp) => {

    const lunchRangeColor = "#fcf8e3";
    const breakColor = "yellow";
    const lunchColor = "orange";
    const offShiftColor = "#fae3e6";//"#fcdee1";
    const firstAndLastHourOfShiftColor = "#fab6bd";

    const [shiftStart, shiftEnd] = shift.split("-");
    const [hShiftStart, mShiftStart] = shiftStart.split(":");
    const [hShiftEnd, mShiftEnd] = shiftEnd.split(":");
    const [h1Cell, m1Cell] = cellValue.split(":");

    const dateCell = new Date(`01/01/2000 ${h1Cell}:${m1Cell}`);
    const dateShiftStart = new Date(`01/01/2000 ${hShiftStart}:${mShiftStart}`);
    const dateShiftEnd = new Date(2000, 0, 1, hShiftEnd, mShiftEnd );
    const dateLunchRangeStart = new Date(2000, 0, 1, 11, 30 );
    const dateLunchRangeEnd   = new Date(2000, 0, 1, 15, 0 );

    if (breaks === null) {
      if (dateCell >= dateShiftStart && dateCell < new Date(dateShiftStart.setHours(dateShiftStart.getHours() + 1))) { return firstAndLastHourOfShiftColor; }
      else if (dateCell >= new Date( dateShiftEnd.getTime()-(60*60*1000) ) && dateCell < dateShiftEnd) {  return firstAndLastHourOfShiftColor;  }
      else if ( dateCell >= dateLunchRangeStart && dateCell <= dateLunchRangeEnd ) {  
        if (dateCell < dateShiftStart || dateCell >= dateShiftEnd) {  return offShiftColor;  } 
        return lunchRangeColor;  }
      else if (dateCell >= dateShiftStart && dateCell < dateShiftEnd) {  return "white";  }
      return offShiftColor;
    } else {

      const [hFirstBreakStart, mFirstBreakStart] = breaks[idEmp].firstBreak.start.split(":");
      const [hFirstBreakEnd, mFirstBreakEnd] = breaks[idEmp].firstBreak.end.split(":");

      const [hSecondBreakStart, mSecondBreakStart] = breaks[idEmp].secondBreak.start.split(":");
      const [hSecondBreakEnd, mSecondBreakEnd] = breaks[idEmp].secondBreak.end.split(":");

      const [hThirdBreakStart, mThirdBreakStart] = breaks[idEmp].thirdBreak.start.split(":");
      const [hThirdBreakEnd, mThirdBreakEnd] = breaks[idEmp].thirdBreak.end.split(":");

      const [hLunchStart, mLunchStart] = breaks[idEmp].lunch.start.split(":");
      const [hLunchEnd, mLunchEnd] = breaks[idEmp].lunch.end.split(":");

      
      const dateFirstBreakStart = new Date( 2000, 0, 1, hFirstBreakStart, mFirstBreakStart );
      const dateFirstBreakEnd = new Date( 2000, 0, 1, hFirstBreakEnd, mFirstBreakEnd );

      const dateSecondBreakStart = new Date( 2000, 0, 1, hSecondBreakStart, mSecondBreakStart );
      const dateSecondBreakEnd = new Date( 2000, 0, 1, hSecondBreakEnd, mSecondBreakEnd );

      const dateThirdBreakStart = new Date( 2000, 0, 1, hThirdBreakStart, mThirdBreakStart );
      const dateThirdBreakEnd = new Date( 2000, 0, 1, hThirdBreakEnd, mThirdBreakEnd );

      const dateLunchStart = new Date( 2000, 0, 1, hLunchStart, mLunchStart );
      const dateLunchEnd = new Date( 2000, 0, 1, hLunchEnd, mLunchEnd );

      if (
        (dateCell >= dateFirstBreakStart && dateCell < dateFirstBreakEnd) ||
        (dateCell >= dateSecondBreakStart && dateCell < dateSecondBreakEnd) ||
        (dateCell >= dateThirdBreakStart && dateCell < dateThirdBreakEnd)
      ) {
        return breakColor
      }
      else if (dateCell >= dateLunchStart && dateCell < dateLunchEnd) {
        return lunchColor
      }

      if (dateCell >= dateShiftStart && dateCell < new Date(dateShiftStart.setHours(dateShiftStart.getHours() + 1))) { return firstAndLastHourOfShiftColor; }
      else if (dateCell >= new Date( dateShiftEnd.getTime()-(60*60*1000) ) && dateCell < dateShiftEnd) {  return firstAndLastHourOfShiftColor;  }
      else if ( dateCell >= dateLunchRangeStart && dateCell <= dateLunchRangeEnd ) {  
        if (dateCell < dateShiftStart || dateCell >= dateShiftEnd) {  return offShiftColor;  } 
        return lunchRangeColor;  }
      else if (dateCell >= dateShiftStart && dateCell < dateShiftEnd) {  return "white";  }
      
      return offShiftColor;
    }
  };

  const handleCellClick = (e) => {
    e.target.style.backgroundColor = "yellow";
  };

  const getWidth = (cell) => {
    return cell.column?.id === "full_name_of_the_employee" ? ("100px") : "";
  }

  return (
    <>
      {/* <div>
        <button onClick={handleOnCalculateBreaksModeling}>Рассчет по методу моделирования (некорректный)</button>
      </div>

      <div>
        <button onClick={handleSimulatedAnnealing}>Рассчет по методу имитации отжига (уточнить условия)</button>
      </div>

      <div>
        <button onClick={handleOnLinearProgrammingMethod}>Рассчет по методу линейного программирования</button>
      </div> */}

      <div>
        <button style={{ fontSize:"20px", margin: "20px" }} onClick={handleOnCalculateGenetic}>Рассчет с использованием генетического алгоритма</button>
      </div>

      { maximumIntersection !== null 
        ? <p> Максимальное пересечение = {maximumIntersection} </p> 
        : <p> Максимальное пересечение = </p>
      }

      {/* <div>
        <button onClick={handleOnCalculateTemp}>Рассчет TEMP</button>
      </div> */}

      <div>
        <button onClick={handleOnExport}>Export</button>
      </div>

      {/* {fileName && (
        <p>
          FileName: <span>{fileName}</span>
        </p>
      )} */}

      <div>
        <input type="file" onChange={(e) => handleImport(e)}></input>
      </div>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th 
                 style={{
                  width: getWidth(column),
                }} 
                key={column.id} {...column.getHeaderProps()}>
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
                        padding: "0px",
                        width: getWidth(cell),
                      }}
                      key={cell.id}
                      onClick={handleCellClick}
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
      <br></br>
    </>
  );
};
