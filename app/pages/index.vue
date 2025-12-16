<template>
  <div
    class="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 grid-rows-[auto_auto_1fr_auto]"
  >
    <!-- TIMELINE -->
    <div class="col-span-5 flex justify-center">
      <div
        class="w-full max-w-7xl border-2 border-gray-700 p-8 rounded-xl shadow-lg"
      >
        <UTimeline
          orientation="horizontal"
          v-model="value"
          :items="items"
          size="3xl"
          class="w-full"
        />
      </div>
    </div>

    <!-- VISITAS DIARIAS -->
    <div class="row-start-2 row-span-1 self-start">
      <UCard class="w-auto">
        <template #header>
          <h1 class="text-lg font-semibold">VISITAS DIARIAS</h1>
        </template>

        <div class="flex justify-center">
          <UFileUpload
            v-model="visitasDiarias"
            class="w-96 min-h-48"
            accept=".xlsx"
            label="Arrastre y suelte el archivo aquí o haga clic"
            description=".xlsx (Plantilla visitas diarias)"
            @change="() => (isvisitasDiariasUP = false)"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="primary"
              label="Subir"
              @click="uploadVisitas"
              :disabled="isvisitasDiariasUP"
            />
            <UButton color="neutral" label="Reset" @click="resetVisitas" />
          </div>
        </template>
      </UCard>
    </div>

    <!-- TABLA (ÚNICO DIV QUE CRECE) -->
    <div
      class="col-span-3 row-start-2 row-span-2 border-2 border-gray-700 p-4 rounded-lg h-full overflow-auto"
    >
      <UTable :data="visitantes" class="pt-4" />
    </div>

    <!-- APROBADOR -->
    <div
      class="col-start-5 row-start-2 row-span-1 border-2 border-gray-700 p-4 rounded-lg self-start"
    >
      <UContainer class="grid gap-4">
        <UFormField label="Aprobador">
          <USelect v-model="app1" :items="aprobadores" />
        </UFormField>

        <UButton
          color="primary"
          label="Subir Visitas Diarias"
          @click="sendServer"
          :disabled="subirVisitasDiarias"
        />
      </UContainer>
    </div>

    <!-- FOOTER / PLACEHOLDERS -->
    <div class="col-span-2 row-start-4">5</div>

    <div class="col-span-3 col-start-3 row-start-4">6</div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineItem } from "@nuxt/ui";

const visitasDiarias = ref(null);
const isvisitasDiariasUP = ref(true);
const subirVisitasDiarias = ref(true);
const value = ref(0);

// Constantes
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
const items = ref<TimelineItem[]>([
  {
    title: "Carga Plantilla",
    description: "Cargar plantilla de visitas diarias",
    icon: "i-lucide-upload",
  },
  {
    title: "Verificación Datos",
    description: "Verifica los datos cargados.",
    icon: "i-lucide-check-square",
  },
  {
    title: "Solicitar autorizacion",
    description: "Selecciona el aprobador de la visita. y envia solicitud.",
    icon: "i-lucide-send",
  },
]);

//Variables
const app1 = ref(aprobadores[0]);
const visitantes = ref([]);
const url = ref("");

async function uploadVisitas() {
  // Logic to handle file upload
  const formData = new FormData();
  formData.append("file", visitasDiarias.value);
  formData.append("approver", app1.value);
  try {
    const response = await $fetch("/api/visitas", {
      method: "POST",
      body: formData,
    });
    console.log("File uploaded successfully:", response);
    isvisitasDiariasUP.value = true;
    visitasDiarias.value = null;
    visitantes.value = response.visitors;
    url.value = response.url;
    subirVisitasDiarias.value = false;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function sendServer() {
  const formData = new FormData();
  formData.append("url", url.value);
  const data = await $fetch("/api/sendData", {
    method: "POST",
    body: formData,
  });
  console.log("Data sent to server:", data);
}

function resetVisitas() {
  visitasDiarias.value = null;
  console.log("CN41N file input reset");
}
</script>
