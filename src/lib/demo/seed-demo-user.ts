import { useAccionStore } from "@/stores/accion-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useMenteStore } from "@/stores/mente-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { getHoyISO } from "@/lib/hoy";

import type { Proyecto, Tarea, EventoCalendario, Etiqueta } from "@/types/accion";
import type { Cliente, Oportunidad } from "@/types/negocio";
import type { Objetivo, Meta, PlanSemanal } from "@/types/direccion";
import type { Habito, EstadoHabitoDia, Revision } from "@/types/identidad";
import type { Idea, Decision } from "@/types/mente";
import type { Ingreso, Gasto } from "@/types/finanzas";

/**
 * El dataset fue redactado con "hoy" = 2025-06-25 como referencia.
 * Lo desplazamos para que siempre caiga sobre el día real en que se corre el seed,
 * preservando la distancia entre fechas (vencimientos futuros siguen futuros, etc.)
 * — así "Mi Día" / Centro de Control / Calendario muestran datos en las fechas correctas
 * sin importar cuándo se loguee la cuenta demo.
 */
const REF = "2025-06-25";

function crearDesplazador(hoy: string) {
  const refMs = new Date(REF + "T00:00:00").getTime();
  const hoyMs = new Date(hoy + "T00:00:00").getTime();
  const offsetMs = hoyMs - refMs;
  return (fechaISO: string) => getHoyISO(new Date(new Date(fechaISO + "T00:00:00").getTime() + offsetMs));
}

