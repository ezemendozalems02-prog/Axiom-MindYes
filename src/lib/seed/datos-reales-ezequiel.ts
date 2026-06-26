import { useAccionStore } from "@/stores/accion-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useMenteStore } from "@/stores/mente-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { syncCrearProyecto, syncCrearTarea } from "@/lib/supabase/accion-sync";
import { getHoyISO } from "@/lib/hoy";

import type { Proyecto, Tarea } from "@/types/accion";
import type { Objetivo, Meta, PlanSemanal, VisionPersonal } from "@/types/direccion";
import type { Habito } from "@/types/identidad";
import type { Idea } from "@/types/mente";
import type { Ingreso, Deuda } from "@/types/finanzas";

function sumarDias(fechaISO: string, dias: number): string {
  const d = new Date(fechaISO + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return getHoyISO(d);
}

function inicioSemana(fechaISO: string): string {
  const d = new Date(fechaISO + "T00:00:00");
  const dia = d.getDay();
  const offset = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + offset);
  return getHoyISO(d);
}

export async function aplicarDatosRealesEzequiel() {
  const hoy = getHoyISO();
  const lunes = inicioSemana(hoy);
  const domingo = sumarDias(lunes, 6);

  // Los objetivos no sincronizan con Supabase, pero tareas.objetivo_id sí es uuid —
  // por eso cada id legible de objetivo también necesita un UUID real detrás.
  const idsObjetivos = new Map<string, string>();
  function uid(key: string): string {
    if (!idsObjetivos.has(key)) idsObjetivos.set(key, crypto.randomUUID());
    return idsObjetivos.get(key)!;
  }

  // Los proyectos y tareas sincronizan con Supabase (columna id: uuid) —
  // necesitan UUIDs reales, a diferencia de objetivos/hábitos que son 100% locales.
  const ID_PROYECTO_OPUSWEBS = crypto.randomUUID();
  const ID_PROYECTO_VORTEX = crypto.randomUUID();
  const ID_PROYECTO_FORMACION = crypto.randomUUID();
  const ID_TAREA_PROSPECTAR = crypto.randomUUID();
  const ID_TAREA_SEGUIMIENTO_PRESUPUESTOS = crypto.randomUUID();
  const ID_TAREA_MENSAJES_COMERCIALES = crypto.randomUUID();
  const ID_TAREA_INSTAGRAM = crypto.randomUUID();
  const ID_TAREA_PAGAR_CAMI = crypto.randomUUID();
  const ID_TAREA_PAGAR_MAMA = crypto.randomUUID();
  const ID_TAREA_PLAN_PUBLICIDAD = crypto.randomUUID();
  const ID_TAREA_VORTEX_MARKETING = crypto.randomUUID();
  const ID_TAREA_FORMACION_CONTENIDO = crypto.randomUUID();

  // ---------- NEGOCIO / ACCIÓN: proyectos ----------
  const proyectoOpusWebs: Proyecto = {
    id: ID_PROYECTO_OPUSWEBS,
    nombre: "OpusWebs",
    area: "Negocio",
    tipo: "Propio",
    clienteId: null,
    progreso: 0,
    fechaLimite: null,
    estado: "en_curso",
  };
  const proyectoVortex: Proyecto = {
    id: ID_PROYECTO_VORTEX,
    nombre: "Vortex Control Phone",
    area: "Negocio",
    tipo: "Propio",
    clienteId: null,
    progreso: 0,
    fechaLimite: null,
    estado: "en_curso",
  };
  const proyectoFormacion: Proyecto = {
    id: ID_PROYECTO_FORMACION,
    nombre: "Formación de páginas web con IA",
    area: "Negocio",
    tipo: "Propio",
    clienteId: null,
    progreso: 0,
    fechaLimite: null,
    estado: "en_curso",
  };
  const proyectos = [proyectoOpusWebs, proyectoVortex, proyectoFormacion];

  // ---------- DIRECCIÓN: visión ----------
  const vision: VisionPersonal = {
    vision:
      "Construir un ecosistema de empresas tecnológicas que me permita vivir con libertad de tiempo y financiera. Desarrollar productos propios, SaaS y agencias que funcionen sin depender completamente de mí. Construir sistemas, procesos y equipos, invirtiendo constantemente en marketing, publicidad y desarrollo para acelerar el crecimiento.",
    proposito:
      "Construir empresas que realmente solucionen problemas utilizando tecnología, automatización e inteligencia artificial. Ayudar a negocios tradicionales a modernizarse mientras construyo productos SaaS escalables.",
    identidadFutura:
      "Soy una persona que ejecuta todos los días, termina lo que empieza y construye sistemas que generan resultados.",
    valores: [
      "Disciplina",
      "Consistencia",
      "Honestidad",
      "Aprendizaje constante",
      "Salud",
      "Libertad",
      "Enfoque",
      "Responsabilidad",
      "Acción",
      "Simplicidad",
    ],
    actualizadoEn: hoy,
  };

  // ---------- DIRECCIÓN: objetivos ----------
  const objetivos: Objetivo[] = [
    {
      id: uid("real-obj-flujo-caja"),
      titulo: "Conseguir flujo de caja",
      descripcion: "Prioridad absoluta de los próximos 90 días: resolver el flujo de caja antes que cualquier otra cosa.",
      nivel: "Trimestral",
      area: "Finanzas",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: ["real-habito-prospectar", "real-habito-mensajes-comerciales"],
      metricasExito: ["Facturación mensual en USD"],
      fechaLimite: sumarDias(hoy, 90),
      estado: "Activo",
      motivacion: "Sin flujo de caja no puedo pagar deudas ni invertir en crecer.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-clientes-high-ticket"),
      titulo: "Conseguir clientes High Ticket para OpusWebs",
      descripcion: "Vender páginas web premium y sistemas gastronómicos entre USD 700 y USD 1.500. Mi trabajo principal es vender, no programar ni diseñar.",
      nivel: "Mensual",
      area: "Negocio",
      objetivoPadreId: uid("real-obj-flujo-caja"),
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: ["real-habito-prospectar"],
      metricasExito: ["Clientes High Ticket cerrados"],
      fechaLimite: sumarDias(hoy, 30),
      estado: "Activo",
      motivacion: "Esta es mi prioridad absoluta todos los días.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-facturar-1500"),
      titulo: "Facturar USD 1.500 el próximo mes",
      descripcion: "Primer hito de facturación dentro del plan de 90 días.",
      nivel: "Trimestral",
      area: "Finanzas",
      objetivoPadreId: uid("real-obj-flujo-caja"),
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Facturación mensual en USD"],
      fechaLimite: sumarDias(hoy, 30),
      estado: "Activo",
      motivacion: "Es el primer escalón hacia USD 4.000+ mensuales.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-publicidad-paga"),
      titulo: "Comenzar publicidad paga",
      descripcion: "Lanzar campañas de publicidad para acelerar la captación de clientes.",
      nivel: "Trimestral",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Campañas activas"],
      fechaLimite: sumarDias(hoy, 90),
      estado: "Activo",
      motivacion: "Necesito acelerar la adquisición de clientes más allá de la prospección manual.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-instagram-trimestral"),
      titulo: "Profesionalizar Instagram",
      descripcion: "Tener Instagram profesional para OpusWebs dentro de los próximos 90 días.",
      nivel: "Trimestral",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Instagram profesional activo"],
      fechaLimite: sumarDias(hoy, 90),
      estado: "Activo",
      motivacion: "Publicar contenido que genere confianza es parte de mi trabajo principal de venta.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-clientes-recurrentes-trimestral"),
      titulo: "Conseguir clientes recurrentes",
      descripcion: "Conseguir clientes de forma recurrente dentro de los próximos 90 días.",
      nivel: "Trimestral",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: ["real-habito-prospectar"],
      metricasExito: ["Clientes recurrentes"],
      fechaLimite: sumarDias(hoy, 90),
      estado: "Activo",
      motivacion: "La base de OpusWebs como motor financiero depende de tener ingresos recurrentes.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-pagar-deudas"),
      titulo: "Pagar todas mis deudas",
      descripcion: "Cancelar primero las deudas de USD 150 (Cami y Mamá). Luego afrontar las restantes (Hernán y Abuela).",
      nivel: "Trimestral",
      area: "Finanzas",
      objetivoPadreId: uid("real-obj-flujo-caja"),
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["Deuda total pendiente en USD"],
      fechaLimite: sumarDias(hoy, 90),
      estado: "Activo",
      motivacion: "No puedo construir el futuro con deudas pendientes de prioridad alta sin resolver.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-rutina-solida"),
      titulo: "Tener una rutina sólida nuevamente",
      descripcion: "Recuperar la rutina ideal: despertar 06:00, trabajo profundo, entrenamiento, lectura, meditación, revisión diaria, dormir antes de las 22:30.",
      nivel: "Trimestral",
      area: "Identidad",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: [
        "real-habito-levantarme",
        "real-habito-trabajo-profundo",
        "real-habito-entrenar",
        "real-habito-leer",
        "real-habito-meditar",
        "real-habito-planificar",
        "real-habito-dormir",
      ],
      metricasExito: ["Índice de consistencia de hábitos"],
      fechaLimite: sumarDias(hoy, 90),
      estado: "Activo",
      motivacion: "Soy una persona que ejecuta todos los días — eso empieza por la rutina.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-facturar-consistente-anual"),
      titulo: "Facturar de forma consistente",
      descripcion: "Dejar de depender de meses irregulares de ingresos.",
      nivel: "Anual",
      area: "Finanzas",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Facturación mensual en USD"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "La libertad financiera empieza con consistencia, no con picos aislados.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-escalar-facturacion-anual"),
      titulo: "Escalar facturación mensual: USD 1.500 → 2.500 → 4.000 → 6.000+",
      descripcion: "Progresión de facturación mensual objetivo a lo largo del año: USD 1.500 → USD 2.500 → USD 4.000 → USD 6.000+.",
      nivel: "Anual",
      area: "Finanzas",
      objetivoPadreId: uid("real-obj-facturar-consistente-anual"),
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Facturación mensual en USD"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Cada escalón financia el siguiente: publicidad, equipo, procesos.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-profesionalizar-opuswebs"),
      titulo: "Profesionalizar completamente OpusWebs",
      descripcion: "OpusWebs es el motor financiero y la prioridad número uno del ecosistema.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Procesos de OpusWebs documentados"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Todo el sistema debe reflejar que OpusWebs es mi prioridad número uno.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-campanias-publicidad-anual"),
      titulo: "Lanzar campañas de publicidad",
      descripcion: "Invertir constantemente en marketing y publicidad para acelerar el crecimiento.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Campañas activas"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Acelerar la adquisición de clientes más allá de la prospección manual.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-instagram-anual"),
      titulo: "Tener Instagram profesional",
      descripcion: "Instagram profesional de OpusWebs, parte de la prueba social para vender High Ticket.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: [],
      metricasExito: ["Instagram profesional activo"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Publicar contenido que genere confianza ayuda a cerrar ventas.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-clientes-recurrentes-anual"),
      titulo: "Conseguir clientes de forma recurrente",
      descripcion: "Pasar de ventas puntuales a una base de clientes recurrentes para OpusWebs.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_OPUSWEBS],
      habitosIds: ["real-habito-prospectar"],
      metricasExito: ["Clientes recurrentes"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "La recurrencia es lo que da estabilidad al motor financiero.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-escalar-vortex"),
      titulo: "Escalar Vortex",
      descripcion: "Vortex Control Phone ya está construido. Necesita marketing, publicidad y contenido constante, sin quitarle foco a OpusWebs.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_VORTEX],
      habitosIds: [],
      metricasExito: ["Usuarios activos de Vortex"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Vortex es mi proyecto secundario: debe avanzar constantemente sin frenar OpusWebs.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-lanzar-formacion"),
      titulo: "Lanzar mi formación",
      descripcion: "Formación de páginas web con IA: crear contenido, construir autoridad y generar ingresos adicionales.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [ID_PROYECTO_FORMACION],
      habitosIds: [],
      metricasExito: ["Formación lanzada"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Proyecto terciario: no debe quitar foco a OpusWebs ni a Vortex.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-delegar-operativa"),
      titulo: "Delegar tareas operativas",
      descripcion: "Dejar de ser el cuello de botella operativo del ecosistema.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["Tareas delegadas"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Mi objetivo es construir sistemas, procesos y equipos, no hacer todo yo.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-crear-procesos"),
      titulo: "Crear procesos",
      descripcion: "Documentar y sistematizar procesos para que el ecosistema funcione sin depender completamente de mí.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["Procesos documentados"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Sistemas y procesos son la base para escalar sin depender de mi tiempo.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
    {
      id: uid("real-obj-ahorrar-invertir"),
      titulo: "Ahorrar e invertir",
      descripcion: "Ahorrar e invertir constantemente una vez resuelto el flujo de caja inmediato.",
      nivel: "Anual",
      area: "Finanzas",
      objetivoPadreId: uid("real-obj-flujo-caja"),
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["USD ahorrados/invertidos"],
      fechaLimite: sumarDias(hoy, 365),
      estado: "Activo",
      motivacion: "Libertad financiera real, no solo sobrevivir con los ingresos del mes.",
      obstaculos: [],
      recursos: [],
      creadoEn: hoy,
    },
  ];

  const metas: Meta[] = [
    {
      id: "real-meta-facturacion-1500",
      nombre: "Facturación mensual en USD",
      objetivoId: uid("real-obj-facturar-1500"),
      area: "Finanzas",
      valorActual: 0,
      valorObjetivo: 1500,
      unidad: "USD",
      frecuencia: "mensual",
      historial: [{ fecha: hoy, valor: 0 }],
      fuente: "finanzas",
    },
    {
      id: "real-meta-escalar-facturacion",
      nombre: "Facturación mensual en USD (escalado anual)",
      objetivoId: uid("real-obj-escalar-facturacion-anual"),
      area: "Finanzas",
      valorActual: 0,
      valorObjetivo: 6000,
      unidad: "USD",
      frecuencia: "mensual",
      historial: [{ fecha: hoy, valor: 0 }],
      fuente: "finanzas",
    },
    {
      id: "real-meta-deuda-total",
      nombre: "Deuda total pendiente en USD",
      objetivoId: uid("real-obj-pagar-deudas"),
      area: "Finanzas",
      valorActual: 820,
      valorObjetivo: 0,
      unidad: "USD",
      frecuencia: "mensual",
      historial: [{ fecha: hoy, valor: 820 }],
      fuente: "finanzas",
    },
  ];

  const planSemanalActual: PlanSemanal = {
    id: "real-plan-semanal-1",
    semanaInicio: lunes,
    semanaFin: domingo,
    revisionAnterior: {
      queAvanzo: "Primera semana usando el sistema completo — todavía sin revisión anterior registrada.",
      queQuedoPendiente: "Sin datos previos.",
      queAprendiste: "Sin datos previos.",
      areaDescuidada: "Sin datos previos.",
    },
    foco: {
      objetivoPrincipal: "Conseguir flujo de caja",
      proyectoPrioritario: "OpusWebs",
      pendientePostergado: "Pagar las deudas de Cami y Mamá (USD 150 cada una)",
    },
    planificacion: {
      objetivosSemanaIds: [uid("real-obj-flujo-caja"), uid("real-obj-facturar-1500"), uid("real-obj-clientes-high-ticket")],
      proyectosActivosIds: [ID_PROYECTO_OPUSWEBS],
      bloqueoTiempo:
        "Lunes: Prospección. Ventas. Clientes.\n" +
        "Martes: Producción. Clientes. Instagram.\n" +
        "Miércoles: Prospección. Reuniones. Seguimientos.\n" +
        "Jueves: Clientes. Contenido. Publicidad.\n" +
        "Viernes: Cierre comercial. Seguimientos. Planificación.\n" +
        "Domingo: Revisión semanal. Objetivos. Finanzas. Rutina.",
      habitosPrioritarios: ["real-habito-prospectar", "real-habito-mensajes-comerciales", "real-habito-trabajo-profundo"],
    },
    preparacionMental: {
      preocupacion: "Que la falta de flujo de caja retrase pagar las deudas de Cami y Mamá.",
      porResolver: "Definir el plan de publicidad paga para OpusWebs.",
      comoQuiereSentirse: "Con flujo de caja resuelto y la rutina sólida otra vez.",
    },
    completado: false,
    creadoEn: hoy,
  };

  // ---------- IDENTIDAD: hábitos (sin historial inventado, arrancan desde cero) ----------
  function habitoNuevo(
    id: string,
    nombre: string,
    area: string,
    frecuencia: Habito["frecuencia"],
    horario: Habito["horario"],
    energia: Habito["energia"],
    motivacion: string,
    objetivo?: string
  ): Habito {
    return {
      id,
      nombre,
      area,
      objetivo,
      frecuencia,
      horario,
      energia,
      motivacion,
      mejorRacha: 0,
      mejorRachaFecha: null,
      historial: {},
    };
  }

  const habitos: Habito[] = [
    habitoNuevo("real-habito-levantarme", "Levantarme a las 06:00", "Identidad", { tipo: "diaria" }, "mañana", "Media", "Ganarle el día a la inercia, no empezarlo reaccionando."),
    habitoNuevo("real-habito-no-redes-despertar", "No usar redes sociales al despertar", "Mente", { tipo: "diaria" }, "mañana", "Baja", "Proteger el enfoque antes de que el ruido externo entre."),
    habitoNuevo("real-habito-agua", "Tomar agua apenas me levanto", "Salud", { tipo: "diaria" }, "mañana", "Baja", "La energía del día empieza con el cuerpo, no con la pantalla."),
    habitoNuevo("real-habito-trabajo-profundo", "Trabajo profundo", "Negocio", { tipo: "personalizada", diasSemana: [1, 2, 3, 4, 5] }, "mañana", "Alta", "Las horas de foco son las que mueven OpusWebs hacia adelante.", "Profesionalizar completamente OpusWebs"),
    habitoNuevo("real-habito-prospectar", "Prospectar clientes", "Negocio", { tipo: "personalizada", diasSemana: [1, 2, 3, 4, 5] }, "mañana", "Alta", "Mi trabajo principal no es programar ni diseñar. Mi trabajo principal es vender.", "Conseguir clientes High Ticket para OpusWebs"),
    habitoNuevo("real-habito-mensajes-comerciales", "Enviar mensajes comerciales", "Negocio", { tipo: "personalizada", diasSemana: [1, 2, 3, 4, 5] }, "tarde", "Media", "El seguimiento es lo que convierte prospección en ventas.", "Conseguir clientes High Ticket para OpusWebs"),
    habitoNuevo("real-habito-entrenar", "Entrenar", "Salud", { tipo: "diaria" }, "tarde", "Alta", "La energía es mi activo más importante. Sin salud no hay negocio."),
    habitoNuevo("real-habito-leer", "Leer", "Aprendizaje", { tipo: "diaria" }, "tarde", "Baja", "Cada libro es un atajo de experiencia ajena."),
    habitoNuevo("real-habito-meditar", "Meditar", "Mente", { tipo: "diaria" }, "tarde", "Baja", "Claridad mental antes de seguir ejecutando."),
    habitoNuevo("real-habito-escribir", "Escribir", "Mente", { tipo: "diaria" }, "tarde", "Media", "Pensar en papel antes de pensar en pantalla."),
    habitoNuevo("real-habito-planificar", "Planificar el día siguiente", "Identidad", { tipo: "diaria" }, "noche", "Baja", "El día que no planifico, el día siguiente empieza en caos.", "Tener una rutina sólida nuevamente"),
    habitoNuevo("real-habito-dormir", "Dormir antes de las 22:30", "Salud", { tipo: "diaria" }, "noche", "Baja", "Sin descanso no hay disciplina sostenible al día siguiente."),
  ];

  // ---------- MENTE: ideas ----------
  const ideas: Idea[] = [
    { id: "real-idea-escalar-opuswebs", titulo: "Escalar OpusWebs", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
    { id: "real-idea-automatizar-adquisicion", titulo: "Automatizar adquisición de clientes", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
    { id: "real-idea-mejorar-marketing", titulo: "Mejorar marketing", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
    { id: "real-idea-escalar-vortex", titulo: "Escalar Vortex", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
    { id: "real-idea-mejorar-formacion", titulo: "Mejorar la formación", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
    { id: "real-idea-delegar-contenido", titulo: "Delegar contenido", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
    { id: "real-idea-construir-sistemas", titulo: "Construir sistemas", descripcion: "", area: "Negocio", potencial: "Media", estado: "Nueva", origen: "Visión personal", fecha: hoy, accionesPosibles: [] },
  ];

  // ---------- FINANZAS: deudas ----------
  const deudas: Deuda[] = [
    { id: "real-deuda-cami", nombre: "Deuda con Cami", acreedor: "Cami", montoOriginal: 150, moneda: "USD", tasaInteresMensual: 0, cuotaMensual: 150, diaVencimiento: new Date(hoy + "T00:00:00").getDate(), fechaInicio: hoy, estado: "Activa", pagos: [] },
    { id: "real-deuda-mama", nombre: "Deuda con Mamá", acreedor: "Mamá", montoOriginal: 150, moneda: "USD", tasaInteresMensual: 0, cuotaMensual: 150, diaVencimiento: new Date(hoy + "T00:00:00").getDate(), fechaInicio: hoy, estado: "Activa", pagos: [] },
    { id: "real-deuda-hernan", nombre: "Deuda con Hernán", acreedor: "Hernán", montoOriginal: 450, moneda: "USD", tasaInteresMensual: 0, cuotaMensual: 450, diaVencimiento: new Date(sumarDias(hoy, 30) + "T00:00:00").getDate(), fechaInicio: hoy, estado: "Activa", pagos: [] },
    { id: "real-deuda-abuela", nombre: "Deuda con Abuela", acreedor: "Abuela", montoOriginal: 70, moneda: "USD", tasaInteresMensual: 0, cuotaMensual: 70, diaVencimiento: new Date(sumarDias(hoy, 30) + "T00:00:00").getDate(), fechaInicio: hoy, estado: "Activa", pagos: [] },
  ];

  // ---------- FINANZAS: cobros pendientes (sin inventar identidad de clientes) ----------
  const ingresos: Ingreso[] = [
    { id: "real-ing-1", fecha: hoy, monto: 200, moneda: "USD", clienteId: null, proyectoId: ID_PROYECTO_OPUSWEBS, categoria: "Cobro pendiente", recurrente: false, estado: "Pendiente" },
    { id: "real-ing-2", fecha: hoy, monto: 100, moneda: "USD", clienteId: null, proyectoId: ID_PROYECTO_OPUSWEBS, categoria: "Cobro pendiente", recurrente: false, estado: "Pendiente" },
    { id: "real-ing-3", fecha: hoy, monto: 100, moneda: "USD", clienteId: null, proyectoId: ID_PROYECTO_OPUSWEBS, categoria: "Cobro pendiente", recurrente: false, estado: "Pendiente" },
  ];

  // ---------- ACCIÓN: tareas de hoy ----------
  const tareas: Tarea[] = [
    {
      id: ID_TAREA_PROSPECTAR,
      titulo: "Prospectar nuevos clientes para OpusWebs",
      descripcion: "Mi trabajo principal es vender, no programar ni diseñar.",
      estado: "sin_empezar",
      prioridad: "Crítica",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Alta",
      tiempoEstimadoMin: 90,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_OPUSWEBS,
      objetivoId: uid("real-obj-clientes-high-ticket"),
      area: "Negocio",
      etiquetas: ["Estratégico"],
      dependenciasIds: [],
      fechaLimite: hoy,
      fechaProgramada: hoy,
      recurrencia: "diaria",
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_SEGUIMIENTO_PRESUPUESTOS,
      titulo: "Hacer seguimiento a presupuestos enviados",
      estado: "sin_empezar",
      prioridad: "Crítica",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Media",
      tiempoEstimadoMin: 45,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_OPUSWEBS,
      objetivoId: uid("real-obj-clientes-high-ticket"),
      area: "Negocio",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: hoy,
      fechaProgramada: hoy,
      recurrencia: "diaria",
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_MENSAJES_COMERCIALES,
      titulo: "Enviar mensajes comerciales de seguimiento",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Media",
      tiempoEstimadoMin: 45,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_OPUSWEBS,
      objetivoId: uid("real-obj-clientes-high-ticket"),
      area: "Negocio",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: hoy,
      fechaProgramada: hoy,
      recurrencia: "diaria",
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_INSTAGRAM,
      titulo: "Publicar contenido en Instagram de OpusWebs",
      descripcion: "Contenido que genere confianza para vender High Ticket.",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 60,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_OPUSWEBS,
      objetivoId: uid("real-obj-instagram-trimestral"),
      area: "Negocio",
      etiquetas: ["Creativo"],
      dependenciasIds: [],
      fechaLimite: hoy,
      fechaProgramada: hoy,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_PAGAR_CAMI,
      titulo: "Pagar deuda a Cami (USD 150)",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Baja",
      tiempoEstimadoMin: 10,
      tiempoRealMin: 0,
      proyectoId: null,
      objetivoId: uid("real-obj-pagar-deudas"),
      area: "Finanzas",
      etiquetas: ["Administrativo"],
      dependenciasIds: [],
      fechaLimite: sumarDias(hoy, 7),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_PAGAR_MAMA,
      titulo: "Pagar deuda a Mamá (USD 150)",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Baja",
      tiempoEstimadoMin: 10,
      tiempoRealMin: 0,
      proyectoId: null,
      objetivoId: uid("real-obj-pagar-deudas"),
      area: "Finanzas",
      etiquetas: ["Administrativo"],
      dependenciasIds: [],
      fechaLimite: sumarDias(hoy, 7),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_PLAN_PUBLICIDAD,
      titulo: "Definir plan de publicidad paga para OpusWebs",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Alto",
      urgencia: "Normal",
      energia: "Alta",
      tiempoEstimadoMin: 60,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_OPUSWEBS,
      objetivoId: uid("real-obj-publicidad-paga"),
      area: "Negocio",
      etiquetas: ["Estratégico"],
      dependenciasIds: [],
      fechaLimite: sumarDias(hoy, 14),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_VORTEX_MARKETING,
      titulo: "Avanzar marketing y contenido de Vortex",
      estado: "sin_empezar",
      prioridad: "Media",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 60,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_VORTEX,
      objetivoId: uid("real-obj-escalar-vortex"),
      area: "Negocio",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: null,
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
    {
      id: ID_TAREA_FORMACION_CONTENIDO,
      titulo: "Crear contenido para la formación de páginas web con IA",
      estado: "sin_empezar",
      prioridad: "Baja",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 60,
      tiempoRealMin: 0,
      proyectoId: ID_PROYECTO_FORMACION,
      objetivoId: uid("real-obj-lanzar-formacion"),
      area: "Negocio",
      etiquetas: ["Creativo"],
      dependenciasIds: [],
      fechaLimite: null,
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: hoy,
    },
  ];

  // ---------- Aplicar a los stores locales (Dirección, Identidad, Mente, Finanzas: 100% local) ----------
  useDireccionStore.setState({ vision, objetivos, metas, planesSemanales: [planSemanalActual] });
  useIdentidadStore.setState({ habitos, rutinas: [], revisiones: [], estadoHoy: {} });
  useMenteStore.setState({ bandeja: [], ideas, decisiones: [], notas: [] });
  useFinanzasStore.setState({
    ingresos,
    gastos: [],
    deudas,
    patrimonio: { activos: 0 },
    objetivos: {
      ahorroMensualTarget: 0,
      ingresoMensualTarget: 1500,
      fondoEmergenciaTarget: 0,
      fondoEmergenciaActual: 0,
      inversiones: [],
    },
  });

  // ---------- Acción: proyectos + tareas (cuenta real → también se sincronizan a Supabase) ----------
  useAccionStore.setState({ proyectos, tareas, archivos: [], eventosCalendario: [] });
  for (const p of proyectos) await syncCrearProyecto(p);
  for (const t of tareas) await syncCrearTarea(t);
}
