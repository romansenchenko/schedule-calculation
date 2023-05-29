// Вспомогательная функция для преобразования строки времени в минуты
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Вспомогательная функция для преобразования минут в строку времени
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString()}:${mins.toString().padStart(2, "0")}`;
}

//Вспомагательная функция для подсчета всех перерывов для конкретного времени
export function existingCountBreaks(minutes, schedule) {
  let count = 0;
  const time = minutesToTime(minutes);
  for (const empID in schedule) {
    if (
      (schedule[empID].firstBreak &&
        schedule[empID].firstBreak.start === time) ||
      (schedule[empID].secondBreak &&
        schedule[empID].secondBreak.start === time) ||
      (schedule[empID].thirdBreak &&
        schedule[empID].thirdBreak.start === time) ||
      (schedule[empID].lunch && schedule[empID].lunch.start === time) ||
      (schedule[empID].lunch &&
        minutesToTime(timeToMinutes(schedule[empID].lunch.start) + 15) ===
          time) ||
      (schedule[empID].lunch &&
        minutesToTime(timeToMinutes(schedule[empID].lunch.start) + 30) === time)
    ) {
      count++;
    }
  }
  return count;
}
export function scheduleBreaksStrictScript(
  employees,
  objOfMaxBreaks,
  isDirect
) {
  const schedule = {};

  function generateFirstBreak() {
    let empID = 0;
    for (let minutes = 6 * 60; minutes < 24 * 60; minutes += 15) {
      let breaksCount = Number(objOfMaxBreaks[minutesToTime(minutes)]);
      while (breaksCount > 0 && empID < employees.length) {
        if (!schedule[empID + 1]) {
          schedule[empID + 1] = {};
        }
        if (
          timeToMinutes(employees[empID].shift.split("-")[0]) + 60 <=
          minutes
        ) {
          schedule[empID + 1].firstBreak = {
            start: minutesToTime(minutes),
            end: minutesToTime(minutes + 15),
          };
          empID++;
          breaksCount--;
        } else break;
      }
    }
    return schedule;
  }

  function generateSecondBreak() {
    let empID = 0;
    for (let minutes = 6 * 60; minutes < 24 * 60; minutes += 15) {
      let breaksCount = Number(objOfMaxBreaks[minutesToTime(minutes)]);
      let existingBreaks = existingCountBreaks(minutes, schedule);
      let remainingFreeBreaks = breaksCount - existingBreaks;
      //console.log(`${existingBreaks} для времени ${minutesToTime(minutes)}`);
      while (remainingFreeBreaks > 0 && empID < employees.length) {
        if (!schedule[empID + 1]) {
          schedule[empID + 1] = {};
        }
        if (timeToMinutes(schedule[empID + 1].firstBreak.end) + 45 <= minutes) {
          schedule[empID + 1].secondBreak = {
            start: minutesToTime(minutes),
            end: minutesToTime(minutes + 15),
          };
          empID++;
          remainingFreeBreaks--;
        } else break;
      }
    }
  }

  function generateThirdBreak() {
    let empID = employees.length - 1;
    for (let minutes = 1440 - 15; minutes >= 6 * 60; minutes -= 15) {
      let breaksCount = Number(objOfMaxBreaks[minutesToTime(minutes)]);
      let existingBreaks = existingCountBreaks(minutes, schedule);
      let remainingFreeBreaks = breaksCount - existingBreaks;
      while (remainingFreeBreaks > 0 && empID >= 0) {
        if (!schedule[empID + 1]) {
          schedule[empID + 1] = {};
        }
        if (
          timeToMinutes(employees[empID].shift.split("-")[1]) - 60 >=
          minutes
        ) {
          schedule[empID + 1].thirdBreak = {
            start: minutesToTime(minutes),
            end: minutesToTime(minutes + 15),
          };
          empID--;
          remainingFreeBreaks--;
        } else break;
      }
    }
  }

  function generateLunchReverse() {
    let empID = employees.length - 1;
    for (let minutes = 1440 - 15; minutes >= 6 * 60; minutes -= 15) {
      let breaksCount = Number(objOfMaxBreaks[minutesToTime(minutes)]);
      let existingBreaks = existingCountBreaks(minutes, schedule);
      let remainingFreeBreaks = breaksCount - existingBreaks;
      // console.log(
      //   `Время- ${minutesToTime(minutes)}. breaksCount= ${breaksCount}`
      // );
      // console.log(
      //   `existingBreaks= ${existingBreaks}. remainingFreeBreaks= ${remainingFreeBreaks}`
      // );
      while (remainingFreeBreaks > 0 && empID >= 0) {
        if (!schedule[empID + 1]) {
          schedule[empID + 1] = {};
        }

        if (
          timeToMinutes(schedule[empID + 1].secondBreak.end) + 90 <= minutes &&
          timeToMinutes(schedule[empID + 1].thirdBreak.start) - 60 >= minutes &&
          timeToMinutes("11:30") <= minutes &&
          timeToMinutes("15:00") >= minutes
        ) {
          //проверка для времени -15 и -30 минут
          const breaksCountMinus15min = Number(
            objOfMaxBreaks[minutesToTime(minutes - 15)]
          );
          const existingBreaksMinus15min = existingCountBreaks(
            minutes - 15,
            schedule
          );
          const remainingFreeBreaksMinus15min =
            breaksCountMinus15min - existingBreaksMinus15min;

          const breaksCountMinus30min = Number(
            objOfMaxBreaks[minutesToTime(minutes - 30)]
          );
          const existingBreaksMinus30min = existingCountBreaks(
            minutes - 30,
            schedule
          );
          const remainingFreeBreaksMinus30min =
            breaksCountMinus30min - existingBreaksMinus30min;

          if (
            remainingFreeBreaksMinus15min <= 0 ||
            remainingFreeBreaksMinus30min <= 0
          ) {
            break;
          }
          schedule[empID + 1].lunch = {
            start: minutesToTime(minutes - 30),
            end: minutesToTime(minutes + 15),
          };
          empID--;
          remainingFreeBreaks--;
        } else break;
      }
    }
  }

  function generateLunch() {
    let empID = 0;
    for (let minutes = 6 * 60; minutes < 24 * 60; minutes += 15) {
      let breaksCount = Number(objOfMaxBreaks[minutesToTime(minutes)]);
      let existingBreaks = existingCountBreaks(minutes, schedule);
      let remainingFreeBreaks = breaksCount - existingBreaks;
      // console.log(
      //   `Время- ${minutesToTime(minutes)}. breaksCount= ${breaksCount}`
      // );
      // console.log(
      //   `existingBreaks= ${existingBreaks}. remainingFreeBreaks= ${remainingFreeBreaks}`
      // );
      while (remainingFreeBreaks > 0 && empID < employees.length) {
        if (!schedule[empID + 1]) {
          schedule[empID + 1] = {};
        }

        if (
          timeToMinutes(schedule[empID + 1].secondBreak.end) + 45 <= minutes &&
          timeToMinutes(schedule[empID + 1].thirdBreak.start) - 90 >= minutes &&
          timeToMinutes("11:30") <= minutes &&
          timeToMinutes("14:45") >= minutes
        ) {
          //проверка для времени -15 и -30 минут
          const breaksCountPlus15min = Number(
            objOfMaxBreaks[minutesToTime(minutes + 15)]
          );
          const existingBreaksPlus15min = existingCountBreaks(
            minutes + 15,
            schedule
          );
          const remainingFreeBreaksPlus15min =
            breaksCountPlus15min - existingBreaksPlus15min;

          const breaksCountPlus30min = Number(
            objOfMaxBreaks[minutesToTime(minutes + 30)]
          );
          const existingBreaksPlus30min = existingCountBreaks(
            minutes + 30,
            schedule
          );
          const remainingFreeBreaksPlus30min =
            breaksCountPlus30min - existingBreaksPlus30min;

          if (
            remainingFreeBreaksPlus15min <= 0 ||
            remainingFreeBreaksPlus30min <= 0
          ) {
            break;
          }
          schedule[empID + 1].lunch = {
            start: minutesToTime(minutes),
            end: minutesToTime(minutes + 45),
          };
          empID++;
          remainingFreeBreaks--;
        } else break;
      }
    }
  }

  generateFirstBreak();
  generateSecondBreak();
  generateThirdBreak();

  if (isDirect) {
    generateLunch();
  } else generateLunchReverse();

  //если обеды не найдены
  for (const employee in schedule) {
    if (!schedule[employee].hasOwnProperty("lunch")) {
      schedule[employee].lunch = {
        start: minutesToTime(1425),
        end: minutesToTime(1440),
      };
    }
  }

  return schedule;
}
