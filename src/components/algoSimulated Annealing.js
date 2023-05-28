export function simulatedAnnealing(employees) {
  // Функция для расчета энергии (количество пересечений перерывов)
  function energy(state) {
    let intersections = 0;
    for (let i = 0; i < state.length; i++) {
      for (let j = i + 1; j < state.length; j++) {
        if (
          state[i].firstBreak.start <= state[j].firstBreak.end &&
          state[i].firstBreak.end >= state[j].firstBreak.start
        )
          intersections++;
        if (
          state[i].secondBreak.start <= state[j].secondBreak.end &&
          state[i].secondBreak.end >= state[j].secondBreak.start
        )
          intersections++;
        if (
          state[i].thirdBreak.start <= state[j].thirdBreak.end &&
          state[i].thirdBreak.end >= state[j].thirdBreak.start
        )
          intersections++;
        if (
          state[i].lunch.start <= state[j].lunch.end &&
          state[i].lunch.end >= state[j].lunch.start
        )
          intersections++;
      }
    }
    return intersections;
  }

  // Функция для проверки допустимости состояния
  function isValid(state) {
    const count = 1;
    const peakLoad = 9;
    // Перебираем всех сотрудников в состоянии
    for (let employee of state) {
      console.log(count);
      // Находим начало и конец рабочей смены сотрудника
      let shiftStart =
        parseInt(
          employees
            .find((e) => e.id === employee.id)
            .shift.split("-")[0]
            .split(":")[0]
        ) *
          60 +
        parseInt(
          employees
            .find((e) => e.id === employee.id)
            .shift.split("-")[0]
            .split(":")[1]
        );
      let shiftEnd =
        parseInt(
          employees
            .find((e) => e.id === employee.id)
            .shift.split("-")[1]
            .split(":")[0]
        ) *
          60 +
        parseInt(
          employees
            .find((e) => e.id === employee.id)
            .shift.split("-")[1]
            .split(":")[1]
        );
      // Проверяем, что первый перерыв не раньше чем через час с момента начала рабочей смены и не раньше 8:45
      if (employee.firstBreak.start < Math.max(shiftStart + 60, 8 * 60 + 45))
        return false;
      // Проверяем, что разрыв между первым и вторым перерывами в диапазоне от 1 часа до 2,5 часов
      if (
        employee.firstBreak.end > employee.secondBreak.start - 60 ||
        employee.firstBreak.end < employee.secondBreak.start - 150
      )
        return false;
      // Проверяем, что разрыв между вторым и третьим перерывами в диапазоне от 1 часа до 2,5 часов
      if (
        employee.secondBreak.end > employee.thirdBreak.start - 60 ||
        employee.secondBreak.end < employee.thirdBreak.start - 150
      )
        return false;
      // Проверяем, что последний перерыв не позже чем за час до конца рабочей смены
      if (employee.thirdBreak.end > shiftEnd - 60) return false;
      // Проверяем, что обед в диапазоне с 11:30 до 15:15
      if (
        employee.lunch.start < 11 * 60 + 30 ||
        employee.lunch.end > 15 * 60 + 15
      )
        return false;
      // Проверяем, что разрыв между первым перерывом и обедом в диапазоне от 1 часа до 2,5 часов
      if (
        (employee.firstBreak.end > employee.lunch.start - 60 &&
          employee.firstBreak.end < employee.lunch.start) ||
        (employee.firstBreak.end > employee.lunch.end - 150 &&
          employee.firstBreak.end < employee.lunch.end)
      )
        return false;
      // Проверяем, что разрыв между вторым перерывом и обедом в диапазоне от 1 часа до 2,5 часов
      if (
        (employee.secondBreak.end > employee.lunch.start - 60 &&
          employee.secondBreak.end < employee.lunch.start) ||
        (employee.secondBreak.end > employee.lunch.end - 150 &&
          employee.secondBreak.end < employee.lunch.end)
      )
        return false;
      // Проверяем, что разрыв между третьим перерывом и обедом в диапазоне от 1 часа до 2,5 часов
      if (
        (employee.thirdBreak.end > employee.lunch.start - 60 &&
          employee.thirdBreak.end < employee.lunch.start) ||
        (employee.thirdBreak.end > employee.lunch.end - 150 &&
          employee.thirdBreak.end < employee.lunch.end)
      )
        return false;

      // Additional conditions

      // Check that all breaks are multiples of 15 minutes (00,15,30,45)
      if (
        !(
          [0, 15, 30, 45].includes(employee.firstBreak.start % 60) &&
          [0, 15, 30, 45].includes(employee.firstBreak.end % 60) &&
          [0, 15, 30, 45].includes(employee.secondBreak.start % 60) &&
          [0, 15, 30, 45].includes(employee.secondBreak.end % 60) &&
          [0, 15, 30, 45].includes(employee.thirdBreak.start % 60) &&
          [0, 15, 30, 45].includes(employee.thirdBreak.end % 60) &&
          [0, 15, 30, 45].includes(employee.lunch.start % 60) &&
          [0, 15, 30, 45].includes(employee.lunch.end % 60)
        )
      )
        return false;

      // Check that firstBreak, secondBreak, thirdBreak are 15 minutes long and lunch is 45 minutes long
      if (
        !(
          employee.firstBreak.end - employee.firstBreak.start === 15 &&
          employee.secondBreak.end - employee.secondBreak.start === 15 &&
          employee.thirdBreak.end - employee.thirdBreak.start === 15 &&
          employee.lunch.end - employee.lunch.start === 45
        )
      )
        return false;

      // Check that from 08:45 to 09:00 there are no more than 2 breaks
      let breaksBefore9 = [
        employee.firstBreak,
        employee.secondBreak,
        employee.thirdBreak,
      ].filter((breakTime) => breakTime.start < 9 * 60);
      if (breaksBefore9.length > 2) return false;

      // Check that from 09:00 to 12:00 breaks increase
      let breaksBetween9and12 = [
        employee.firstBreak,
        employee.secondBreak,
        employee.thirdBreak,
      ].filter(
        (breakTime) => breakTime.start >= 9 * 60 && breakTime.start < 12 * 60
      );
      for (let i = 0; i < breaksBetween9and12.length - 1; i++) {
        if (breaksBetween9and12[i].start > breaksBetween9and12[i + 1].start)
          return false;
      }

      // Check that from 12:00 to 15:00 there is a peak load
      let breaksBetween12and15 = [
        employee.firstBreak,
        employee.secondBreak,
        employee.thirdBreak,
      ].filter(
        (breakTime) => breakTime.start >= 12 * 60 && breakTime.start < 15 * 60
      );
      if (breaksBetween12and15.length !== peakLoad) return false;

      // Check that immediately after the peak load the number of breaks decreases
      let breaksAfter15 = [
        employee.firstBreak,
        employee.secondBreak,
        employee.thirdBreak,
      ].filter((breakTime) => breakTime.start >= 15 * 60);
      for (let i = 0; i < breaksAfter15.length - 1; i++) {
        if (breaksAfter15[i].start < breaksAfter15[i + 1].start) return false;
      }

      // Check that from 16:00 there are no more than 3 breaks
      let breaksAfter16 = [
        employee.firstBreak,
        employee.secondBreak,
        employee.thirdBreak,
      ].filter((breakTime) => breakTime.start >= 16 * 60);
      if (breaksAfter16.length > 3) return false;

      // Check that the first break starts no earlier than an hour after the start of the shift
      if (employee.firstBreak.start < shiftStart + 60) return false;

      // Check that the third break starts no later than 75 minutes before the end of the shift
      if (employee.thirdBreak.start > shiftEnd - 75) return false;

      // Check that breaks are not carried over to another day
      if (
        !(
          shiftStart <= employee.firstBreak.start &&
          shiftEnd >= employee.firstBreak.end &&
          shiftStart <= employee.secondBreak.start &&
          shiftEnd >= employee.secondBreak.end &&
          shiftStart <= employee.thirdBreak.start &&
          shiftEnd >= employee.thirdBreak.end &&
          shiftStart <= employee.lunch.start &&
          shiftEnd >= employee.lunch.end
        )
      )
        return false;

      // If all checks are passed successfully, then the state is valid
      return true;
    }
  }

  //   // Функция для проверки допустимости состояния
  //   function isValid(state) {
  //     const count = 1;
  //     // Перебираем всех сотрудников в состоянии
  //     for (let employee of state) {
  //       console.log(count);
  //       // Находим начало и конец рабочей смены сотрудника
  //       let shiftStart =
  //         parseInt(
  //           employees
  //             .find((e) => e.id === employee.id)
  //             .shift.split("-")[0]
  //             .split(":")[0]
  //         ) *
  //           60 +
  //         parseInt(
  //           employees
  //             .find((e) => e.id === employee.id)
  //             .shift.split("-")[0]
  //             .split(":")[1]
  //         );
  //       let shiftEnd =
  //         parseInt(
  //           employees
  //             .find((e) => e.id === employee.id)
  //             .shift.split("-")[1]
  //             .split(":")[0]
  //         ) *
  //           60 +
  //         parseInt(
  //           employees
  //             .find((e) => e.id === employee.id)
  //             .shift.split("-")[1]
  //             .split(":")[1]
  //         );
  //       // Проверяем, что первый перерыв не раньше чем через час с момента начала рабочей смены и не раньше 8:45
  //       if (employee.firstBreak.start < Math.max(shiftStart + 60, 8 * 60 + 45))
  //         return false;
  //       // Проверяем, что разрыв между первым и вторым перерывами в диапазоне от 1 часа до 2,5 часов
  //       if (
  //         employee.firstBreak.end > employee.secondBreak.start - 60 ||
  //         employee.firstBreak.end < employee.secondBreak.start - 150
  //       )
  //         return false;
  //       // Проверяем, что разрыв между вторым и третьим перерывами в диапазоне от 1 часа до 2,5 часов
  //       if (
  //         employee.secondBreak.end > employee.thirdBreak.start - 60 ||
  //         employee.secondBreak.end < employee.thirdBreak.start - 150
  //       )
  //         return false;
  //       // Проверяем, что последний перерыв не позже чем за час до конца рабочей смены
  //       if (employee.thirdBreak.end > shiftEnd - 60) return false;
  //       // Проверяем, что обед в диапазоне с 11:30 до 15:15
  //       if (
  //         employee.lunch.start < 11 * 60 + 30 ||
  //         employee.lunch.end > 15 * 60 + 15
  //       )
  //         return false;
  //       // Проверяем, что разрыв между первым перерывом и обедом в диапазоне от 1 часа до 2,5 часов
  //       if (
  //         (employee.firstBreak.end > employee.lunch.start - 60 &&
  //           employee.firstBreak.end < employee.lunch.start) ||
  //         (employee.firstBreak.end > employee.lunch.end - 150 &&
  //           employee.firstBreak.end < employee.lunch.end)
  //       )
  //         return false;
  //       // Проверяем, что разрыв между вторым перерывом и обедом в диапазоне от 1 часа до 2,5 часов
  //       if (
  //         (employee.secondBreak.end > employee.lunch.start - 60 &&
  //           employee.secondBreak.end < employee.lunch.start) ||
  //         (employee.secondBreak.end > employee.lunch.end - 150 &&
  //           employee.secondBreak.end < employee.lunch.end)
  //       )
  //         return false;
  //       // Проверяем, что разрыв между третьим перерывом и обедом в диапазоне от 1 часа до 2,5 часов
  //       if (
  //         (employee.thirdBreak.end > employee.lunch.start - 60 &&
  //           employee.thirdBreak.end < employee.lunch.start) ||
  //         (employee.thirdBreak.end > employee.lunch.end - 150 &&
  //           employee.thirdBreak.end < employee.lunch.end)
  //       )
  //         return false;
  //     }
  //     // Если все проверки пройдены успешно, то состояние допустимо
  //     return true;
  //   }

  // Функция для генерации случайного соседнего состояния
  function neighbor(state) {
    const newState = JSON.parse(JSON.stringify(state));
    let valid = false;
    const maxIterations = 1000;
    let iterations = 0;
    while (!valid && iterations < maxIterations) {
      const employeeIndex = Math.floor(Math.random() * newState.length);
      const breaks = ["firstBreak", "secondBreak", "thirdBreak", "lunch"];
      const breakIndex = Math.floor(Math.random() * breaks.length);
      const timeShift = Math.floor(Math.random() * 3) - 1;
      newState[employeeIndex][breaks[breakIndex]].start += timeShift * 15;
      newState[employeeIndex][breaks[breakIndex]].end += timeShift * 15;
      valid = isValid(newState);
      iterations++;
    }
    return valid ? newState : state;
  }

  // Функция для генерации случайного соседнего состояния
  // function neighbor(state) {
  //     let newState = JSON.parse(JSON.stringify(state));
  //     let valid = false;
  //     while (!valid) {
  //         let employeeIndex = Math.floor(Math.random() * newState.length);
  //         let breaks = ["firstBreak", "secondBreak", "thirdBreak", "lunch"];
  //         let breakIndex = Math.floor(Math.random() * breaks.length);
  //         let timeShift = Math.floor(Math.random() * 3) - 1;
  //         newState[employeeIndex][breaks[breakIndex]].start += timeShift * 15;
  //         newState[employeeIndex][breaks[breakIndex]].end += timeShift * 15;
  //         valid = isValid(newState);
  //     }
  //     return newState;
  // }

  // Функция для расчета вероятности перехода
  function probability(energyDiff, temperature) {
    return Math.exp(-energyDiff / temperature);
  }

  // Инициализация начального состояния
  let state = [];
  for (let employee of employees) {
    let shiftStart =
      parseInt(employee.shift.split("-")[0].split(":")[0]) * 60 +
      parseInt(employee.shift.split("-")[0].split(":")[1]);
    let shiftEnd =
      parseInt(employee.shift.split("-")[1].split(":")[0]) * 60 +
      parseInt(employee.shift.split("-")[1].split(":")[1]);
    let firstBreakStart = Math.max(shiftStart + 60, 8 * 60 + 45);
    let lunchStart = Math.max(firstBreakStart + 60, 11 * 60 + 30);
    let thirdBreakStart = Math.min(shiftEnd - 60, 15 * 60 + 15);
    let secondBreakStart = Math.min(
      thirdBreakStart - 60,
      lunchStart + 45 + 150
    );
    state.push({
      id: employee.id,
      firstBreak: {
        start: firstBreakStart,
        end: firstBreakStart + 15,
      },
      secondBreak: {
        start: secondBreakStart,
        end: secondBreakStart + 15,
      },
      thirdBreak: {
        start: thirdBreakStart,
        end: thirdBreakStart + 15,
      },
      lunch: {
        start: lunchStart,
        end: lunchStart + 45,
      },
    });
  }

  // Инициализация температуры и охлаждения
  let temperature = 100;
  let coolingRate = 0.99;

  // Имитация отжига
  while (temperature > 1) {
    console.log(temperature);
    let newState = neighbor(state);
    let currentEnergy = energy(state);
    let newEnergy = energy(newState);
    if (
      newEnergy < currentEnergy ||
      Math.random() < probability(newEnergy - currentEnergy, temperature)
    ) {
      state = newState;
    }
    temperature *= coolingRate;
  }

  // Форматирование результата
  let result = {};
  for (let employee of state) {
    result[employee.id] = {
      firstBreak: {
        start:
          Math.floor(employee.firstBreak.start / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.firstBreak.start % 60).toString().padStart(2, "0"),
        end:
          Math.floor(employee.firstBreak.end / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.firstBreak.end % 60).toString().padStart(2, "0"),
      },
      secondBreak: {
        start:
          Math.floor(employee.secondBreak.start / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.secondBreak.start % 60).toString().padStart(2, "0"),
        end:
          Math.floor(employee.secondBreak.end / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.secondBreak.end % 60).toString().padStart(2, "0"),
      },
      thirdBreak: {
        start:
          Math.floor(employee.thirdBreak.start / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.thirdBreak.start % 60).toString().padStart(2, "0"),
        end:
          Math.floor(employee.thirdBreak.end / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.thirdBreak.end % 60).toString().padStart(2, "0"),
      },
      lunch: {
        start:
          Math.floor(employee.lunch.start / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.lunch.start % 60).toString().padStart(2, "0"),
        end:
          Math.floor(employee.lunch.end / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (employee.lunch.end % 60).toString().padStart(2, "0"),
      },
    };
  }
  return result;
}
