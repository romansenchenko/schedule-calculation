export function scheduleBreaksGenetic(employees, setMaximumIntersection) {
  // Вспомогательная функция для преобразования строки времени в минуты
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Вспомогательная функция для преобразования минут в строку времени
  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  // Вспомогательная функция для генерации случайного расписания для сотрудника -
  //пофиксить:
  //обед попал на последний час
  // 3 перерыв попал на обед

  function generateSchedule(shiftStart, shiftEnd, breaksScheduleTemp) {
    console.log(Object.keys(breaksScheduleTemp).length);

    const schedule = {};
    let breakStart, breakEnd;
    //firstBreak
    if (shiftStart <= timeToMinutes("07:00")) {
      breakStart = Math.max(timeToMinutes("08:45"), shiftStart + 60);
      breakEnd = breakStart + 15;
      schedule.firstBreak = {
        start: minutesToTime(breakStart),
        end: minutesToTime(breakEnd),
      };
    } else {
      let breaksCount = 0;
      for (const employee in breaksScheduleTemp) {
        if (
          breaksScheduleTemp[employee].firstBreak.start >= "09:00" &&
          breaksScheduleTemp[employee].firstBreak.end <=
            minutesToTime(shiftStart + 75 )
        ) {
          breaksCount++;
        }
      }
      if (breaksCount < 5) {
        breakStart = Math.max(timeToMinutes("08:45"), shiftStart + 60);
        breakEnd = breakStart + 15;
        schedule.firstBreak = {
          start: minutesToTime(breakStart),
          end: minutesToTime(breakEnd),
        };
      } else { 
        breakStart = Math.max(timeToMinutes("08:45"), shiftStart + 60);
        breakStart = Math.max(breakStart + Math.floor(Math.random() * 46 - 1));
        breakEnd = breakStart + 15;
        schedule.firstBreak = {
          start: minutesToTime(breakStart),
          end: minutesToTime(breakEnd),
        };
      }
    }
    //secondBreak
    if (shiftStart <= timeToMinutes("07:00")) {
      breakStart = breakEnd + 60 + Math.floor(Math.random() * 15);
      breakEnd = breakStart + 15;
      schedule.secondBreak = {
        start: minutesToTime(breakStart),
        end: minutesToTime(breakEnd),
      };
    } else {
      breakStart = breakEnd + 60 + Math.floor(Math.random() * 91);
      breakEnd = breakStart + 15;
      schedule.secondBreak = {
        start: minutesToTime(breakStart),
        end: minutesToTime(breakEnd),
      };
    }

    //lunch
    let lunchStart, lunchEnd;
    if (shiftStart <= timeToMinutes("07:00")) {
      lunchStart = Math.max(
        timeToMinutes("11:30"),
        breakEnd + 60 + Math.floor(Math.random() * 16)
      );
      //lunchStart = Math.min(lunchStart, timeToMinutes("15:15") - 45);
      lunchEnd = lunchStart + 45;
      schedule.lunch = {
        start: minutesToTime(lunchStart),
        end: minutesToTime(lunchEnd),
      };
    } else {
      lunchStart = Math.max(
        timeToMinutes("11:30"),
        breakEnd + 60 + Math.floor(Math.random() * 91)
      );
      lunchStart = Math.min(lunchStart, timeToMinutes("15:15") - 45);
      lunchEnd = lunchStart + 45;
      schedule.lunch = {
        start: minutesToTime(lunchStart),
        end: minutesToTime(lunchEnd),
      };
    }

    //thirdBreak
    if (shiftStart <= timeToMinutes("07:00")) {
      breakStart = lunchEnd + 60 + Math.floor(Math.random() * 16);
      breakStart = Math.min(breakStart, shiftEnd - 60 - 15);
      breakEnd = breakStart + 15;
      schedule.thirdBreak = {
        start: minutesToTime(breakStart),
        end: minutesToTime(breakEnd),
      };
    } else {
      breakStart = lunchEnd + 60 + Math.floor(Math.random() * 91);
      breakStart = Math.min(breakStart, shiftEnd - 60 - 15);
      breakEnd = breakStart + 15;
      schedule.thirdBreak = {
        start: minutesToTime(breakStart),
        end: minutesToTime(breakEnd),
      };
    }

    return schedule;
  }
  // Вспомогательная функция для расчета приспособленности расписания
  function calculateFitness(schedule) {
    // Вспомогательная функция для преобразования строки времени в минуты
    function timeToMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }
    // Создаем массив для хранения количества перерывов в каждый момент времени
    const breaksCount = new Array(24 * 60).fill(0);
    // Перебираем всех сотрудников
    for (const employee of employees) {
      // Получаем расписание сотрудника
      const employeeSchedule = schedule[employee.id];
      // Перебираем все перерывы сотрудника
      for (const key in employeeSchedule) {
        // Получаем время начала и окончания перерыва в минутах
        const start = timeToMinutes(employeeSchedule[key].start);
        const end = timeToMinutes(employeeSchedule[key].end);
        // Увеличиваем количество перерывов в каждый момент времени между началом и окончанием перерыва
        for (let i = start; i < end; i += 1) {
          breaksCount[i]++;
        }
      }
    }
    // Находим максимальное количество перерывов в один момент времени
    let maxBreaks = Math.max(...breaksCount);

    // Проверяем, что количество перерывов шло по нарастающей до времени 12:00
    let increasingUntilNoon = true;
    for (let i = 1; i < timeToMinutes("12:00"); i++) {
      if (breaksCount[i - 1] > breaksCount[i]) {
        increasingUntilNoon = false;
        break;
      }
    }

    // Проверяем, что в диапазоне с 12:00 до 15:00 был пик перерывов
    let peakBetweenNoonAndThree = true;
    let maxBetweenNoonAndThree = Math.max(
      ...breaksCount.slice(timeToMinutes("12:00"), timeToMinutes("15:00"))
    );
    if (maxBetweenNoonAndThree !== maxBreaks) {
      peakBetweenNoonAndThree = false;
    }

    // Проверяем, что после 15:00 был спад перерывов и после 16:00 - не более трех
    let decreasingAfterThree = true;
    for (let i = timeToMinutes("15:00") + 1; i < breaksCount.length; i++) {
      if (breaksCount[i - 1] < breaksCount[i]) {
        decreasingAfterThree = false;
        break;
      }
      if (i >= timeToMinutes("16:00") && breaksCount[i] > 3) {
        decreasingAfterThree = false;
        break;
      }
    }

    if (
      increasingUntilNoon === false ||
      peakBetweenNoonAndThree === false ||
      decreasingAfterThree === false
    ) {
      maxBreaks = Infinity;
    }

    // Возвращаем объект с информацией о приспособленности расписания
    return maxBreaks;
  }

  // Параметры генетического алгоритма
  const populationSize = 200;
  const mutationRate = 0.05;
  const maxGenerations = 2000;

  // Генерация начальной популяции
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    const individual = {};
    for (const employee of employees) {
      const [shiftStart, shiftEnd] = employee.shift
        .split("-")
        .map(timeToMinutes);
      individual[employee.id] = generateSchedule(
        shiftStart,
        shiftEnd,
        individual
      );
    }
    population.push(individual);
  }

  // Запуск генетического алгоритма
  for (let generation = 0; generation < maxGenerations; generation++) {
    // Расчет приспособленности популяции
    const fitnesses = population.map(calculateFitness);

    // Выбор родителей
    const parents = [];
    for (let i = 0; i < populationSize / 2; i++) {
      let parent1Index;
      let parent2Index;
      do {
        parent1Index = fitnesses.indexOf(Math.min(...fitnesses));
        parent2Index = fitnesses.indexOf(
          Math.min(...fitnesses.filter((_, index) => index !== parent1Index))
        );
      } while (Math.random() < mutationRate);
      parents.push([population[parent1Index], population[parent2Index]]);
      fitnesses[parent1Index] = fitnesses[parent2Index] = Infinity;
    }

    // Генерация потомства
    population.length = 0;
    for (const [parent1, parent2] of parents) {
      const offspring1 = {};
      const offspring2 = {};
      for (const employee of employees) {
        if (Math.random() < 0.5) {
          offspring1[employee.id] = parent1[employee.id];
          offspring2[employee.id] = parent2[employee.id];
        } else {
          offspring1[employee.id] = parent2[employee.id];
          offspring2[employee.id] = parent1[employee.id];
        }
      }
      population.push(offspring1);
      population.push(offspring2);
    }

    // Мутация популяции
    for (const individual of population) {
      if (Math.random() < mutationRate) {
        const employee =
          employees[Math.floor(Math.random() * employees.length)];
        const [shiftStart, shiftEnd] = employee.shift
          .split("-")
          .map(timeToMinutes);
        individual[employee.id] = generateSchedule(
          shiftStart,
          shiftEnd,
          individual
        );
      }
    }
  }

  // Возврат лучшего индивида
  const fitnesses = population.map(calculateFitness);
  const bestIndex = fitnesses.indexOf(Math.min(...fitnesses));

  setMaximumIntersection(calculateFitness(population[bestIndex]));
  return population[bestIndex];
}
