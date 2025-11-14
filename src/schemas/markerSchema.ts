import moment from "moment"
import { z } from "zod"

// Esquema de validación con Zod
export const markerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
  startDate: z.string().refine((val) => moment(val).isValid(), {
    message: "Fecha de inicio inválida",
  }),
  endDate: z.string().optional().nullable(),
  color: z.string().regex(/^#/, "Debe ser un color hexadecimal"),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return moment(data.endDate).isSameOrAfter(data.startDate, "day")
  }
  return true
}, {
  message: "La fecha de fin no puede ser anterior al inicio",
  path: ["endDate"],
})
