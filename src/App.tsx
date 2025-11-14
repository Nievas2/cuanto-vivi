import { useMemo, useState, memo } from "react"
import { Icon } from "@iconify/react"
import moment from "moment"

// Componente memoizado para cada década
const DecadeBlock = memo(({ 
  startDay, 
  endDay, 
  dayInfo, 
  startAge, 
  endAge, 
  showYears 
}: {
  startDay: number
  endDay: number
  dayInfo: any[]
  startAge: number
  endAge: number
  showYears: boolean
}) => {
  return (
    <div className="flex flex-col gap-1">
      {showYears && (
        <div className="text-xs font-medium text-neutral-600">
          {startAge} - {endAge} años
        </div>
      )}
      <div className="flex flex-wrap gap-0.5">
        {dayInfo.slice(startDay, endDay).map((info, i) => {
          const dayIndex = startDay + i
          return (
            <div
              key={dayIndex}
              className={`size-1.5 ${info.color} transition-all duration-300 hover:scale-150 hover:z-10 relative group cursor-default`}
              style={info.style}
              title={info.title}
            />
          )
        })}
      </div>
    </div>
  )
})

DecadeBlock.displayName = "DecadeBlock"

export default function App() {
  const [birthDate, setBirthDate] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [lifeExpectancy, setLifeExpectancy] = useState(77)
  const [showYears, setShowYears] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleSubmit = () => {
    if (
      birthDate &&
      moment(birthDate).isValid() &&
      moment(birthDate).isBefore(moment())
    ) {
      setIsCalculating(true)
      setTimeout(() => {
        setShowCalendar(true)
        setIsCalculating(false)
      }, 100)
    }
  }

  const calendarData = useMemo(() => {
    if (!birthDate || !showCalendar) {
      return {
        lived: 0,
        total: 0,
        yearsLived: 0,
        daysRemaining: 0,
        dayInfo: [],
      }
    }

    const birth = moment(birthDate)
    const now = moment()
    const lived = now.diff(birth, "days")
    const total = lifeExpectancy * 365 + Math.floor(lifeExpectancy / 4)

    const dayInfo: {
      color?: string
      title: string
      style?: { backgroundColor: string }
    }[] = new Array(total)

    for (let i = 0; i < total; i++) {
      const dayDate = birth.clone().add(i, "days")

      if (i >= lived) {
        // Días futuros
        dayInfo[i] = {
          color: "bg-white border border-neutral-200",
          title: `Día ${i + 1} • ${dayDate.format("DD MMM YYYY")}`,
        }
      } else {
        // Días vividos (color verde fijo)
        dayInfo[i] = {
          style: { backgroundColor: "oklch(69.6% 0.17 162.48)" },
          title: `Día vivido • ${dayDate.format("DD MMM YYYY")}`,
        }
      }
    }

    const yearsLived = Math.floor(lived / 365)
    const daysRemaining = lived % 365

    return { lived, total, yearsLived, daysRemaining, dayInfo }
  }, [birthDate, lifeExpectancy, showCalendar])

  const decades = useMemo(() => {
    if (!calendarData.dayInfo.length) return []

    const decadesArray = []
    const daysPerDecade = 3650 // ≈ 10 años
    const totalDecades = Math.ceil(calendarData.total / daysPerDecade)

    for (let d = 0; d < totalDecades; d++) {
      const startDay = d * daysPerDecade
      const endDay = Math.min(startDay + daysPerDecade, calendarData.total)
      const startAge = d * 10
      const endAge = Math.min(startAge + 10, lifeExpectancy)

      decadesArray.push({
        key: d,
        startDay,
        endDay,
        startAge,
        endAge,
      })
    }
    return decadesArray
  }, [calendarData.total, calendarData.dayInfo.length, lifeExpectancy])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 lg:p-8 bg-neutral-50 text-neutral-900 transition-colors">
      {!showCalendar ? (
        <section className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            <Icon icon="mdi:calendar-heart" className="text-5xl text-neutral-700" />
            <h1 className="text-2xl font-medium">Tu Calendario de Vida</h1>
            <p className="text-center text-neutral-600">
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
                  className="px-4 py-3 border border-neutral-300 bg-white rounded focus:outline-none focus:border-neutral-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isCalculating}
                className="w-full px-4 py-3 font-medium bg-neutral-800 text-white hover:bg-neutral-700 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Cargando...
                  </>
                ) : (
                  "Ver mi calendario"
                )}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="w-full p-2 md:p-6 flex flex-col gap-8">
          {/* Resumen */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:calendar-heart" className="text-3xl text-neutral-700" />
              <h1 className="text-2xl font-medium">Tu Vida en Días</h1>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span>
                    Vividos: {calendarData.lived} días ({calendarData.yearsLived} años y {calendarData.daysRemaining} días)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-neutral-300 rounded"></div>
                  <span>
                    Por vivir: {calendarData.total - calendarData.lived} días
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Expectativa de vida</label>
                <input
                  type="number"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-32 px-3 py-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={moment().format("YYYY-MM-DD")}
                  className="px-3 py-2 border rounded"
                />
              </div>
            </div>
          </section>

          {/* Calendario */}
          <section className="p-8 bg-white border border-neutral-200 rounded-lg overflow-x-auto relative">
            {isCalculating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-3 text-emerald-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent"></div>
                  <span className="font-medium">Actualizando calendario...</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-8 min-w-0">
              {decades.map((decade) => (
                <DecadeBlock
                  key={decade.key}
                  startDay={decade.startDay}
                  endDay={decade.endDay}
                  dayInfo={calendarData.dayInfo}
                  startAge={decade.startAge}
                  endAge={decade.endAge}
                  showYears={showYears}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowYears(!showYears)}
                className="px-4 py-2 text-sm font-medium underline hover:no-underline"
              >
                {showYears ? "Ocultar etiquetas de años" : "Mostrar etiquetas de años"}
              </button>
            </div>
          </section>

          <footer className="text-center text-sm text-neutral-500">
            <p>Fecha de nacimiento: {moment(birthDate).format("DD MMMM YYYY")}</p>
            <p>
              Expectativa: {lifeExpectancy} años ≈ {calendarData.total.toLocaleString()} días totales
            </p>
          </footer>
        </div>
      )}
    </main>
  )
}