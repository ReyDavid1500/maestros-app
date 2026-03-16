/**
 * Formatea un número como precio en pesos chilenos.
 * Ejemplo: 35000 → "$35.000"
 */
export const formatCLP = (amount: number): string => {
  return `$${amount.toLocaleString("es-CL")}`;
};
