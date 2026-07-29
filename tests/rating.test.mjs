import test from "node:test";
import assert from "node:assert/strict";
import { weightedRate, evaluateOffer, verificationAgeInDays } from
  "../src/lib/rating.ts";

const D = (s) => new Date(s);

function inst(id, over = {}) {
  return {
    id, name: `Banco ${id}`, shortName: id, kind: "banco",
    active: true, weight: 1, order: 0, updatedAt: D("2026-01-01"),
    ...over,
  };
}

function offer(id, institutionId, over = {}) {
  return {
    id, institutionId, product: "hipotecario",
    annualRate: 10, minAmount: 1_000_000, maxAmount: 100_000_000,
    minMonths: 12, maxMonths: 360, minIncome: "r1",
    acceptedEmployment: ["publico", "privado", "independiente"],
    active: true, verifiedAt: D("2026-07-01"), updatedAt: D("2026-07-01"),
    ...over,
  };
}

const applicant = {
  product: "hipotecario", employment: "privado", income: "r3",
  amount: 50_000_000, months: 240,
};

test("sin ofertas elegibles devuelve null (el simulador cae a la tasa de ejemplo)", () => {
  assert.equal(weightedRate([], [], applicant), null);
  const o = offer("o1", "a", { product: "personal" });
  assert.equal(weightedRate([o], [inst("a")], applicant), null);
});

test("una sola oferta elegible devuelve su propia tasa", () => {
  const r = weightedRate([offer("o1", "a", { annualRate: 8.5 })], [inst("a")], applicant);
  assert.equal(r.rate, 8.5);
  assert.equal(r.count, 1);
});

test("pesos iguales producen el promedio simple", () => {
  const offers = [
    offer("o1", "a", { annualRate: 8 }),
    offer("o2", "b", { annualRate: 12 }),
  ];
  const r = weightedRate(offers, [inst("a"), inst("b")], applicant);
  assert.equal(r.rate, 10);
  assert.equal(r.count, 2);
});

test("el peso inclina el promedio hacia la institución con convenio", () => {
  const offers = [
    offer("o1", "a", { annualRate: 8 }),
    offer("o2", "b", { annualRate: 12 }),
  ];
  // a pesa 3, b pesa 1 -> (8*3 + 12*1) / 4 = 9
  const r = weightedRate(offers, [inst("a", { weight: 3 }), inst("b")], applicant);
  assert.equal(r.rate, 9);
});

test("un peso de 0 o negativo se trata como neutro, no como exclusión silenciosa", () => {
  const offers = [
    offer("o1", "a", { annualRate: 8 }),
    offer("o2", "b", { annualRate: 12 }),
  ];
  const r = weightedRate(offers, [inst("a", { weight: 0 }), inst("b", { weight: -5 })], applicant);
  assert.equal(r.rate, 10, "debe seguir siendo el promedio simple");
  assert.equal(r.count, 2);
});

test("filtra por situación laboral", () => {
  const o = offer("o1", "a", { acceptedEmployment: ["publico"] });
  assert.equal(weightedRate([o], [inst("a")], applicant), null);
  const ok = { ...applicant, employment: "publico" };
  assert.equal(weightedRate([o], [inst("a")], ok).count, 1);
});

test("el tramo de ingreso declarado debe alcanzar el mínimo exigido", () => {
  const exigente = offer("o1", "a", { minIncome: "r4" });
  assert.equal(weightedRate([exigente], [inst("a")], applicant), null,
    "r3 no alcanza un mínimo de r4");

  const holgada = offer("o2", "a", { minIncome: "r2" });
  assert.equal(weightedRate([holgada], [inst("a")], applicant).count, 1,
    "r3 supera un mínimo de r2");

  const exacta = offer("o3", "a", { minIncome: "r3" });
  assert.equal(weightedRate([exacta], [inst("a")], applicant).count, 1,
    "r3 cumple un mínimo de r3");
});

test("filtra por rango de monto y de plazo", () => {
  assert.equal(weightedRate([offer("o1", "a", { maxAmount: 10_000_000 })], [inst("a")], applicant), null);
  assert.equal(weightedRate([offer("o2", "a", { minAmount: 90_000_000 })], [inst("a")], applicant), null);
  assert.equal(weightedRate([offer("o3", "a", { maxMonths: 120 })], [inst("a")], applicant), null);
  assert.equal(weightedRate([offer("o4", "a", { minMonths: 300 })], [inst("a")], applicant), null);
});

test("una oferta o institución inactiva queda fuera", () => {
  assert.equal(weightedRate([offer("o1", "a", { active: false })], [inst("a")], applicant), null);
  assert.equal(weightedRate([offer("o1", "a")], [inst("a", { active: false })], applicant), null);
});

test("una oferta cuya institución no existe se descarta sin romper", () => {
  assert.equal(weightedRate([offer("o1", "fantasma")], [inst("a")], applicant), null);
});

test("reporta la mejor tasa y quién la ofrece", () => {
  const offers = [
    offer("o1", "a", { annualRate: 11 }),
    offer("o2", "b", { annualRate: 7.9 }),
    offer("o3", "c", { annualRate: 9 }),
  ];
  const r = weightedRate(offers, [inst("a"), inst("b"), inst("c")], applicant);
  assert.equal(r.bestRate, 7.9);
  assert.equal(r.bestInstitution, "b");
});

test("la vigencia la marca la verificación más antigua", () => {
  const offers = [
    offer("o1", "a", { verifiedAt: D("2026-07-20") }),
    offer("o2", "b", { verifiedAt: D("2026-03-05") }),
  ];
  const r = weightedRate(offers, [inst("a"), inst("b")], applicant);
  assert.deepEqual(r.oldestVerification, D("2026-03-05"));
  assert.equal(verificationAgeInDays(r.oldestVerification, D("2026-07-29")), 146);
});

test("evaluateOffer acumula todos los motivos de exclusión, no solo el primero", () => {
  const mala = offer("o1", "a", {
    acceptedEmployment: ["publico"], minIncome: "r5", maxAmount: 1_000_000, maxMonths: 24,
  });
  const m = evaluateOffer(mala, inst("a"), applicant);
  assert.equal(m.eligible, false);
  assert.deepEqual(m.reasons.sort(), ["empleo", "ingreso", "monto", "plazo"]);
});

test("la tasa se redondea a dos decimales", () => {
  const offers = [
    offer("o1", "a", { annualRate: 8.333 }),
    offer("o2", "b", { annualRate: 9.111 }),
  ];
  const r = weightedRate(offers, [inst("a"), inst("b")], applicant);
  assert.equal(r.rate, 8.72);
});
