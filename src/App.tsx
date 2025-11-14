import { useMemo, useState } from "react"
import { Icon } from "@iconify/react"
import moment from "moment"
import type { LifeMarker } from "./interfaces/LifeMarker"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { markerSchema } from "./schemas/markerSchema"

export default function App() {
  const [birthDate, setBirthDate] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [lifeExpectancy, setLifeExpectancy] = useState(77)
  const [markers, setMarkers] = useState<LifeMarker[]>([])

  const handleSubmit = () => {
    if (
      birthDate &&
      moment(birthDate).isValid() &&
      moment(birthDate).isBefore(moment())
    ) {
      setShowCalendar(true)
    }
  }

  function randomColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16)
    return "#" + randomColor.padStart(6, "0")
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
    const total = lifeExpectancy * 365 + Math.floor(lifeExpectancy / 4) // aproximamos bisiestos

    const dayInfo: {
      color?: string
      title: string
      style?: {
        backgroundColor: string
      }
    }[] = []

    // Preparamos marcadores para búsqueda rápida
    const markerRanges = markers.map((m) => ({
      start: moment(m.startDate),
      end: m.endDate ? moment(m.endDate) : moment(m.startDate),
      marker: m,
    }))

    for (let i = 0; i < total; i++) {
      const dayDate = birth.clone().add(i, "days")

      if (i >= lived) {
        dayInfo.push({
          color: "bg-white  border border-neutral-200 ",
          title: `Día ${i + 1} • ${dayDate.format("DD MMM YYYY")}`,
        })
        continue
      }

      // Buscar marcador activo
      const activeMarker = markerRanges
        .filter((m) => dayDate.isBetween(m.start, m.end, "day", "[]"))
        .pop() // el último tiene prioridad

      if (!activeMarker) {
        dayInfo.push({
          style: { backgroundColor: "oklch(69.6% 0.17 162.48)" },
          title: `Día vivido • ${dayDate.format("DD MMM YYYY")}`,
        })
      } else {
        console.log(activeMarker.marker.color.slice(0, 1))

        dayInfo.push({
          // Usamos style en vez de clases dinámicas
          style: {
            backgroundColor: activeMarker.marker.color,
            // opcional: agregar opacidad o borde si quieres
          },
          title: activeMarker.marker.name
            ? `${activeMarker.marker.name} • ${dayDate.format("DD MMM YYYY")}`
            : dayDate.format("DD MMM YYYY"),
        })
      }
    }

    const yearsLived = Math.floor(lived / 365)
    const daysRemaining = lived % 365

    return { lived, total, yearsLived, daysRemaining, dayInfo }
  }, [birthDate, lifeExpectancy, markers, showCalendar])

  const renderDecade = (startDay: number, endDay: number) => {
    return calendarData.dayInfo.slice(startDay, endDay).map((info, i) => {
      const dayIndex = startDay + i
      return (
        <div
          key={dayIndex}
          className={`size-1.5 ${info.color} transition-all duration-300 hover:scale-150 hover:z-10 relative group cursor-default`}
          style={info.style} // Aquí aplicamos el color dinámico
          title={info.title}
        ></div>
      )
    })
  }

  const renderCalendar = () => {
    const decades = []
    const daysPerDecade = 3650
    const totalDecades = Math.ceil(calendarData.total / daysPerDecade)

    for (let d = 0; d < totalDecades; d++) {
      const startDay = d * daysPerDecade
      const endDay = Math.min(startDay + daysPerDecade, calendarData.total)
      const startAge = d * 10
      const endAge = Math.min(startAge + 10, lifeExpectancy)

      decades.push(
        <div key={d} className="flex flex-col gap-1">
          <div className="text-xs font-medium text-neutral-600 ">
            {startAge} - {endAge} años
          </div>
          <div className="flex flex-wrap gap-0.5">
            {renderDecade(startDay, endDay)}
          </div>
        </div>
      )
    }
    return decades
  }

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(markerSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      color: randomColor(),
    },
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-50 text-neutral-900  transition-colors">
      {!showCalendar ? (
        <section className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            <Icon
              icon="mdi:calendar-heart"
              className="text-5xl text-neutral-700 "
            />
            <h1 className="text-2xl font-medium">Tu Calendario de Vida</h1>
            <p className="text-center text-neutral-600 ">
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
                  className="px-4 py-3 border border-neutral-300  bg-white  rounded focus:outline-none focus:border-neutral-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 font-medium bg-neutral-800 text-white hover:bg-neutral-700 rounded transition"
              >
                Ver mi calendario
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="w-full max-w-7xl flex flex-col gap-8">
          {/* Resumen */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:calendar-heart"
                className="text-3xl text-neutral-700 "
              />
              <h1 className="text-2xl font-medium">Tu Vida en Días</h1>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600 ">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span>
                    Vividos: {calendarData.lived} días (
                    {calendarData.yearsLived} años y{" "}
                    {calendarData.daysRemaining} días)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white  border border-neutral-300  rounded"></div>
                  <span>
                    Por vivir: {calendarData.total - calendarData.lived} días
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Expectativa de vida
                </label>
                <input
                  type="number"
                  value={lifeExpectancy}
                  onChange={(e) =>
                    setLifeExpectancy(Number(e.target.value) || 90)
                  }
                  className="w-32 px-3 py-2 border rounded "
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={moment().format("YYYY-MM-DD")}
                  className="px-3 py-2 border rounded "
                />
              </div>
            </div>
          </section>

          {/* Formulario de marcadores */}
          <section className="bg-white p-6 rounded-lg border border-neutral-200">
            <h2 className="text-lg font-semibold mb-4">Añadir Hito o Evento</h2>

            <form
              onSubmit={handleFormSubmit((data) => {
                const newMarker: LifeMarker = {
                  id: moment.toString(),
                  name: data.name || "Evento sin nombre",
                  startDate: data.startDate,
                  endDate: data.endDate || undefined,
                  color: data.color,
                }

                setMarkers((prev) => [...prev, newMarker])
                reset() // limpia el formulario
                // Opcional: generar nuevo color aleatorio
                randomColor()
              })}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="ej: Graduación, Viaje a Japón..."
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Inicio *</label>
                  <input
                    {...register("startDate")}
                    type="date"
                    max={moment().format("YYYY-MM-DD")}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Fin (opcional)</label>
                  <input
                    {...register("endDate")}
                    type="date"
                    max={moment().add(50, "years").format("YYYY-MM-DD")}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      {...register("color")}
                      type="color"
                      className="w-full h-10 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const color = randomColor()
                        setValue("color", color)
                      }}
                      className="px-3 py-2 text-xs bg-neutral-100 hover:bg-neutral-200 rounded border"
                      title="Color aleatorio"
                    >
                      <Icon icon="mdi:dice-6" className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-medium"
                >
                  + Añadir Marcador
                </button>

                {Object.keys(errors).length > 0 && (
                  <p className="text-red-500 text-sm">
                    Por favor, corrige los errores arriba
                  </p>
                )}
              </div>
            </form>

            {/* Lista de marcadores activos */}
            {markers.length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-semibold text-neutral-700">
                  Marcadores activos
                </h3>
                {markers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between bg-neutral-50 px-4 py-3 rounded border"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className="w-5 h-5 rounded border-2 border-white shadow"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="font-medium">{m.name}</span>
                      <span className="text-neutral-500 text-xs">
                        {moment(m.startDate).format("DD MMM YYYY")}
                        {m.endDate &&
                          ` → ${moment(m.endDate).format("DD MMM YYYY")}`}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setMarkers((p) => p.filter((x) => x.id !== m.id))
                      }
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Calendario */}
          <section className="p-8 bg-white  border border-neutral-200  rounded-lg overflow-x-auto">
            <div className="flex flex-col gap-8 min-w-0">
              {renderCalendar()}
            </div>
          </section>

          <footer className="text-center text-sm text-neutral-500 ">
            <p>
              Fecha de nacimiento: {moment(birthDate).format("DD MMMM YYYY")}
            </p>
            <p>
              Expectativa: {lifeExpectancy} años ≈{" "}
              {calendarData.total.toLocaleString()} días totales
            </p>
          </footer>
        </div>
      )}
    </main>
  )
}
