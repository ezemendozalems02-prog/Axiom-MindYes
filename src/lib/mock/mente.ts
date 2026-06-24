import type { Decision, Idea, ItemBandejaMental, Nota } from "@/types/mente";

export const bandejaMental: ItemBandejaMental[] = [
  { id: "bm1", texto: "Tal vez debería ofrecer un plan anual con descuento", creadaEn: "2026-06-24T08:10:00" },
  { id: "bm2", texto: "Llamar a mamá", creadaEn: "2026-06-24T08:12:00" },
  { id: "bm3", texto: "¿Conviene mudar el hosting antes de fin de mes?", creadaEn: "2026-06-23T19:40:00" },
];

export const ideas: Idea[] = [
  {
    id: "i1",
    titulo: "Ofrecer mantenimiento mensual a clientes web",
    descripcion:
      "Paquete post-entrega de mantenimiento y mejoras continuas para clientes de Opus Webs.",
    area: "Negocio",
    potencial: "Alta",
    estado: "Nueva",
    origen: "Conversación con Cliente X",
    fecha: "2026-06-23",
    accionesPosibles: ["Armar propuesta", "Validar precio con 3 clientes actuales"],
  },
  {
    id: "i2",
    titulo: "Newsletter quincenal sobre productividad",
    descripcion: "Compartir aprendizajes del sistema Axiom Mind con una audiencia propia.",
    area: "Creatividad",
    potencial: "Media",
    estado: "En análisis",
    origen: "Reflexión personal",
    fecha: "2026-06-18",
    accionesPosibles: ["Definir frecuencia", "Elegir plataforma"],
  },
];

export const decisiones: Decision[] = [
  {
    id: "d1",
    problema: "¿Migrar el hosting de Opus Webs antes de fin de mes?",
    opciones: [
      {
        nombre: "Migrar ahora",
        pros: ["Mejor performance", "Soporte más rápido"],
        contras: ["Riesgo de downtime en plena entrega del proyecto"],
      },
      {
        nombre: "Esperar a después de la entrega",
        pros: ["Cero riesgo durante el proyecto activo"],
        contras: ["Seguís pagando de más un mes más"],
      },
    ],
    impacto: "Medio",
    costoRiesgo: "Posible downtime de 1-2 horas si se migra ahora.",
    estado: "Abierta",
    fechaLimite: "2026-06-28",
    creadaEn: "2026-06-20T10:00:00",
  },
  {
    id: "d2",
    problema: "¿Contratar diseñador freelance para Rediseño de marca personal?",
    opciones: [
      {
        nombre: "Contratar a Mariana",
        pros: ["Ya conoce tu estilo", "Entrega en 2 semanas"],
        contras: ["Más cara que otras opciones"],
      },
      {
        nombre: "Buscar otra opción más económica",
        pros: ["Menor costo"],
        contras: ["Curva de aprendizaje, posible demora"],
      },
    ],
    impacto: "Bajo",
    costoRiesgo: "Bajo — el proyecto no es urgente.",
    estado: "Abierta",
    fechaLimite: null,
    creadaEn: "2026-06-12T15:00:00",
  },
];

export const notas: Nota[] = [
  {
    id: "n1",
    titulo: "Ideas para la propuesta de Cliente X",
    contenido:
      "Incluir alcance de mantenimiento mensual como upsell. Mencionar el plazo de entrega de 3 semanas.",
    vinculo: { tipo: "proyecto", valor: "Opus Webs" },
    creadaEn: "2026-06-22T11:00:00",
  },
  {
    id: "n2",
    titulo: "Notas sueltas de la revisión semanal",
    contenido: "Proteger el bloque de foco de la mañana. Probar bloquear el calendario.",
    vinculo: null,
    creadaEn: "2026-06-21T20:00:00",
  },
];
