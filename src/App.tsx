// App.tsx con Dark Mode usando clases `dark:` de Tailwind
import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import moment from "moment"

export default function App() {
  const [birthDate, setBirthDate] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [lifeExpectancy, setLifeExpectancy] = useState(90)
  const [darkMode, setDarkMode] = useState(false)

  // Aplica o saca la clase dark del html
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

  const calculateDays = () => {
    if (!birthDate) return { lived: 0, total: 0 }

    const birth = moment(birthDate)
    const now = moment()
    const daysLived = now.diff(birth, "days")
    const totalDays = lifeExpectancy * 365

    return { lived: daysLived, total: totalDays }
  }

  const handleSubmit = () => {
    if (
      birthDate &&
      moment(birthDate).isValid() &&
      moment(birthDate).isBefore(moment())
    ) {
      setShowCalendar(true)
    }
  }

  const renderDecade = (startDay: number, endDay: number, lived: number) => {
    const days = []

    for (let i = startDay; i < endDay; i++) {
      days.push(
        <div
          key={i}
          className={`size-1 ${
            i < lived
              ? "bg-emerald-500"
              : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          }`}
          title={`Día ${i + 1}`}
        />
      )
    }

    return days
  }

  const renderCalendar = () => {
    const { lived, total } = calculateDays()
    const decades = []
    const daysPerDecade = 3650
    const totalDecades = Math.ceil(total / daysPerDecade)

    for (let d = 0; d < totalDecades; d++) {
      const startDay = d * daysPerDecade
      const endDay = Math.min(startDay + daysPerDecade, total)
      const startAge = d * 10
      const endAge = Math.min(startAge + 10, lifeExpectancy)

      decades.push(
        <div key={d} className="flex flex-col gap-1">
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {startAge} - {endAge} años
          </div>
          <div className="flex flex-wrap gap-0.5">
            {renderDecade(startDay, endDay, lived)}
          </div>
        </div>
      )
    }

    return decades
  }

  const { lived, total } = showCalendar
    ? calculateDays()
    : { lived: 0, total: 0 }
  const yearsLived = Math.floor(lived / 365)
  const daysRemaining = lived % 365

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 px-4 py-2 rounded bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors"
      >
        {darkMode ? "Modo Claro" : "Modo Oscuro"}
      </button>

      {!showCalendar ? (
        <section className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            <Icon
              icon="mdi:calendar-heart"
              className="text-neutral-700 dark:text-neutral-300 text-5xl"
            />

            <h1 className="text-2xl font-medium">Tu Calendario de Vida</h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-center">
              Visualiza los días de tu vida. Cada cuadradito representa un día.
            </p>

            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="birthDate" className="text-sm font-medium">
                  Fecha de nacimiento
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={moment().format("YYYY-MM-DD")}
                  className="px-4 py-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 font-medium bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors"
              >
                Ver mi calendario
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="w-full max-w-6xl flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:calendar-heart"
                className="text-3xl text-neutral-700 dark:text-neutral-300"
              />
              <h1 className="text-2xl font-medium">Tu Vida en Días</h1>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500"></div>
                  <span>
                    Vividos: {lived} días ({yearsLived} años, {daysRemaining}{" "}
                    días)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"></div>
                  <span>Por vivir: {total - lived} días</span>
                </div>
              </div>

              <p className="text-xs text-pink-900 dark:text-pink-300">
                Se toman en cuenta los años bisiestos, puede causar que justo
                hoy cumplas años y te agregue unos días de más.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="lifeExpectancy" className="text-sm font-medium">
                  Expectativa de vida (años)
                </label>
                <input
                  id="lifeExpectancy"
                  type="number"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                  className="px-4 py-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="birthDate" className="text-sm font-medium">
                  Fecha de nacimiento
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={moment().format("YYYY-MM-DD")}
                  className="px-4 py-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-neutral-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>
          </section>

          <section className="p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col gap-6">{renderCalendar()}</div>
          </section>

          <section className="flex flex-col gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <p>Cada cuadradito representa un día de tu vida.</p>
            <p>
              Expectativa de vida: {lifeExpectancy} años ({total} días)
            </p>
            <p>Fecha de nacimiento: {moment(birthDate).format("DD/MM/YYYY")}</p>
          </section>
        </div>
      )}
    </main>
  )
}
