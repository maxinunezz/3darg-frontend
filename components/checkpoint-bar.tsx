// Barra de progreso de "checkpoints" (montos o cantidades) reusada por
// `product-promo-carousel.tsx` (ficha de producto) y `shipping-estimator.tsx`
// (carrito) — extraída a un archivo compartido para no duplicar la lógica
// entre los dos lugares.

/**
 * Mismo heurístico de "relleno visual" en los dos usos (a pedido del dueño:
 * la barra no es proporcional a la distancia real entre checkpoints, son
 * tramos equiespaciados con 3 posiciones de relleno fijas dentro del tramo
 * activo) — sirve para listas de 1-N checkpoints con cualquier `value`
 * numérico (monto o cantidad).
 */
export function tierBarPercent(sortedValues: number[], previewValue: number): { currentIdx: number; barPercent: number } {
  const n = sortedValues.length;
  let currentIdx = -1;
  for (let i = 0; i < n; i++) {
    if (previewValue >= sortedValues[i]) currentIdx = i;
  }
  if (currentIdx === n - 1) return { currentIdx, barPercent: 100 };
  const segmentIndex = currentIdx + 1;
  const localFill =
    currentIdx === -1 ? 0.5 : previewValue - 1 < sortedValues[currentIdx] ? 0.3 : 0.9;
  return { currentIdx, barPercent: ((segmentIndex + localFill) / n) * 100 };
}

export function CheckpointBar({
  sortedValues,
  previewValue,
  labelFor,
}: {
  sortedValues: number[];
  previewValue: number;
  labelFor: (value: number, reached: boolean) => React.ReactNode;
}) {
  const n = sortedValues.length;
  const { barPercent } = tierBarPercent(sortedValues, previewValue);
  return (
    <>
      <div className="relative h-2 mt-3">
        <div className="absolute inset-0 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${barPercent}%` }}
          />
        </div>
        {sortedValues.map((value, i) => (
          <span
            key={value}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-card z-10"
            style={{ left: `${((i + 1) / n) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative h-9 mt-1.5">
        {sortedValues.map((value, i) => {
          // El último checkpoint cae siempre en left:100% — centrarlo con
          // `-translate-x-1/2` hace que la mitad del label (ej. "Gratis a
          // domicilio" / "$120.000") quede fuera del contenedor y se vea
          // recortado contra el borde de la tarjeta. Para ese caso (y el
          // caso de un solo checkpoint, donde también cae en 100%) se ancla
          // al borde derecho en vez de centrarlo; el resto de los
          // checkpoints intermedios sigue centrado como antes.
          const isLast = i === n - 1;
          return (
            <div
              key={value}
              className={`absolute flex flex-col ${isLast ? "right-0 items-end text-right" : "-translate-x-1/2 items-center"}`}
              style={isLast ? undefined : { left: `${((i + 1) / n) * 100}%` }}
            >
              {labelFor(value, previewValue >= value)}
            </div>
          );
        })}
      </div>
    </>
  );
}
