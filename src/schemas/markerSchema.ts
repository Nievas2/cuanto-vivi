import moment from "moment"
import { z } from "zod"

const today = moment().startOf("day");
export const markerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
  
  startDate: z.string()
    .refine((val) => moment(val).isValid(), {
      message: "Fecha de inicio inválida",
    })
    .refine((val) => moment(val).isSameOrBefore(today, "day"), {
      message: "La fecha de inicio no puede ser futura",
    }),

  endDate: z.string()
    .optional() // si puede ser opcional
    .or(z.literal("")) // permite cadena vacía si usas input tipo date que manda ""
    .transform((val) => val === "" ? null : val) // opcional: convierte "" → null
    .refine((val) => !val || moment(val).isValid(), {
      message: "Fecha de fin inválida",
    })
    .refine((val) => !val || moment(val).isSameOrBefore(today, "day"), {
      message: "La fecha de fin no puede ser futura",
    }),

  color: z.string().regex(/^#/, "Debe ser un color hexadecimal"),
})

// Validaciones cruzadas
.refine((data) => {
  if (data.endDate && data.startDate) {
    return moment(data.endDate).isSameOrAfter(moment(data.startDate), "day");
  }
  return true;
}, {
  message: "La fecha de fin no puede ser anterior a la de inicio",
  path: ["endDate"],
});