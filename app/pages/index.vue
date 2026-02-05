<template>
  <div class="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-4">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
      <!-- TIMELINE -->
      <section class="lg:col-span-5">
        <UCard class="shadow-xl">
          <UTimeline
            orientation="horizontal"
            v-model="value"
            :items="items"
            size="3xl"
            class="w-full"
          />
        </UCard>
      </section>

      <!-- UPLOAD -->
      <section class="lg:col-span-1 self-start">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Visitas Diarias</h2>
          </template>

          <UFileUpload
            v-model="visitasDiarias"
            class="w-full min-h-48"
            accept=".xlsx"
            label="Arrastre o haga clic"
            description=".xlsx (plantilla oficial)"
            @change="() => (isvisitasDiariasUP = false)"
          />

          <template #footer>
            <div class="flex items-center justify-between gap-2">
              <!-- Acción principal -->
              <UButton
                color="primary"
                label="Subir"
                @click="uploadVisitas"
                :disabled="isvisitasDiariasUP"
              />

              <!-- Acciones secundarias -->
              <div class="flex gap-2">
                <UButton
                  color="neutral"
                  variant="soft"
                  label="Reset"
                  @click="resetVisitas"
                />

                <UButton
                  color="neutral"
                  size="sm"
                  variant="soft"
                  icon="i-lucide-download"
                  label="Plantilla"
                  @click="downloadTemplate"
                />
              </div>
            </div>
          </template>
        </UCard>
      </section>

      <!-- TABLA CON SCROLL -->
      <section class="lg:col-span-3 row-span-2 h-[70vh] min-h-0">
        <UCard class="h-full flex flex-col min-h-0">
          <div class="pb-2 text-sm font-semibold text-gray-300">Visitantes</div>

          <div class="flex-1 min-h-0 overflow-auto">
            <UTable :data="visitantes" />
          </div>
        </UCard>
      </section>

      <!-- APROBADOR / FECHAS -->
      <section class="lg:col-span-1 self-start">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Aprobador</h2>
          </template>

          <div class="grid gap-4">
            <UFormField label="Seleccionar">
              <USelect v-model="app1" :items="aprobadores" />
            </UFormField>

            <UFormField label="Hora de entrada">
              <UInputTime :default-value="entradaD" :hour-cycle="24" disabled />
            </UFormField>

            <UFormField label="Hora de salida">
              <UInputTime :default-value="salidaD" :hour-cycle="24" disabled />
            </UFormField>

            <UFormField label="Fecha de visita">
              <UInputDate v-model="fecha" disabled />
            </UFormField>

            <UButton
              color="primary"
              size="lg"
              block
              icon="i-lucide-send"
              label="Enviar solicitud"
              @click="sendServer"
            />
          </div>
        </UCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineItem } from "@nuxt/ui";
import { Time } from "@internationalized/date";
import { parseDate, CalendarDate } from "@internationalized/date";
const toast = useToast();

/* =========================
 * STATE PRINCIPAL
 * ========================= */

// Archivo cargado
const visitasDiarias = ref<File | null>(null);

// Flags de control UI
const isvisitasDiariasUP = ref(true);
const subirVisitasDiarias = ref(true);

// Paso actual del timeline
const value = ref<number>(0);

// Timeout para avanzar el timeline
const stepdelay = ref<number | null>(null);

// Datos de la visita (UI trabaja con Date)
const entrada = ref<Date | null>(null);
const salida = ref<Date | null>(null);
const fecha = ref<CalendarDate | null>(null);
const entradaD = shallowRef(new Time(8, 0, 0));
const salidaD = shallowRef(new Time(18, 0, 0));

// Datos generales
const visitantes = ref<any[]>([]);
const url = ref<string>("");

/* =========================
 * CONSTANTES
 * ========================= */

