// --- CONFIG FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCboVzkc0qiaKCoTbbY8SZhfeozdUxmqxk",
  authDomain: "projetiot-d4d14.firebaseapp.com",
  projectId: "projetiot-d4d14",
  storageBucket: "projetiot-d4d14.firebasestorage.app",
  messagingSenderId: "561560484720",
  appId: "1:561560484720:web:34d2a71a851692d8f7edb5",
  databaseURL: "https://projetiot-d4d14-default-rtdb.firebaseio.com",
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let tempChart, humChart, gasChart;

// --- MISE À JOUR DES GRAPHIQUES ---
function updateCharts(labels, tempData, humData, gasData) {
  if (tempChart) tempChart.destroy();
  if (humChart) humChart.destroy();
  if (gasChart) gasChart.destroy();

  // Température
  tempChart = new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Température (°C)",
          data: tempData,
          borderColor: "red",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
  });

  // Humidité
  const latestHumidity = humData[humData.length - 1];
  humChart = new Chart(document.getElementById("humidityChart"), {
    type: "pie",
    data: {
      labels: ["Humidité", "Air restant"],
      datasets: [
        {
          data: [latestHumidity, 100 - latestHumidity],
          backgroundColor: ["blue", "#ccc"],
        },
      ],
    },
  });

  // Gaz
  gasChart = new Chart(document.getElementById("gasChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Niveau de Gaz",
          data: gasData,
          backgroundColor: gasData.map((v) => (v > 300 ? "red" : "green")),
        },
      ],
    },
  });

  // Affichage valeurs actuelles
  document.getElementById("tempValue").textContent = tempData.at(-1);
  document.getElementById("humValue").textContent = humData.at(-1);
  document.getElementById("gasValue").textContent = gasData.at(-1);
}

// --- LECTURE DES CAPTEURS ---
db.ref("sensors").on("value", (snapshot) => {
  const data = snapshot.val();
  const labels = [],
    tempData = [],
    humData = [],
    gasData = [];

  for (let t in data) {
    labels.push(new Date(Number(t)).toLocaleTimeString());
    tempData.push(data[t].temperature);
    humData.push(data[t].humidity);
    gasData.push(data[t].gas);
  }

  updateCharts(labels, tempData, humData, gasData);
});

// --- ENVOI COMMANDE VIA FIREBASE ---
function sendCommand(cmd) {
  db.ref("command")
    .set(cmd)
    .then(() => console.log("Commande envoyée :", cmd))
    .catch((err) => console.error("Erreur :", err));
}

// --- ÉVÈNEMENTS BOUTONS ---
document
  .getElementById("buttonA")
  .addEventListener("click", () => sendCommand("a"));
document
  .getElementById("buttonB")
  .addEventListener("click", () => sendCommand("b"));
document
  .getElementById("buttonC")
  .addEventListener("click", () => sendCommand("c"));
document
  .getElementById("backButton")
  .addEventListener("click", () => sendCommand("init"));