function sumarDias(fechaISO: string, dias: number): string {
  const d = new Date(fechaISO + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return getHoyISO(d);
}

const ETIQUETAS_VALIDAS: Record<string, Etiqueta> = {
  "estratégico": "Estratégico",
  "trabajo profundo": "Trabajo Profundo",
  "creativo": "Creativo",
  "administrativo": "Administrativo",
  "delegable": "Delegable",
};

function mapearEtiquetas(tags: string[]): Etiqueta[] {
  return tags.map((t) => ETIQUETAS_VALIDAS[t]).filter((t): t is Etiqueta => Boolean(t));
}

/** Genera un historial de hábito creíble: la racha actual + un patrón de consistencia en los últimos 28 días. */
function generarHistorialHabito(
  diasProgramados: number[] | "diaria",
  rachaActual: number,
  consistenciaObjetivo: number,
  completadoHoy: boolean,
  hoy: string
): Record<string, EstadoHabitoDia> {
  const estaProgramado = (fecha: string) => {
    if (diasProgramados === "diaria") return true;
    return diasProgramados.includes(new Date(fecha + "T00:00:00").getDay());
  };

  const programadas: string[] = [];
  for (let i = 1; i <= 56; i++) {
    const fecha = sumarDias(hoy, -i);
    if (estaProgramado(fecha)) programadas.push(fecha);
  }

  const historial: Record<string, EstadoHabitoDia> = {};
  const rachaHistorica = completadoHoy ? Math.max(0, rachaActual - 1) : rachaActual;

  for (let i = 0; i < rachaHistorica && i < programadas.length; i++) {
    historial[programadas[i]] = "completado";
  }
  if (rachaHistorica < programadas.length) {
    historial[programadas[rachaHistorica]] = "omitido";
  }

  const dentro28 = programadas.filter((fecha) => {
    const dias = Math.round(
      (new Date(hoy + "T00:00:00").getTime() - new Date(fecha + "T00:00:00").getTime()) / 86400000
    );
    return dias <= 27;
  });
  const totalVentana = dentro28.length + 1; // +1 por "hoy"
  const completadosYa = dentro28.filter((f) => historial[f] === "completado").length + (completadoHoy ? 1 : 0);
  let faltan = Math.max(0, Math.round((consistenciaObjetivo / 100) * totalVentana) - completadosYa);

  dentro28.forEach((fecha) => {
    if (historial[fecha]) return;
    if (faltan > 0) {
      historial[fecha] = "completado";
      faltan--;
    } else {
      historial[fecha] = "omitido";
    }
  });

  return historial;
}

export function aplicarSeedDemo() {
  const hoy = getHoyISO();
  const f = crearDesplazador(hoy);

  // ---------- NEGOCIO: clientes ----------
  const clientes: Cliente[] = [
    {
      id: "demo-cliente-parrilla",
      nombre: "Restaurante La Parrilla del Centro",
      empresa: "Restaurante La Parrilla del Centro",
      sector: "Gastronomía",
      email: "jorge@laparrilla.com.ar",
      telefono: "+54 11 4523-8891",
      estado: "Activo",
      notas: [
        "Contacto: Jorge Méndez. Cliente muy bueno, paga puntual. Quiere sumar TikTok en agosto.",
      ],
      archivos: [],
      reunionesRegistradas: 4,
      propuestasEnviadas: 1,
      proximaAccion: "Enviar reporte mensual de redes",
      proximaAccionFecha: f("2025-07-01"),
      ultimaInteraccion: f("2025-06-20"),
      creadoEn: f("2025-04-15"),
    },
    {
      id: "demo-cliente-ramirez",
      nombre: "Estudio Jurídico Ramírez & Asociados",
      empresa: "Estudio Jurídico Ramírez & Asociados",
      sector: "Legal",
      email: "lucia@ramirezestudio.com",
      telefono: "+54 11 5678-2341",
      estado: "Activo",
      notas: [
        "Contacto: Lucía Ramírez. Quieren un chatbot para consultas iniciales. Muy interesados en IA.",
      ],
      archivos: [],
      reunionesRegistradas: 3,
      propuestasEnviadas: 1,
      proximaAccion: "Presentar demo del chatbot",
      proximaAccionFecha: f("2025-06-28"),
      ultimaInteraccion: f("2025-06-18"),
      creadoEn: f("2025-05-01"),
    },
    {
      id: "demo-cliente-sonrisa",
      nombre: "Clínica Dental Sonrisa",
      empresa: "Clínica Dental Sonrisa",
      sector: "Salud",
      email: "andrea@clinicasonrisa.com.ar",
      telefono: "+54 351 445-7823",
      estado: "Activo",
      notas: [
        "Contacto: Dra. Andrea Flores. Cliente nueva, viene de una mala experiencia con otra agencia. Hay que demostrar resultados rápido.",
      ],
      archivos: [],
      reunionesRegistradas: 2,
      propuestasEnviadas: 1,
      proximaAccion: "Llamada de seguimiento de resultados",
      proximaAccionFecha: f("2025-06-30"),
      ultimaInteraccion: f("2025-06-15"),
      creadoEn: f("2025-05-20"),
    },
    {
      id: "demo-cliente-modoropa",
      nombre: "E-commerce ModoRopa",
      empresa: "ModoRopa",
      sector: "E-commerce",
      email: "seba@modoropa.com",
      telefono: "+54 11 2234-5567",
      estado: "Prospecto",
      notas: [
        "Contacto: Sebastián Torres. Interesado en automatizar su post-venta con IA. Tercera reunión la próxima semana.",
      ],
      archivos: [],
      reunionesRegistradas: 2,
      propuestasEnviadas: 0,
      proximaAccion: "Enviar propuesta final",
      proximaAccionFecha: f("2025-06-27"),
      ultimaInteraccion: f("2025-06-21"),
      creadoEn: f("2025-06-05"),
    },
  ];

  const oportunidades: Oportunidad[] = [
    {
      id: "demo-oportunidad-modoropa",
      clienteId: "demo-cliente-modoropa",
      titulo: "Automatizaciones + Email marketing + Meta Ads — ModoRopa",
      valorEstimado: 650,
      probabilidad: 65,
      fechaEstimadaCierre: f("2025-07-05"),
      estado: "Negociación",
      creadaEn: f("2025-06-05"),
      cerradaEn: null,
    },
  ];

  // ---------- ACCIÓN: proyectos ----------
  const proyectos: Proyecto[] = [
    {
      id: "demo-proyecto-parrilla",
      nombre: "Web + RRSS La Parrilla del Centro",
      area: "Negocio",
      tipo: "Cliente",
      clienteId: "demo-cliente-parrilla",
      progreso: 85,
      fechaLimite: f("2025-07-15"),
      estado: "en_curso",
    },
    {
      id: "demo-proyecto-ramirez",
      nombre: "Chatbot WhatsApp Ramírez & Asociados",
      area: "Negocio",
      tipo: "Cliente",
      clienteId: "demo-cliente-ramirez",
      progreso: 40,
      fechaLimite: f("2025-07-30"),
      estado: "en_curso",
    },
    {
      id: "demo-proyecto-sonrisa",
      nombre: "Presencia digital Clínica Sonrisa",
      area: "Negocio",
      tipo: "Cliente",
      clienteId: "demo-cliente-sonrisa",
      progreso: 25,
      fechaLimite: f("2025-08-30"),
      estado: "en_curso",
    },
    {
      id: "demo-proyecto-saas",
      nombre: "SaaS Personal — Axiom Mind (mi producto)",
      area: "Negocio",
      tipo: "Propio",
      clienteId: null,
      progreso: 30,
      fechaLimite: f("2025-10-01"),
      estado: "en_curso",
    },
    {
      id: "demo-proyecto-contenido",
      nombre: "Sistema de contenido orgánico",
      area: "Negocio",
      tipo: "Propio",
      clienteId: null,
      progreso: 15,
      fechaLimite: f("2025-08-01"),
      estado: "pausado",
    },
  ];

  // ---------- DIRECCIÓN: objetivos + metas ----------
  const objetivos: Objetivo[] = [
    {
      id: "demo-obj-ingresos-anual",
      titulo: "Generar USD 4.000/mes en ingresos recurrentes",
      descripcion: "Pasar de los USD 1.120 actuales a USD 4.000 mensuales antes de diciembre.",
      nivel: "Anual",
      area: "Finanzas",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["Ingresos mensuales en USD"],
      fechaLimite: f("2025-12-31"),
      estado: "Activo",
      motivacion: "Quiero independencia económica real, no solo \"sobrevivir\" con mis ingresos.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-05-01"),
    },
    {
      id: "demo-obj-saas-anual",
      titulo: "Lanzar mi primer producto SaaS",
      descripcion: "Tener Axiom Mind en versión beta pública con primeros 50 usuarios pagos.",
      nivel: "Anual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: ["demo-proyecto-saas"],
      habitosIds: [],
      metricasExito: ["Usuarios pagos en beta"],
      fechaLimite: f("2025-12-01"),
      estado: "Activo",
      motivacion: "Quiero tener ingresos que no dependan de cambiar tiempo por dinero.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-05-01"),
    },
    {
      id: "demo-obj-salud-anual",
      titulo: "Construir cuerpo y energía sostenible",
      descripcion: "Entrenar 4 veces por semana consistentemente. Bajar 6kg. Tener energía alta la mayor parte del tiempo.",
      nivel: "Anual",
      area: "Salud",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: ["demo-habito-entrenamiento"],
      metricasExito: ["Sesiones de entrenamiento por semana"],
      fechaLimite: f("2025-12-31"),
      estado: "Activo",
      motivacion: "La energía es mi activo más importante. Sin salud no hay negocio.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-04-25"),
    },
    {
      id: "demo-obj-clientes-trimestral",
      titulo: "Cerrar 2 clientes nuevos antes de agosto",
      descripcion: "Agregar 2 clientes recurrentes que sumen mínimo USD 500/mes combinados.",
      nivel: "Trimestral",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: ["demo-habito-prospeccion"],
      metricasExito: ["Nuevos clientes cerrados"],
      fechaLimite: f("2025-08-31"),
      estado: "Activo",
      motivacion: "Necesito base estable antes de dedicar más tiempo al SaaS.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-05-25"),
    },
    {
      id: "demo-obj-modulos-trimestral",
      titulo: "Terminar módulos core de Axiom Mind",
      descripcion: "Tener Centro de Control, Acción, Identidad, Dirección y Negocio funcionando.",
      nivel: "Trimestral",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: ["demo-proyecto-saas"],
      habitosIds: ["demo-habito-trabajo-profundo"],
      metricasExito: ["Módulos completados"],
      fechaLimite: f("2025-09-30"),
      estado: "Activo",
      motivacion: "El producto no puede existir solo en mi cabeza.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-05-25"),
    },
    {
      id: "demo-obj-ahorro-trimestral",
      titulo: "Ahorrar USD 1.500 este trimestre",
      descripcion: "Separar USD 500/mes mínimo para fondo de emergencia.",
      nivel: "Trimestral",
      area: "Finanzas",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["USD ahorrados"],
      fechaLimite: f("2025-09-30"),
      estado: "Activo",
      motivacion: "No puedo construir el futuro sin seguridad financiera mínima.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-05-25"),
    },
    {
      id: "demo-obj-modoropa-mensual",
      titulo: "Cerrar propuesta ModoRopa",
      descripcion: "Firmar contrato con el cliente de e-commerce antes del 5 de julio.",
      nivel: "Mensual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: [],
      metricasExito: ["Propuesta firmada"],
      fechaLimite: f("2025-07-05"),
      estado: "Activo",
      motivacion: "Es el cliente de mayor ticket que tengo en pipeline.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-06-10"),
    },
    {
      id: "demo-obj-demo-chatbot-mensual",
      titulo: "Entregar demo chatbot a Ramírez",
      descripcion: "Demo funcional del chatbot WhatsApp lista para mostrar al cliente.",
      nivel: "Mensual",
      area: "Negocio",
      objetivoPadreId: null,
      proyectosIds: ["demo-proyecto-ramirez"],
      habitosIds: [],
      metricasExito: ["Demo entregada"],
      fechaLimite: f("2025-07-10"),
      estado: "Activo",
      motivacion: "Si el demo impresiona, me van a referir a otros estudios jurídicos.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-06-15"),
    },
    {
      id: "demo-obj-lectura-mensual",
      titulo: "Leer 2 libros este mes",
      descripcion: "Terminar \"El Método Lean Startup\" y empezar \"Zero to One\".",
      nivel: "Mensual",
      area: "Aprendizaje",
      objetivoPadreId: null,
      proyectosIds: [],
      habitosIds: ["demo-habito-lectura"],
      metricasExito: ["Libros leídos"],
      fechaLimite: f("2025-07-31"),
      estado: "Activo",
      motivacion: "Quiero entender mejor cómo construir productos, no solo ejecutar.",
      obstaculos: [],
      recursos: [],
      creadoEn: f("2025-06-01"),
    },
  ];

  const metas: Meta[] = [
    {
      id: "demo-meta-ingresos",
      nombre: "Ingresos mensuales en USD",
      objetivoId: "demo-obj-ingresos-anual",
      area: "Finanzas",
      valorActual: 1120,
      valorObjetivo: 4000,
      unidad: "USD",
      frecuencia: "mensual",
      historial: [
        { fecha: f("2025-05-31"), valor: 980 },
        { fecha: f("2025-06-25"), valor: 1120 },
      ],
      fuente: "finanzas",
    },
    {
      id: "demo-meta-saas",
      nombre: "Módulos core completados",
      objetivoId: "demo-obj-saas-anual",
      area: "Negocio",
      valorActual: 2,
      valorObjetivo: 5,
      unidad: "módulos",
      frecuencia: "mensual",
      historial: [{ fecha: f("2025-06-25"), valor: 2 }],
      fuente: "manual",
    },
    {
      id: "demo-meta-salud",
      nombre: "Sesiones de entrenamiento por semana",
      objetivoId: "demo-obj-salud-anual",
      area: "Salud",
      valorActual: 3,
      valorObjetivo: 4,
      unidad: "sesiones/semana",
      frecuencia: "semanal",
      historial: [{ fecha: f("2025-06-25"), valor: 3 }],
      fuente: "identidad",
    },
    {
      id: "demo-meta-clientes",
      nombre: "Nuevos clientes cerrados",
      objetivoId: "demo-obj-clientes-trimestral",
      area: "Negocio",
      valorActual: 1,
      valorObjetivo: 2,
      unidad: "clientes",
      frecuencia: "mensual",
      historial: [{ fecha: f("2025-06-25"), valor: 1 }],
      fuente: "manual",
    },
    {
      id: "demo-meta-modulos",
      nombre: "Módulos completados",
      objetivoId: "demo-obj-modulos-trimestral",
      area: "Negocio",
      valorActual: 2,
      valorObjetivo: 5,
      unidad: "módulos",
      frecuencia: "mensual",
      historial: [{ fecha: f("2025-06-25"), valor: 2 }],
      fuente: "manual",
    },
    {
      id: "demo-meta-ahorro",
      nombre: "USD ahorrados",
      objetivoId: "demo-obj-ahorro-trimestral",
      area: "Finanzas",
      valorActual: 300,
      valorObjetivo: 1500,
      unidad: "USD",
      frecuencia: "mensual",
      historial: [{ fecha: f("2025-06-25"), valor: 300 }],
      fuente: "finanzas",
    },
    {
      id: "demo-meta-lectura",
      nombre: "Libros leídos",
      objetivoId: "demo-obj-lectura-mensual",
      area: "Aprendizaje",
      valorActual: 1,
      valorObjetivo: 2,
      unidad: "libros",
      frecuencia: "mensual",
      historial: [{ fecha: f("2025-06-25"), valor: 1 }],
      fuente: "manual",
    },
  ];

  const planesSemanales: PlanSemanal[] = [
    {
      id: "demo-plan-semanal-1",
      semanaInicio: f("2025-06-16"),
      semanaFin: f("2025-06-22"),
      revisionAnterior: {
        queAvanzo:
          "Cerré el primer mes con Clínica Sonrisa. Avancé 40% en el chatbot de Ramírez. Entrené 3 de 3 días planeados.",
        queQuedoPendiente: "No arranqué la propuesta de ModoRopa. No prospecté nuevos clientes.",
        queAprendiste:
          "El trabajo profundo en las mañanas es lo que más resultados me da. Las tardes son para reuniones y admin.",
        areaDescuidada: "Relaciones",
      },
      foco: {
        objetivoPrincipal: "Foco total en la propuesta ModoRopa y en avanzar el chatbot.",
        proyectoPrioritario: "Chatbot WhatsApp Ramírez & Asociados",
        pendientePostergado: "Enviar propuesta final a ModoRopa",
      },
      planificacion: {
        objetivosSemanaIds: ["demo-obj-modoropa-mensual", "demo-obj-demo-chatbot-mensual"],
        proyectosActivosIds: ["demo-proyecto-ramirez", "demo-proyecto-parrilla"],
        bloqueoTiempo: "9:00 a 11:00, todos los días, bloque de trabajo profundo.",
        habitosPrioritarios: ["demo-habito-entrenamiento", "demo-habito-trabajo-profundo"],
      },
      preparacionMental: {
        preocupacion: "Que ModoRopa se enfríe si no respondo rápido.",
        porResolver: "Definir los 3 paquetes de servicio antes de escribir la propuesta.",
        comoQuiereSentirse: "Con la propuesta afuera y el chatbot funcionando de punta a punta.",
      },
      completado: true,
      creadoEn: f("2025-06-22"),
    },
    {
      id: "demo-plan-semanal-2",
      semanaInicio: f("2025-06-09"),
      semanaFin: f("2025-06-15"),
      revisionAnterior: {
        queAvanzo: "Empecé a estudiar WhatsApp API. Publiqué 12 posts entre los 3 clientes.",
        queQuedoPendiente: "Axiom Mind sin tocar toda la semana. Me comí la semana en tareas de clientes.",
        queAprendiste: "Cuando no bloqueo tiempo para mi producto, los clientes ocupan todo.",
        areaDescuidada: "Aprendizaje y Propósito",
      },
      foco: {
        objetivoPrincipal: "Retomar Axiom Mind. Mínimo 2hs diarias de trabajo en el producto.",
        proyectoPrioritario: "SaaS Personal — Axiom Mind",
        pendientePostergado: "Estudiar documentación de WhatsApp Business API",
      },
      planificacion: {
        objetivosSemanaIds: ["demo-obj-modulos-trimestral"],
        proyectosActivosIds: ["demo-proyecto-saas"],
        bloqueoTiempo: "Mañanas completas para el producto, tardes para clientes.",
        habitosPrioritarios: ["demo-habito-trabajo-profundo"],
      },
      preparacionMental: {
        preocupacion: "Perder el ritmo con los clientes actuales si me corro a construir el producto.",
        porResolver: "Nada urgente.",
        comoQuiereSentirse: "Avanzando en ambos frentes sin sentir que abandono ninguno.",
      },
      completado: true,
      creadoEn: f("2025-06-15"),
    },
  ];

  // ---------- IDENTIDAD: hábitos ----------
  const habitosBase: { habito: Habito; racha: number; consistencia: number; completadoHoy: boolean }[] = [
    {
      habito: {
        id: "demo-habito-entrenamiento",
        nombre: "Entrenamiento",
        area: "Salud",
        objetivo: "Construir cuerpo y energía sostenible",
        frecuencia: { tipo: "personalizada", diasSemana: [1, 3, 5] },
        horario: "mañana",
        energia: "Alta",
        motivacion: "Sin energía no hay claridad. Sin claridad no hay ejecución.",
        mejorRacha: 7,
        mejorRachaFecha: f("2025-05-10"),
        historial: {},
      },
      racha: 4,
      consistencia: 78,
      completadoHoy: false,
    },
    {
      habito: {
        id: "demo-habito-lectura",
        nombre: "Lectura",
        area: "Aprendizaje",
        objetivo: "Leer 2 libros este mes",
        frecuencia: { tipo: "diaria" },
        horario: "noche",
        energia: "Baja",
        motivacion: "Cada libro es un atajo de 10 años de experiencia ajena.",
        mejorRacha: 21,
        mejorRachaFecha: f("2025-05-20"),
        historial: {},
      },
      racha: 12,
      consistencia: 83,
      completadoHoy: true,
    },
    {
      habito: {
        id: "demo-habito-revision-diaria",
        nombre: "Revisión diaria",
        area: "Mente",
        frecuencia: { tipo: "diaria" },
        horario: "noche",
        energia: "Baja",
        motivacion: "El día que no reviso, el día siguiente empieza en caos.",
        mejorRacha: 14,
        mejorRachaFecha: f("2025-06-02"),
        historial: {},
      },
      racha: 8,
      consistencia: 70,
      completadoHoy: false,
    },
    {
      habito: {
        id: "demo-habito-trabajo-profundo",
        nombre: "Bloque de trabajo profundo",
        area: "Negocio",
        objetivo: "Terminar módulos core de Axiom Mind",
        frecuencia: { tipo: "personalizada", diasSemana: [1, 2, 3, 4, 5, 6] },
        horario: "mañana",
        energia: "Alta",
        motivacion: "Las horas de foco valen 4 veces más que las horas fragmentadas.",
        mejorRacha: 10,
        mejorRachaFecha: f("2025-06-05"),
        historial: {},
      },
      racha: 6,
      consistencia: 65,
      completadoHoy: true,
    },
    {
      habito: {
        id: "demo-habito-meditacion",
        nombre: "Meditación",
        area: "Mente",
        frecuencia: { tipo: "diaria" },
        horario: "mañana",
        energia: "Baja",
        motivacion: "El hábito que más me cuesta y el que más me da cuando lo hago.",
        mejorRacha: 9,
        mejorRachaFecha: f("2025-04-28"),
        historial: {},
      },
      racha: 2,
      consistencia: 40,
      completadoHoy: false,
    },
    {
      habito: {
        id: "demo-habito-prospeccion",
        nombre: "Prospección activa",
        area: "Negocio",
        objetivo: "Cerrar 2 clientes nuevos antes de agosto",
        frecuencia: { tipo: "personalizada", diasSemana: [1, 2, 4] },
        horario: "tarde",
        energia: "Media",
        motivacion: "Si no prospecto hoy, no tengo clientes en 3 meses.",
        mejorRacha: 5,
        mejorRachaFecha: f("2025-05-15"),
        historial: {},
      },
      racha: 3,
      consistencia: 55,
      completadoHoy: false,
    },
  ];

  const habitos: Habito[] = habitosBase.map(({ habito, racha, consistencia, completadoHoy }) => ({
    ...habito,
    historial: generarHistorialHabito(
      habito.frecuencia.tipo === "personalizada" ? habito.frecuencia.diasSemana : "diaria",
      racha,
      consistencia,
      completadoHoy,
      hoy
    ),
  }));

  const estadoHoy: Record<string, EstadoHabitoDia> = {
    "demo-habito-entrenamiento": "pendiente",
    "demo-habito-lectura": "completado",
    "demo-habito-revision-diaria": "pendiente",
    "demo-habito-trabajo-profundo": "completado",
    "demo-habito-meditacion": "pendiente",
    "demo-habito-prospeccion": "pendiente",
  };

  const revisionesDiarias: Revision[] = [
    {
      id: "demo-revision-1",
      tipo: "diaria",
      fecha: f("2025-06-24"),
      respuestas: {
        "¿Qué logré?": "Avancé el flujo de mensajes del chatbot de Ramírez y entrené.",
        "¿Qué quedó pendiente?": "La propuesta de ModoRopa.",
        "¿Qué aprendí?": "Make tiene más límites de los que pensaba para WhatsApp Business API.",
        "¿Cómo estuvo mi energía?": "Alta a la mañana, bajó bastante después de las 15hs.",
        "¿Qué hago mañana?": "Bloquear la mañana para terminar la propuesta de ModoRopa.",
      },
      creadaEn: f("2025-06-24"),
    },
    {
      id: "demo-revision-2",
      tipo: "diaria",
      fecha: f("2025-06-23"),
      respuestas: {
        "¿Qué logré?": "Reunión con Clínica Sonrisa, quedaron conformes con el avance.",
        "¿Qué quedó pendiente?": "Configurar Google Ads, lo dejé para esta semana.",
        "¿Qué aprendí?": "Mostrar resultados parciales calma mucho a un cliente nuevo.",
        "¿Cómo estuvo mi energía?": "Media, dormí poco.",
        "¿Qué hago mañana?": "Avanzar el chatbot de Ramírez.",
      },
      creadaEn: f("2025-06-23"),
    },
    {
      id: "demo-revision-3",
      tipo: "diaria",
      fecha: f("2025-06-22"),
      respuestas: {
        "¿Qué logré?": "Cerré el plan semanal y entrené.",
        "¿Qué quedó pendiente?": "Prospección — no contacté a nadie nuevo.",
        "¿Qué aprendí?": "Necesito bloquear la prospección como un hábito, no como algo que hago \"si llego\".",
        "¿Cómo estuvo mi energía?": "Alta todo el día.",
        "¿Qué hago mañana?": "Arrancar la semana con foco en ModoRopa y el chatbot.",
      },
      creadaEn: f("2025-06-22"),
    },
  ];

  // ---------- MENTE: ideas y decisiones ----------
  const ideas: Idea[] = [
    {
      id: "demo-idea-starter",
      titulo: "Crear un paquete de \"starter digital\" para pymes",
      descripcion:
        "Web básica + Google My Business + Instagram + WhatsApp Business configurado. Todo en 7 días. Precio fijo USD 800.",
      area: "Negocio",
      potencial: "Alta",
      estado: "En análisis",
      origen: "Bandeja mental",
      fecha: f("2025-06-20"),
      accionesPosibles: ["Definir alcance exacto", "Armar precio y términos"],
    },
    {
      id: "demo-idea-newsletter",
      titulo: "Newsletter semanal sobre IA para emprendedores",
      descripcion:
        "Curar las 3 herramientas de IA más útiles de la semana + caso de uso práctico. Construir audiencia propia.",
      area: "Negocio",
      potencial: "Alta",
      estado: "Nueva",
      origen: "Bandeja mental",
      fecha: f("2025-06-15"),
      accionesPosibles: [],
    },
    {
      id: "demo-idea-onboarding",
      titulo: "Sistema de onboarding automatizado para mis clientes",
      descripcion:
        "Cuando cierro un cliente, automatizar: contrato → factura → acceso a Drive → primer reunión agendada. Con Make.",
      area: "Negocio",
      potencial: "Media",
      estado: "Nueva",
      origen: "Bandeja mental",
      fecha: f("2025-06-12"),
      accionesPosibles: [],
    },
    {
      id: "demo-idea-consultoria",
      titulo: "Ofrecer consultoría de IA como servicio premium",
      descripcion:
        "Sesiones 1:1 de 2hs donde ayudo a empresas a identificar qué procesos pueden automatizar con IA. USD 200/sesión.",
      area: "Negocio",
      potencial: "Alta",
      estado: "En análisis",
      origen: "Bandeja mental",
      fecha: f("2025-06-08"),
      accionesPosibles: ["Armar pitch de la sesión", "Conseguir 2 clientes piloto"],
    },
    {
      id: "demo-idea-cordoba",
      titulo: "Mudarme a Córdoba en 2026",
      descripcion: "Menor costo de vida, mejor calidad de vida. Investigar barrios y costos antes de decidir.",
      area: "Propósito",
      potencial: "Alta",
      estado: "Nueva",
      origen: "Bandeja mental",
      fecha: f("2025-06-05"),
      accionesPosibles: [],
    },
  ];

  const decisiones: Decision[] = [
    {
      id: "demo-decision-pagos",
      problema: "¿Integro Stripe o Mercado Pago como primer procesador de pagos para Axiom Mind?",
      opciones: [
        {
          nombre: "Stripe",
          pros: ["Mejor DX, más robusto", "Preparado para escalar internacionalmente"],
          contras: ["Menos conocido en Argentina", "Requiere cuenta en USD"],
        },
        {
          nombre: "Mercado Pago",
          pros: ["El público LATAM ya lo conoce", "Menor fricción de conversión"],
          contras: ["API más limitada", "Fees más altos en algunos casos"],
        },
        {
          nombre: "Ambos desde el inicio",
          pros: ["Cubre todo el mercado"],
          contras: ["Doble mantenimiento", "Doble implementación"],
        },
      ],
      impacto: "Alto",
      costoRiesgo: "Elegir mal retrasa el lanzamiento del SaaS varias semanas.",
      estado: "Abierta",
      fechaLimite: f("2025-07-10"),
      creadaEn: f("2025-06-14"),
    },
    {
      id: "demo-decision-branding",
      problema: "¿Contrato un diseñador para mejorar el branding de mis servicios o lo hago yo con IA?",
      opciones: [
        {
          nombre: "Contratar freelance",
          pros: ["Resultado profesional", "Ahorro de tiempo"],
          contras: ["Costo USD 300-500", "Tiempo de coordinación"],
        },
        {
          nombre: "Yo mismo con Midjourney + Canva",
          pros: ["Costo cero", "Aprendo en el proceso"],
          contras: ["Resultado puede ser mediocre", "Consume tiempo"],
        },
        {
          nombre: "No cambiar nada por ahora",
          pros: ["Foco en lo que importa ahora"],
          contras: ["El branding actual no me representa bien"],
        },
      ],
      impacto: "Medio",
      costoRiesgo: "Bajo, pero la indecisión prolongada sí cuesta — imagen poco profesional frente a clientes nuevos.",
      estado: "Abierta",
      fechaLimite: f("2025-07-20"),
      creadaEn: f("2025-06-16"),
    },
  ];

  // ---------- ACCIÓN: tareas ----------
  const obj = (titulo: string) => objetivos.find((o) => o.titulo === titulo)?.id ?? null;

  const tareas: Tarea[] = [
    {
      id: "demo-tarea-modoropa",
      titulo: "Enviar propuesta final a ModoRopa",
      descripcion: "Propuesta con 3 paquetes de servicio. Incluir casos de éxito y proyección de ROI.",
      estado: "en_progreso",
      prioridad: "Crítica",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Alta",
      tiempoEstimadoMin: 120,
      tiempoRealMin: 50,
      proyectoId: null,
      objetivoId: obj("Cerrar propuesta ModoRopa"),
      area: "Negocio",
      etiquetas: mapearEtiquetas(["estratégico"]),
      dependenciasIds: [],
      fechaLimite: f("2025-06-27"),
      fechaProgramada: hoy,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-21"),
    },
    {
      id: "demo-tarea-chatbot-flujo",
      titulo: "Terminar flujo de mensajes del chatbot WhatsApp",
      descripcion: "Completar el árbol de decisión para consultas sobre divorcios y herencias. Probar con Make.",
      estado: "sin_empezar",
      prioridad: "Crítica",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Alta",
      tiempoEstimadoMin: 180,
      tiempoRealMin: 0,
      proyectoId: "demo-proyecto-ramirez",
      objetivoId: obj("Entregar demo chatbot a Ramírez"),
      area: "Negocio",
      etiquetas: mapearEtiquetas(["trabajo profundo"]),
      dependenciasIds: [],
      fechaLimite: f("2025-07-03"),
      fechaProgramada: hoy,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-16"),
    },
    {
      id: "demo-tarea-posts-parrilla",
      titulo: "Crear 8 posts de Instagram para La Parrilla",
      descripcion: "Contenido de julio: 4 fotos de platos, 2 reels de cocina, 2 stories promocionales.",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 90,
      tiempoRealMin: 0,
      proyectoId: "demo-proyecto-parrilla",
      objetivoId: null,
      area: "Negocio",
      etiquetas: mapearEtiquetas(["creativo"]),
      dependenciasIds: [],
      fechaLimite: f("2025-06-30"),
      fechaProgramada: hoy,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-20"),
    },
    {
      id: "demo-tarea-direccion-modulo",
      titulo: "Implementar módulo de Dirección en Axiom Mind",
      descripcion: "Objetivos, metas, plan semanal y revisión mensual.",
      estado: "en_progreso",
      prioridad: "Alta",
      impacto: "Alto",
      urgencia: "Normal",
      energia: "Alta",
      tiempoEstimadoMin: 480,
      tiempoRealMin: 210,
      proyectoId: "demo-proyecto-saas",
      objetivoId: obj("Terminar módulos core de Axiom Mind"),
      area: "Negocio",
      etiquetas: mapearEtiquetas(["trabajo profundo", "estratégico"]),
      dependenciasIds: [],
      fechaLimite: f("2025-07-15"),
      fechaProgramada: hoy,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-01"),
    },
    {
      id: "demo-tarea-ads-sonrisa",
      titulo: "Configurar Google Ads para Clínica Sonrisa",
      descripcion:
        "Campaña de búsqueda para \"dentista Córdoba\" + \"blanqueamiento dental\". Presupuesto inicial: USD 150/mes.",
      estado: "sin_empezar",
      prioridad: "Alta",
      impacto: "Alto",
      urgencia: "Alta",
      energia: "Media",
      tiempoEstimadoMin: 120,
      tiempoRealMin: 0,
      proyectoId: "demo-proyecto-sonrisa",
      objetivoId: null,
      area: "Negocio",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: f("2025-07-02"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-22"),
    },
    {
      id: "demo-tarea-reporte-parrilla",
      titulo: "Armar reporte mensual de redes La Parrilla",
      descripcion: "PDF con métricas de junio: alcance, engagement, seguidores nuevos, posts top.",
      estado: "sin_empezar",
      prioridad: "Media",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Baja",
      tiempoEstimadoMin: 60,
      tiempoRealMin: 0,
      proyectoId: "demo-proyecto-parrilla",
      objetivoId: null,
      area: "Negocio",
      etiquetas: mapearEtiquetas(["administrativo"]),
      dependenciasIds: [],
      fechaLimite: f("2025-07-01"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-23"),
    },
    {
      id: "demo-tarea-whatsapp-api",
      titulo: "Estudiar documentación de WhatsApp Business API",
      descripcion: "Entender los límites de mensajes, templates aprobados y flujos de verificación.",
      estado: "en_progreso",
      prioridad: "Media",
      impacto: "Alto",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 90,
      tiempoRealMin: 45,
      proyectoId: "demo-proyecto-ramirez",
      objetivoId: null,
      area: "Aprendizaje",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: f("2025-06-28"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-10"),
    },
    {
      id: "demo-tarea-libro-lean",
      titulo: "Terminar \"El Método Lean Startup\"",
      descripcion: "Me quedan los últimos 3 capítulos. Tomar notas sobre MVP y validación.",
      estado: "en_progreso",
      prioridad: "Media",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Baja",
      tiempoEstimadoMin: 45,
      tiempoRealMin: 20,
      proyectoId: null,
      objetivoId: obj("Leer 2 libros este mes"),
      area: "Aprendizaje",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: f("2025-07-10"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-18"),
    },
    {
      id: "demo-tarea-ahorro",
      titulo: "Separar USD 500 para fondo de ahorro",
      descripcion: "Transferir al broker antes del 5 de julio para mantener el objetivo trimestral.",
      estado: "sin_empezar",
      prioridad: "Media",
      impacto: "Alto",
      urgencia: "Normal",
      energia: "Baja",
      tiempoEstimadoMin: 10,
      tiempoRealMin: 0,
      proyectoId: null,
      objetivoId: obj("Ahorrar USD 1.500 este trimestre"),
      area: "Finanzas",
      etiquetas: mapearEtiquetas(["administrativo"]),
      dependenciasIds: [],
      fechaLimite: f("2025-07-05"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-24"),
    },
    {
      id: "demo-tarea-contenido-calendario",
      titulo: "Armar calendario editorial de agosto",
      descripcion: "Retomar el sistema de contenido propio cuando baje la carga de clientes.",
      estado: "sin_empezar",
      prioridad: "Baja",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 60,
      tiempoRealMin: 0,
      proyectoId: "demo-proyecto-contenido",
      objetivoId: null,
      area: "Negocio",
      etiquetas: mapearEtiquetas(["creativo"]),
      dependenciasIds: [],
      fechaLimite: f("2025-08-01"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-10"),
    },
    {
      id: "demo-tarea-dominio",
      titulo: "Renovar dominio axiommind.app",
      descripcion: "Vence el 12 de julio. Renovar por 2 años en Namecheap.",
      estado: "sin_empezar",
      prioridad: "Baja",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Baja",
      tiempoEstimadoMin: 10,
      tiempoRealMin: 0,
      proyectoId: "demo-proyecto-saas",
      objetivoId: null,
      area: "Negocio",
      etiquetas: mapearEtiquetas(["administrativo", "delegable"]),
      dependenciasIds: [],
      fechaLimite: f("2025-07-12"),
      fechaProgramada: null,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: f("2025-06-15"),
    },
  ];

  // Trabajo ya hecho en estos 2 meses (historial real detrás del % de avance de cada proyecto).
  function tareaCompletada(
    id: string,
    titulo: string,
    proyectoId: string,
    fecha: string,
    tiempoMin: number
  ): Tarea {
    return {
      id,
      titulo,
      estado: "completado",
      prioridad: "Media",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: tiempoMin,
      tiempoRealMin: tiempoMin,
      proyectoId,
      objetivoId: null,
      area: "Negocio",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: fecha,
      fechaProgramada: fecha,
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: fecha,
    };
  }

  const tareasHistoricas: Tarea[] = [
    tareaCompletada("demo-hist-parrilla-1", "Diseñar nueva identidad visual", "demo-proyecto-parrilla", f("2025-04-22"), 180),
    tareaCompletada("demo-hist-parrilla-2", "Maquetar y publicar sitio web", "demo-proyecto-parrilla", f("2025-05-05"), 360),
    tareaCompletada("demo-hist-parrilla-3", "Configurar Google My Business", "demo-proyecto-parrilla", f("2025-05-10"), 45),
    tareaCompletada("demo-hist-parrilla-4", "Configurar Meta Business Suite", "demo-proyecto-parrilla", f("2025-05-12"), 60),
    tareaCompletada("demo-hist-parrilla-5", "Contenido de mayo (4 posts + 2 reels)", "demo-proyecto-parrilla", f("2025-05-28"), 150),
    tareaCompletada("demo-hist-parrilla-6", "Primera quincena de contenido de junio", "demo-proyecto-parrilla", f("2025-06-14"), 120),
    tareaCompletada("demo-hist-ramirez-1", "Definir alcance y flujos del chatbot", "demo-proyecto-ramirez", f("2025-05-20"), 90),
    tareaCompletada("demo-hist-ramirez-2", "Levantar preguntas frecuentes del estudio", "demo-proyecto-ramirez", f("2025-05-28"), 60),
    tareaCompletada("demo-hist-sonrisa-1", "Diseñar y publicar sitio web", "demo-proyecto-sonrisa", f("2025-06-02"), 240),
    tareaCompletada("demo-hist-saas-1", "Diseñar arquitectura de datos y stores", "demo-proyecto-saas", f("2025-05-15"), 180),
    tareaCompletada("demo-hist-contenido-1", "Definir línea editorial y pilares de contenido", "demo-proyecto-contenido", f("2025-06-03"), 90),
  ];

  const eventosCalendario: EventoCalendario[] = [
    { id: "demo-evento-1", titulo: "Bloque de trabajo profundo", fecha: hoy, horaInicio: "09:00", horaFin: "11:00", tipo: "bloque_foco" },
    { id: "demo-evento-2", titulo: "Llamada de seguimiento — La Parrilla", fecha: hoy, horaInicio: "16:30", horaFin: "17:00", tipo: "evento" },
  ];

  // ---------- FINANZAS ----------
  const ingresos: Ingreso[] = [
    { id: "demo-ing-1", fecha: f("2025-05-07"), monto: 350, moneda: "USD", clienteId: "demo-cliente-parrilla", proyectoId: "demo-proyecto-parrilla", categoria: "Gestión mensual", recurrente: true, estado: "Cobrado" },
    { id: "demo-ing-2", fecha: f("2025-05-12"), monto: 480, moneda: "USD", clienteId: "demo-cliente-ramirez", proyectoId: "demo-proyecto-ramirez", categoria: "Retainer mensual", recurrente: true, estado: "Cobrado" },
    { id: "demo-ing-3", fecha: f("2025-05-20"), monto: 800, moneda: "USD", clienteId: "demo-cliente-sonrisa", proyectoId: "demo-proyecto-sonrisa", categoria: "Setup inicial + primer mes", recurrente: false, estado: "Cobrado" },
    { id: "demo-ing-4", fecha: f("2025-06-05"), monto: 350, moneda: "USD", clienteId: "demo-cliente-parrilla", proyectoId: "demo-proyecto-parrilla", categoria: "Gestión mensual", recurrente: true, estado: "Cobrado" },
    { id: "demo-ing-5", fecha: f("2025-06-10"), monto: 480, moneda: "USD", clienteId: "demo-cliente-ramirez", proyectoId: "demo-proyecto-ramirez", categoria: "Retainer mensual", recurrente: true, estado: "Cobrado" },
    { id: "demo-ing-6", fecha: f("2025-06-18"), monto: 290, moneda: "USD", clienteId: "demo-cliente-sonrisa", proyectoId: "demo-proyecto-sonrisa", categoria: "Mes 1 servicio", recurrente: true, estado: "Cobrado" },
    { id: "demo-ing-7", fecha: f("2025-07-05"), monto: 350, moneda: "USD", clienteId: "demo-cliente-parrilla", proyectoId: "demo-proyecto-parrilla", categoria: "Gestión julio", recurrente: true, estado: "Pendiente" },
    { id: "demo-ing-8", fecha: f("2025-07-10"), monto: 480, moneda: "USD", clienteId: "demo-cliente-ramirez", proyectoId: "demo-proyecto-ramirez", categoria: "Retainer julio", recurrente: true, estado: "Pendiente" },
    { id: "demo-ing-9", fecha: f("2025-07-15"), monto: 290, moneda: "USD", clienteId: "demo-cliente-sonrisa", proyectoId: "demo-proyecto-sonrisa", categoria: "Gestión julio", recurrente: true, estado: "Pendiente" },
  ];

  const gastos: Gasto[] = [
    { id: "demo-gasto-1", fecha: f("2025-06-01"), monto: 29, moneda: "USD", categoria: "Supabase Pro", areaVida: "Negocio", tipo: "Fijo" },
    { id: "demo-gasto-2", fecha: f("2025-06-01"), monto: 20, moneda: "USD", categoria: "Vercel Pro", areaVida: "Negocio", tipo: "Fijo" },
    { id: "demo-gasto-3", fecha: f("2025-06-01"), monto: 20, moneda: "USD", categoria: "Claude API", areaVida: "Negocio", tipo: "Fijo" },
    { id: "demo-gasto-4", fecha: f("2025-06-05"), monto: 15, moneda: "USD", categoria: "Make.com", areaVida: "Negocio", tipo: "Fijo" },
    { id: "demo-gasto-5", fecha: f("2025-06-10"), monto: 180, moneda: "USD", categoria: "Gimnasio mensual", areaVida: "Salud", tipo: "Fijo" },
    { id: "demo-gasto-6", fecha: f("2025-06-15"), monto: 45, moneda: "USD", categoria: "Curso Make + WhatsApp API", areaVida: "Aprendizaje", tipo: "Variable" },
    { id: "demo-gasto-7", fecha: f("2025-06-20"), monto: 200, moneda: "USD", categoria: "Gastos varios del mes", areaVida: "Relaciones", tipo: "Variable" },
  ];

  // ---------- Aplicar a los stores (reemplaza todo, idempotente) ----------
  useNegocioStore.setState({ clientes, oportunidades });

  useAccionStore.setState({
    tareas: [...tareas, ...tareasHistoricas],
    proyectos,
    archivos: [],
    eventosCalendario,
  });

  useDireccionStore.setState({ objetivos, metas, planesSemanales });

  useIdentidadStore.setState({ habitos, estadoHoy, revisiones: revisionesDiarias, rutinas: [] });

  useMenteStore.setState({ bandeja: [], ideas, decisiones, notas: [] });

  useFinanzasStore.setState({
    ingresos,
    gastos,
    deudas: [],
    patrimonio: { activos: 4500 },
    objetivos: {
      ahorroMensualTarget: 500,
      ingresoMensualTarget: 4000,
      fondoEmergenciaTarget: 1500,
      fondoEmergenciaActual: 300,
      inversiones: [],
    },
  });
}