const aprobadores = [
  "Abraham Guajardo",
  "Agustin Lutterbach",
  "Ailen Aguilera",
  "Alexis Ruiz",
  "Alexis Zeballos",
  "Alvaro Olguin",
  "Andres Osorio",
  "Boris Santander",
  "Carla Dagorret",
  "Carlo Barrera",
  "Carolina Rodriguez",
  "Clara Chois",
  "Claudio Diaz Rivas",
  "Constanza Herrera",
  "Cristian Arevalo",
  "Cristian Diaz",
  "Daniel Canales",
  "Daniel Contreras",
  "David Levio",
  "Eduardo Bernales Heldt",
  "Engelberth Silva",
  "Enzo Muñoz",
  "Esteban Gonzalez",
  "Fabiola Ordonez",
  "Felipe Araya",
  "Felipe Cespedes",
  "Felipe Muñoz",
  "Flor Diaz Mallea",
  "Francisco Leon",
  "Gustavo Meza Flores",
  "Gustavo Tamayo Reyes",
  "Hector Gonzalez Vasquez",
  "Hernan Estay Gonzalez",
  "Ivan Roa Guzman",
  "Javier Jara",
  "Jose Gutierrez Caceres",
  "Jose Miguel Retamales",
  "Jose Santomingo",
  "Juan Fernandez del Valle",
  "Juan Lopez",
  "Juan Oviedo Bonilla",
  "Judith Garate",
  "Karen Rojas",
  "Karin Boisset",
  "Katherine Quelopana",
  "Luis Garay Contreras",
  "Manuel Denis",
  "Marcel Garcia",
  "Marcelo Moreira",
  "Marcelo Reyes",
  "Margarett San Martin",
  "Maria Flores Rios",
  "Matias Espinoza",
  "Mauricio Reyes",
  "Nilda Carcamo Matilla",
  "Oscar Jara Ortiz",
  "Pablo Leon",
  "Pablo Riquelme",
  "Pablo Tapia Villarroel",
  "Patricia Saldias",
  "Paulo Queiroz",
  "Pia Roman",
  "Renato Diaz",
  "Ricardo Mateluna",
  "Robin Pavez",
  "Rodolfo Villalobos",
  "Rodrigo Diaz",
  "Rodrigo Rubilar",
  "Sebastian Perez V.",
  "Sebastian Vergara",
  "Sergio Quezada Pichihual",
  "Solange Sepulveda",
  "Stephanie Quiroz",
  "Wagner De Souza",
  "Wehendy Maciel",
  "Ximena Pizarro",
];

// Aprobador seleccionado
const app1 = ref<string>(aprobadores[0]);

// Timeline
const items = ref<TimelineItem[]>([
  {
    title: "Carga Plantilla",
    description: "Cargar plantilla de visitas diarias",
    icon: "i-lucide-upload",
  },
  {
    title: "Verificación Datos",
    description: "Verifica los datos cargados",
    icon: "i-lucide-check-square",
  },
  {
    title: "Solicitar autorización",
    description: "Selecciona el aprobador y envía solicitud",
    icon: "i-lucide-send",
  },
]);

/* =========================
 * HELPERS
 * ========================= */

// Convierte "HH:mm" → Date
function parseTime(time: string): Date {
  const [hRaw, mRaw] = time.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

useHead({
  title: "Gestor de Visitas Diarias",
  meta: [
    {
      name: "description",
      content:
        "Aplicación para gestionar visitas diarias mediante carga de plantillas y solicitudes de aprobación.",
    },
  ],
});

/* =========================
 * ACTIONS
 * ========================= */

async function uploadVisitas() {
  if (!visitasDiarias.value) return;

  const formData = new FormData();
  formData.append("file", visitasDiarias.value);
  formData.append("approver", app1.value);

  try {
    const response: any = await $fetch("/api/visitas", {
      method: "POST",
      body: formData,
    });

    // Estado UI
    isvisitasDiariasUP.value = true;
    subirVisitasDiarias.value = false;
    visitasDiarias.value = null;

    // Datos recibidos
    visitantes.value = response.visitors;
    url.value = response.url;

    // Conversión correcta para inputs
    entrada.value = parseTime(response.inHour);
    salida.value = parseTime(response.outHour);
    fecha.value = response.date ? parseDate(response.date) : null;
    console.log(response.date);

    // Avanza el timeline
    value.value = response.step;

    // Auto avance al paso final
    stepdelay.value = window.setTimeout(() => {
      value.value = 2;
    }, 5000);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function sendServer() {
  const payload = {
    url: url.value,
    approver: app1.value,
    inHour: entrada.value?.toISOString(),
    outHour: salida.value?.toISOString(),
    date: fecha.value?.toString(),
  };

  const data = await $fetch("/api/sendData", {
    method: "POST",
    body: payload,
  });

  toast.add({
    title: "Acceso Solicitado",
    description: `Accesos solicitados correctamente al aprobador ${app1.value}.`,
    icon: "i-lucide-calendar-days",
  });
  resetVisitas();
}

function resetVisitas() {
  visitasDiarias.value = null;
  visitantes.value = [];
  value.value = 0;
  fecha.value = null;

  if (stepdelay.value) {
    clearTimeout(stepdelay.value);
    stepdelay.value = null;
  }
}

function downloadTemplate() {
  const link = document.createElement("a");
  link.href = "/plantilla-visitas.xlsx";
  link.download = "plantilla-visitas.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>
