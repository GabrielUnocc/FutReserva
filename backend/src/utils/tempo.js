// src/utils/tempo.js

// Calcula a duração de um intervalo "HH:MM" - "HH:MM" em horas
function calcularDuracaoHoras(horaInicio, horaFim) {
  const [hIni, mIni] = horaInicio.split(':').map(Number)
  const [hFim, mFim] = horaFim.split(':').map(Number)
  return (hFim * 60 + mFim - (hIni * 60 + mIni)) / 60
}

module.exports = { calcularDuracaoHoras }
